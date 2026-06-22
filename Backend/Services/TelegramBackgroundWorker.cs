using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Concurrent;

namespace Backend.Services
{
    public class TelegramBackgroundWorker : BackgroundService
    {
        private readonly TelegramSyncQueue _queue;
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<TelegramBackgroundWorker> _logger;

        private readonly ConcurrentDictionary<string, SemaphoreSlim> _locks = new();
        private int _processedCount;

        /// <summary>
        /// How often to clean up unused semaphores from the _locks dictionary.
        /// </summary>
        private const int LockCleanupInterval = 100;

        public TelegramBackgroundWorker(TelegramSyncQueue queue, IServiceProvider serviceProvider, ILogger<TelegramBackgroundWorker> logger)
        {
            _queue = queue;
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // ── Startup reconciliation ──────────────────────────────
            // Re-enqueue published entities that have no TelegramMessageMapping.
            // Only runs if at least one mapping already exists (avoids flooding on first-ever deployment).
            await ReconcileMissingMappingsAsync(stoppingToken);

            // ── Main processing loop ────────────────────────────────
            await foreach (var job in _queue.ReadAllAsync(stoppingToken))
            {
                var lockKey = $"{job.EntityType}_{job.EntityId}";
                var semaphore = _locks.GetOrAdd(lockKey, _ => new SemaphoreSlim(1, 1));
                await semaphore.WaitAsync(stoppingToken);

                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    var telegramService = scope.ServiceProvider.GetRequiredService<ITelegramService>();
                    var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

                    try
                    {
                        var mappings = await db.TelegramMessageMappings
                            .Where(m => m.EntityType == job.EntityType.ToString() && m.EntityId == job.EntityId)
                            .ToListAsync(stoppingToken);

                        _logger.LogInformation("TelegramWorker: Action={Action} EntityType={EntityType} EntityId={EntityId} MappingCount={MappingCount} FileType={FileType} LocalFile={LocalFile}",
                            job.Action, job.EntityType, job.EntityId, mappings.Count, job.FileType, job.LocalFilePath);

                        if (job.Action == TelegramSyncAction.Create || (job.Action == TelegramSyncAction.Update && !mappings.Any()))
                        {
                            if (!mappings.Any())
                            {
                                var msgIds = await telegramService.SendMediaAsync(job);
                                foreach(var msgId in msgIds)
                                {
                                    db.TelegramMessageMappings.Add(new TelegramMessageMapping
                                    {
                                        EntityType = job.EntityType.ToString(),
                                        EntityId = job.EntityId,
                                        TelegramMessageId = msgId
                                    });
                                }
                                await db.SaveChangesAsync(stoppingToken);
                                _logger.LogInformation("TelegramWorker: Successfully sent {Count} new message(s).", msgIds.Length);
                            }
                            else
                            {
                                _logger.LogWarning("TelegramWorker: Skipping Create because mapping already exists for {EntityType}/{EntityId}", job.EntityType, job.EntityId);
                            }
                        }
                        else if (job.Action == TelegramSyncAction.Update && mappings.Any())
                        {
                            bool isOldAlbum = mappings.Count > 1;
                            bool isNewAlbum = job.LocalFilePaths != null && job.LocalFilePaths.Count > 1;

                            if ((isOldAlbum || isNewAlbum) && !job.IsCaptionOnlyEdit)
                            {
                                // Telegram doesn't support modifying album structure or bulk editing album media.
                                // The only way to update an album's media is to delete the old one and recreate it.
                                _logger.LogInformation("TelegramWorker: Album update detected, recreating album for EntityId={EntityId}", job.EntityId);
                                
                                foreach(var mapping in mappings)
                                {
                                    try { await telegramService.DeleteMessageAsync(mapping.TelegramMessageId); }
                                    catch (Exception delEx) { _logger.LogWarning(delEx, "Failed to delete old album message {MsgId}", mapping.TelegramMessageId); }
                                    db.TelegramMessageMappings.Remove(mapping);
                                }

                                var msgIds = await telegramService.SendMediaAsync(job);
                                foreach(var msgId in msgIds)
                                {
                                    db.TelegramMessageMappings.Add(new TelegramMessageMapping
                                    {
                                        EntityType = job.EntityType.ToString(),
                                        EntityId = job.EntityId,
                                        TelegramMessageId = msgId
                                    });
                                }
                                await db.SaveChangesAsync(stoppingToken);
                                _logger.LogInformation("TelegramWorker: Successfully recreated album with {Count} message(s).", msgIds.Length);
                            }
                            else
                            {
                                var firstMapping = mappings.OrderBy(m => m.Id).First();
                                if (job.IsCaptionOnlyEdit)
                                    await telegramService.EditCaptionAsync(firstMapping.TelegramMessageId, job.Caption!, job.LinkUrl, job.LinkText!);
                                else
                                    await telegramService.EditMediaAsync(firstMapping.TelegramMessageId, job);

                                firstMapping.SentAt = DateTime.UtcNow;
                                await db.SaveChangesAsync(stoppingToken);
                                _logger.LogInformation("TelegramWorker: Successfully updated message {MsgId}", firstMapping.TelegramMessageId);
                            }
                        }
                        else if (job.Action == TelegramSyncAction.Delete && mappings.Any())
                        {
                            foreach(var mapping in mappings)
                            {
                                try
                                {
                                    await telegramService.DeleteMessageAsync(mapping.TelegramMessageId);
                                }
                                catch (Exception delEx)
                                {
                                    _logger.LogWarning(delEx, "Failed to delete message {MsgId} from Telegram, ignoring.", mapping.TelegramMessageId);
                                }
                                db.TelegramMessageMappings.Remove(mapping);
                            }
                            await db.SaveChangesAsync(stoppingToken);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Background Telegram sync failed for {Action} {EntityType} {EntityId}", job.Action, job.EntityType, job.EntityId);
                        try
                        {
                            await notificationService.SendAdminErrorNotificationAsync($"Failed to sync {job.EntityType} to Telegram: {ex.Message}");
                        }
                        catch (Exception notifEx)
                        {
                            _logger.LogError(notifEx, "Failed to send error notification");
                        }
                    }
                }
                finally
                {
                    semaphore.Release();

                    // Periodic lock cleanup to prevent unbounded growth
                    _processedCount++;
                    if (_processedCount % LockCleanupInterval == 0)
                    {
                        CleanupUnusedLocks();
                    }
                }
            }
        }

        /// <summary>
        /// Remove semaphores that are not currently held by any thread.
        /// Safe to call because we only process one job at a time per entity key,
        /// and the semaphore is released before we reach this code.
        /// </summary>
        private void CleanupUnusedLocks()
        {
            var keysToRemove = new List<string>();
            foreach (var kvp in _locks)
            {
                if (kvp.Value.CurrentCount == 1) // Not held by anyone
                {
                    keysToRemove.Add(kvp.Key);
                }
            }

            foreach (var key in keysToRemove)
            {
                if (_locks.TryRemove(key, out var removed))
                {
                    removed.Dispose();
                }
            }

            if (keysToRemove.Count > 0)
            {
                _logger.LogDebug("TelegramWorker: Cleaned up {Count} unused entity locks. Remaining: {Remaining}",
                    keysToRemove.Count, _locks.Count);
            }
        }

        /// <summary>
        /// On startup, find published entities that have no Telegram mapping and enqueue them.
        /// Only activates if at least one mapping already exists (prevents flooding on first deployment).
        /// </summary>
        private async Task ReconcileMissingMappingsAsync(CancellationToken ct)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var jobBuilder = scope.ServiceProvider.GetRequiredService<ITelegramJobBuilder>();

                var hasAnyMapping = await db.TelegramMessageMappings.AnyAsync(ct);
                if (!hasAnyMapping)
                {
                    _logger.LogInformation("TelegramWorker: No existing Telegram mappings found. Skipping startup reconciliation to avoid flooding.");
                    return;
                }

                var reconciledCount = 0;

                // ── News articles that are published, not deleted, and have no mapping ──
                var mappedNewsIds = db.TelegramMessageMappings
                    .Where(m => m.EntityType == nameof(TelegramEntityType.News))
                    .Select(m => m.EntityId);

                var unmappedNews = await db.NewsArticles
                    .Include(a => a.Translations)
                    .Where(a => a.Status == ContentStatus.Published && a.DeletedAt == null && !mappedNewsIds.Contains(a.Id))
                    .ToListAsync(ct);

                foreach (var article in unmappedNews)
                {
                    var job = await jobBuilder.BuildNewsJobAsync(article, TelegramSyncAction.Create);
                    await _queue.EnqueueAsync(job);
                    reconciledCount++;
                }

                // ── Laws with no mapping ──
                var mappedLawIds = db.TelegramMessageMappings
                    .Where(m => m.EntityType == nameof(TelegramEntityType.Law))
                    .Select(m => m.EntityId);

                var unmappedLaws = await db.Laws
                    .Include(l => l.Translations)
                    .Where(l => !mappedLawIds.Contains(l.Id))
                    .ToListAsync(ct);

                foreach (var law in unmappedLaws)
                {
                    var job = await jobBuilder.BuildLawJobAsync(law, law.Translations, TelegramSyncAction.Create);
                    await _queue.EnqueueAsync(job);
                    reconciledCount++;
                }

                // ── Publications with no mapping ──
                var mappedPubIds = db.TelegramMessageMappings
                    .Where(m => m.EntityType == nameof(TelegramEntityType.Publication))
                    .Select(m => m.EntityId);

                var unmappedPubs = await db.Publications
                    .Include(p => p.Translations)
                    .Where(p => !mappedPubIds.Contains(p.Id))
                    .ToListAsync(ct);

                foreach (var pub in unmappedPubs)
                {
                    var job = await jobBuilder.BuildPublicationJobAsync(pub, pub.Translations, TelegramSyncAction.Create);
                    await _queue.EnqueueAsync(job);
                    reconciledCount++;
                }

                if (reconciledCount > 0)
                {
                    _logger.LogInformation("TelegramWorker: Reconciled {Count} entities missing Telegram mappings.", reconciledCount);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "TelegramWorker: Startup reconciliation failed. Continuing with normal processing.");
            }
        }
    }
}

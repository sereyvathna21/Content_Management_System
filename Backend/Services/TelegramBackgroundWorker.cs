using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class TelegramBackgroundWorker : BackgroundService
    {
        private readonly TelegramSyncQueue _queue;
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<TelegramBackgroundWorker> _logger;

        public TelegramBackgroundWorker(TelegramSyncQueue queue, IServiceProvider serviceProvider, ILogger<TelegramBackgroundWorker> logger)
        {
            _queue = queue;
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await foreach (var job in _queue.ReadAllAsync(stoppingToken))
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    var telegramService = scope.ServiceProvider.GetRequiredService<ITelegramService>();

                    var mapping = await db.TelegramMessageMappings
                        .FirstOrDefaultAsync(m => m.EntityType == job.EntityType && m.EntityId == job.EntityId, stoppingToken);

                    _logger.LogInformation("TelegramWorker: Action={Action} EntityType={EntityType} EntityId={EntityId} MappingExists={MappingExists} FileType={FileType} LocalFile={LocalFile}",
                        job.Action, job.EntityType, job.EntityId, mapping != null, job.FileType, job.LocalFilePath);

                    if (job.Action == "Create" || (job.Action == "Update" && mapping == null))
                    {
                        if (mapping == null)
                        {
                            var msgId = await telegramService.SendMediaAsync(job);
                            db.TelegramMessageMappings.Add(new TelegramMessageMapping
                            {
                                EntityType = job.EntityType,
                                EntityId = job.EntityId,
                                TelegramMessageId = msgId
                            });
                            await db.SaveChangesAsync(stoppingToken);
                            _logger.LogInformation("TelegramWorker: Successfully sent new message. MsgId={MsgId}", msgId);
                        }
                        else
                        {
                            _logger.LogWarning("TelegramWorker: Skipping Create because mapping already exists for {EntityType}/{EntityId}", job.EntityType, job.EntityId);
                        }
                    }
                    else if (job.Action == "Update" && mapping != null)
                    {
                        if (job.IsCaptionOnlyEdit)
                            await telegramService.EditCaptionAsync(mapping.TelegramMessageId, job.Caption!, job.LinkUrl, job.LinkText!);
                        else
                            await telegramService.EditMediaAsync(mapping.TelegramMessageId, job);

                        mapping.SentAt = DateTime.UtcNow;
                        await db.SaveChangesAsync(stoppingToken);
                        _logger.LogInformation("TelegramWorker: Successfully updated message {MsgId}", mapping.TelegramMessageId);
                    }
                    else if (job.Action == "Delete" && mapping != null)
                    {
                        await telegramService.DeleteMessageAsync(mapping.TelegramMessageId);
                        db.TelegramMessageMappings.Remove(mapping);
                        await db.SaveChangesAsync(stoppingToken);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Background Telegram sync failed for {Action} {EntityType} {EntityId}", job.Action, job.EntityType, job.EntityId);
                }
            }
        }
    }
}

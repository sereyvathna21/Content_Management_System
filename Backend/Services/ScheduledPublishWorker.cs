using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using System.Net.Http;

namespace Backend.Services
{
    public class ScheduledPublishWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ScheduledPublishWorker> _logger;

        public ScheduledPublishWorker(IServiceProvider serviceProvider, ILogger<ScheduledPublishWorker> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("ScheduledPublishWorker started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessScheduledPostsAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while processing scheduled posts.");
                }

                // Wait 1 minute before checking again
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }

            _logger.LogInformation("ScheduledPublishWorker stopping.");
        }

        private async Task ProcessScheduledPostsAsync(CancellationToken stoppingToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var telegramQueue = scope.ServiceProvider.GetRequiredService<TelegramSyncQueue>();
            var telegramJobBuilder = scope.ServiceProvider.GetRequiredService<ITelegramJobBuilder>();
            var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();

            var now = DateTime.UtcNow;

            // 1. Process News
            var newsArticles = await db.NewsArticles
                .Include(a => a.Translations)
                .Where(a => a.Status == ContentStatus.Published 
                            && a.PublishAt <= now 
                            && !a.IsPublishedSyncTriggered)
                .ToListAsync(stoppingToken);

            foreach (var article in newsArticles)
            {
                var job = await telegramJobBuilder.BuildNewsJobAsync(article, TelegramSyncAction.Create);
                await telegramQueue.EnqueueAsync(job);

                await TriggerFrontendRevalidationAsync(config, new[]
                {
                    "/Landing-page/News",
                    $"/Landing-page/News/{Uri.EscapeDataString(article.Slug)}"
                });

                article.IsPublishedSyncTriggered = true;
            }

            // 2. Process Laws
            var laws = await db.Laws
                .Include(l => l.Translations)
                .Where(l => l.Status == ContentStatus.Published 
                            && l.PublishAt <= now 
                            && !l.IsPublishedSyncTriggered)
                .ToListAsync(stoppingToken);

            foreach (var law in laws)
            {
                var job = await telegramJobBuilder.BuildLawJobAsync(law, law.Translations, TelegramSyncAction.Create);
                await telegramQueue.EnqueueAsync(job);

                await TriggerFrontendRevalidationAsync(config, new[] { "/Landing-page/Laws" });

                law.IsPublishedSyncTriggered = true;
            }

            // 3. Process Publications
            var publications = await db.Publications
                .Include(p => p.Translations)
                .Where(p => p.Status == ContentStatus.Published 
                            && p.PublishAt <= now 
                            && !p.IsPublishedSyncTriggered)
                .ToListAsync(stoppingToken);

            foreach (var pub in publications)
            {
                var job = await telegramJobBuilder.BuildPublicationJobAsync(pub, pub.Translations, TelegramSyncAction.Create);
                await telegramQueue.EnqueueAsync(job);

                await TriggerFrontendRevalidationAsync(config, new[] { "/Landing-page/Publications" });

                pub.IsPublishedSyncTriggered = true;
            }

            if (newsArticles.Count > 0 || laws.Count > 0 || publications.Count > 0)
            {
                await db.SaveChangesAsync(stoppingToken);
                _logger.LogInformation($"Processed {newsArticles.Count} news, {laws.Count} laws, {publications.Count} publications.");
            }
        }

        private async Task TriggerFrontendRevalidationAsync(IConfiguration config, IEnumerable<string> paths)
        {
            try
            {
                var frontendUrl = config["FrontendUrl"] ?? "http://localhost:3000";
                var secret = config["RevalidateSecret"] ?? "fallback-secret-123";
                using var client = new HttpClient();
                client.Timeout = TimeSpan.FromSeconds(5);

                foreach (var path in paths.Where(p => !string.IsNullOrWhiteSpace(p)).Distinct())
                {
                    var payload = new { secret = secret, path = path };
                    var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                    await client.PostAsync($"{frontendUrl.TrimEnd('/')}/api/revalidate", content);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"Failed to trigger frontend revalidation from worker: {ex.Message}");
            }
        }
    }
}

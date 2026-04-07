using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class NotificationRetentionService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly IConfiguration _configuration;
        private readonly ILogger<NotificationRetentionService> _logger;

        private const int DefaultRetentionDays = 30;
        private const int MinRetentionDays = 1;
        private static readonly TimeSpan CleanupInterval = TimeSpan.FromHours(12);

        public NotificationRetentionService(
            IServiceProvider serviceProvider,
            IConfiguration configuration,
            ILogger<NotificationRetentionService> logger)
        {
            _serviceProvider = serviceProvider;
            _configuration = configuration;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await CleanupExpiredNotificationsAsync(stoppingToken);

            using var timer = new PeriodicTimer(CleanupInterval);
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                await CleanupExpiredNotificationsAsync(stoppingToken);
            }
        }

        private int GetRetentionDays()
        {
            var configured = _configuration.GetValue<int?>("Notifications:RetentionDays");
            if (!configured.HasValue || configured.Value < MinRetentionDays)
            {
                return DefaultRetentionDays;
            }

            return configured.Value;
        }

        private async Task CleanupExpiredNotificationsAsync(CancellationToken cancellationToken)
        {
            try
            {
                var retentionDays = GetRetentionDays();
                var cutoffUtc = DateTime.UtcNow.AddDays(-retentionDays);

                using var scope = _serviceProvider.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                var deleted = await db.Notifications
                    .Where(n => n.CreatedAt < cutoffUtc)
                    .ExecuteDeleteAsync(cancellationToken);

                if (deleted > 0)
                {
                    _logger.LogInformation(
                        "Deleted {Count} notifications older than {RetentionDays} days.",
                        deleted,
                        retentionDays);
                }
            }
            catch (OperationCanceledException)
            {
                // Shutdown signal.
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to clean up expired notifications.");
            }
        }
    }
}

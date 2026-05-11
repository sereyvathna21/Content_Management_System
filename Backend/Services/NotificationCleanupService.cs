using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class NotificationCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<NotificationCleanupService> _logger;
    private readonly TimeSpan _cleanupInterval = TimeSpan.FromHours(24); // Run once per day

    public NotificationCleanupService(IServiceProvider serviceProvider, ILogger<NotificationCleanupService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Notification cleanup service started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(_cleanupInterval, stoppingToken);
                await CleanupOldNotifications(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during notification cleanup.");
            }
        }
    }

    private async Task CleanupOldNotifications(CancellationToken cancellationToken)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Delete notifications older than 30 days
            var cutoffDate = DateTime.UtcNow.AddDays(-30);
            var deleted = await context.Notifications
                .Where(n => n.CreatedAt < cutoffDate)
                .ExecuteDeleteAsync(cancellationToken);

            if (deleted > 0)
            {
                _logger.LogInformation($"Deleted {deleted} old notifications (older than 30 days).");
            }
        }
        catch (OperationCanceledException)
        {
            // Shutdown signal
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to clean up old notifications.");
        }
    }
}

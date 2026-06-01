using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class AuditLogRetentionService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuditLogRetentionService> _logger;

        private const int DefaultRetentionDays = 365;
        private const int DefaultSecurityRetentionDays = 1095;
        private const int MinRetentionDays = 1;
        private static readonly TimeSpan CleanupInterval = TimeSpan.FromHours(12);
        private static readonly string[] SecurityActionPrefixes =
        {
            "auth:",
            "security:"
        };

        public AuditLogRetentionService(
            IServiceProvider serviceProvider,
            IConfiguration configuration,
            ILogger<AuditLogRetentionService> logger)
        {
            _serviceProvider = serviceProvider;
            _configuration = configuration;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await CleanupExpiredAuditLogsAsync(stoppingToken);

            using var timer = new PeriodicTimer(CleanupInterval);
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                await CleanupExpiredAuditLogsAsync(stoppingToken);
            }
        }

        private int GetRetentionDays()
        {
            var configured = _configuration.GetValue<int?>("AuditLogs:RetentionDays");
            if (!configured.HasValue || configured.Value < MinRetentionDays)
            {
                return DefaultRetentionDays;
            }

            return configured.Value;
        }

        private int GetSecurityRetentionDays()
        {
            var configured = _configuration.GetValue<int?>("AuditLogs:SecurityRetentionDays");
            if (!configured.HasValue || configured.Value < DefaultRetentionDays)
            {
                return DefaultSecurityRetentionDays;
            }

            return configured.Value;
        }

        private async Task CleanupExpiredAuditLogsAsync(CancellationToken cancellationToken)
        {
            try
            {
                var retentionDays = GetRetentionDays();
                var securityRetentionDays = GetSecurityRetentionDays();
                var retentionCutoffUtc = DateTime.UtcNow.AddDays(-retentionDays);
                var securityCutoffUtc = DateTime.UtcNow.AddDays(-securityRetentionDays);

                using var scope = _serviceProvider.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                var deletedRegularLogs = await db.AuditLogs
                    .Where(log =>
                        !log.Action.StartsWith("auth:") &&
                        !log.Action.StartsWith("security:") &&
                        log.CreatedAt < retentionCutoffUtc)
                    .ExecuteDeleteAsync(cancellationToken);

                var deletedSecurityLogs = await db.AuditLogs
                    .Where(log =>
                        (log.Action.StartsWith("auth:") || log.Action.StartsWith("security:")) &&
                        log.CreatedAt < securityCutoffUtc)
                    .ExecuteDeleteAsync(cancellationToken);

                var deleted = deletedRegularLogs + deletedSecurityLogs;
                if (deleted > 0)
                {
                    _logger.LogInformation(
                        "Deleted {DeletedCount} audit logs. Regular retention: {RetentionDays} days, security retention: {SecurityRetentionDays} days.",
                        deleted,
                        retentionDays,
                        securityRetentionDays);
                }
            }
            catch (OperationCanceledException)
            {
                // Shutdown signal.
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to clean up expired audit logs.");
            }
        }

        private static bool IsSecurityAction(string? action)
        {
            if (string.IsNullOrWhiteSpace(action))
            {
                return false;
            }

            return SecurityActionPrefixes.Any(prefix =>
                action.StartsWith(prefix, StringComparison.OrdinalIgnoreCase));
        }
    }
}

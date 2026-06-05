using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class AuditLogBackgroundWriter : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly AuditLogQueue _queue;
        private readonly ILogger<AuditLogBackgroundWriter> _logger;

        public AuditLogBackgroundWriter(IServiceProvider serviceProvider, AuditLogQueue queue, ILogger<AuditLogBackgroundWriter> logger)
        {
            _serviceProvider = serviceProvider;
            _queue = queue;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await foreach (var log in _queue.ReadAllAsync(stoppingToken))
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    db.AuditLogs.Add(log);
                    await db.SaveChangesAsync(stoppingToken);
                    _logger.LogInformation("Persisted audit log: {Action} Entity={EntityType} Actor={ActorEmail} ActorId={ActorUserId}", log.Action, log.EntityType, log.ActorEmail, log.ActorUserId);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    // shutdown
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to persist audit log record.");
                }
            }
        }
    }
}

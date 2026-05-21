using System.Text.Json;
using Backend.Data;
using Backend.Models;

namespace Backend.Services
{
    public class SecurityAuditService : ISecurityAuditService
    {
        private readonly ApplicationDbContext _db;

        public SecurityAuditService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task LogAsync(int actorUserId, string actorEmail, string action, string targetId, object details)
        {
            var auditLog = new SecurityAuditLog
            {
                ActorUserId = actorUserId,
                ActorEmail = actorEmail,
                Action = action,
                TargetId = targetId,
                Details = JsonSerializer.Serialize(details),
                CreatedAt = DateTime.UtcNow
            };

            _db.SecurityAuditLogs.Add(auditLog);
            await _db.SaveChangesAsync();
        }
    }
}

using System;

namespace Backend.Models
{
    public class AuditLog
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Action { get; set; } = string.Empty;
        public string EntityType { get; set; } = string.Empty;
        public string? EntityId { get; set; }
        public string Summary { get; set; } = string.Empty;
        public AuditLogStatus Status { get; set; } = AuditLogStatus.Success;
        public int ActorUserId { get; set; }
        public string ActorEmail { get; set; } = string.Empty;
        public string? ActorRole { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public string? Metadata { get; set; }
        public string? ErrorMessage { get; set; }
        public string? RequestId { get; set; }
        public string? CorrelationId { get; set; }
        public string? SessionId { get; set; }
        public string? TenantId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

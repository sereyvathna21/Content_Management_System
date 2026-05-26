using Backend.Models;

namespace Backend.Services
{
    public class AuditLogEntry
    {
        public string Action { get; set; } = string.Empty;
        public string EntityType { get; set; } = string.Empty;
        public string? EntityId { get; set; }
        public string Summary { get; set; } = string.Empty;
        public AuditLogStatus Status { get; set; } = AuditLogStatus.Success;
        public object? Metadata { get; set; }
        public string? ErrorMessage { get; set; }
        public int? ActorUserId { get; set; }
        public string? ActorEmail { get; set; }
        public string? ActorRole { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public string? RequestId { get; set; }
        public string? CorrelationId { get; set; }
        public string? SessionId { get; set; }
        public string? TenantId { get; set; }
    }
}

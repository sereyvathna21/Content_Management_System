using System;

namespace Backend.Models
{
    public class SecurityAuditLog
    {
        public int Id { get; set; }
        public int ActorUserId { get; set; }
        public string ActorEmail { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string TargetId { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

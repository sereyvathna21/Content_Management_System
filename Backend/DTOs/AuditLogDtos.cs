using System;
using System.Text.Json;
using Backend.Models;

namespace Backend.DTOs
{
    public class AuditLogListItemDto
    {
        public Guid Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public string EntityType { get; set; } = string.Empty;
        public string? EntityId { get; set; }
        public string Summary { get; set; } = string.Empty;
        public string ActorFullName { get; set; } = string.Empty;
        public AuditLogStatus Status { get; set; }
        public int ActorUserId { get; set; }
        public string ActorEmail { get; set; } = string.Empty;
        public string? IpAddress { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AuditLogDetailDto
    {
        public Guid Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public string EntityType { get; set; } = string.Empty;
        public string? EntityId { get; set; }
        public string Summary { get; set; } = string.Empty;
        public string ActorFullName { get; set; } = string.Empty;
        public AuditLogStatus Status { get; set; }
        public int ActorUserId { get; set; }
        public string ActorEmail { get; set; } = string.Empty;
        public string? ActorRole { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public DateTime CreatedAt { get; set; }
        public JsonElement? Metadata { get; set; }
        public string? ErrorMessage { get; set; }
        public string? RequestId { get; set; }
        public string? CorrelationId { get; set; }
        public string? SessionId { get; set; }
    }

    public class AuditLogQueryParams
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
        public int? UserId { get; set; }
        public string? Action { get; set; }
        public string? EntityType { get; set; }
        public string? EntityId { get; set; }
        public string? Status { get; set; }
        public string? Q { get; set; }
    }
}

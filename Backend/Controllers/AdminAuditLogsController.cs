using System.Text;
using System.Text.Json;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Backend.Security;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/admin/audit-logs")]
    public class AdminAuditLogsController : ControllerBase
    {
        private const int MaxPageSize = 100;
        private const int MaxExportRows = 10000;
        private readonly ApplicationDbContext _db;
        private readonly IAuditLogService _audit;

        public AdminAuditLogsController(ApplicationDbContext db, IAuditLogService audit)
        {
            _db = db;
            _audit = audit;
        }

        [HttpGet]
        [HasPermission(PermissionConstants.AuditRead)]
        public async Task<IActionResult> List([FromQuery] AuditLogQueryParams query)
        {
            var page = Math.Max(1, query.Page);
            var pageSize = Math.Clamp(query.PageSize, 1, MaxPageSize);

            var logs = ApplyFilters(_db.AuditLogs.AsNoTracking(), query);
            var total = await logs.CountAsync();

            var items = await logs
                .OrderByDescending(l => l.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .GroupJoin(
                    _db.Users.AsNoTracking(),
                    l => l.ActorUserId,
                    u => u.Id,
                    (l, users) => new { Log = l, Users = users })
                .SelectMany(
                    x => x.Users.DefaultIfEmpty(),
                    (x, u) => new AuditLogListItemDto
                    {
                        Id = x.Log.Id,
                        Action = x.Log.Action,
                        EntityType = x.Log.EntityType,
                        EntityId = x.Log.EntityId,
                        Summary = x.Log.Summary,
                        Status = x.Log.Status,
                        ActorUserId = x.Log.ActorUserId,
                        ActorEmail = x.Log.ActorEmail,
                        ActorFullName = u != null ? u.FullName : x.Log.ActorEmail,
                        IpAddress = x.Log.IpAddress,
                        CreatedAt = x.Log.CreatedAt
                    })
                .ToListAsync();

            return Ok(new { total, page, pageSize, items });
        }

        [HttpGet("{id:guid}")]
        [HasPermission(PermissionConstants.AuditRead)]
        public async Task<IActionResult> Get(Guid id)
        {
            var log = await _db.AuditLogs.AsNoTracking().FirstOrDefaultAsync(l => l.Id == id);
            if (log == null)
            {
                return NotFound(new { message = "Audit log not found." });
            }

            JsonElement? metadata = null;
            if (!string.IsNullOrWhiteSpace(log.Metadata))
            {
                using var doc = JsonDocument.Parse(log.Metadata);
                metadata = doc.RootElement.Clone();
            }

            var user = await _db.Users.AsNoTracking()
                .Where(u => u.Id == log.ActorUserId)
                .Select(u => u.FullName)
                .FirstOrDefaultAsync();

            var dto = new AuditLogDetailDto
            {
                Id = log.Id,
                Action = log.Action,
                EntityType = log.EntityType,
                EntityId = log.EntityId,
                Summary = log.Summary,
                Status = log.Status,
                ActorUserId = log.ActorUserId,
                ActorEmail = log.ActorEmail,
                ActorFullName = user ?? log.ActorEmail,
                ActorRole = log.ActorRole,
                IpAddress = log.IpAddress,
                UserAgent = log.UserAgent,
                CreatedAt = log.CreatedAt,
                Metadata = metadata,
                ErrorMessage = log.ErrorMessage,
                RequestId = log.RequestId,
                CorrelationId = log.CorrelationId,
                SessionId = log.SessionId
            };

            return Ok(dto);
        }

        [HttpGet("export")]
        [HasPermission(PermissionConstants.AuditExport)]
        public async Task<IActionResult> Export([FromQuery] AuditLogQueryParams query, [FromQuery] string format = "csv")
        {
            if (!string.Equals(format, "csv", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Only csv export is supported." });
            }

            var logs = ApplyFilters(_db.AuditLogs.AsNoTracking(), query);
            var total = await logs.CountAsync();
            if (total > MaxExportRows)
            {
                return BadRequest(new { message = $"Export exceeds {MaxExportRows} rows. Please narrow your filters." });
            }

            var items = await logs
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();

            var csv = BuildCsv(items);

            await _audit.WriteAsync(new AuditLogEntry
            {
                Action = PermissionConstants.AuditExport,
                EntityType = "AuditLog",
                Summary = "Exported audit logs",
                Status = AuditLogStatus.Success,
                Metadata = new { total }
            }, HttpContext);

            var bytes = Encoding.UTF8.GetBytes(csv);
            return File(bytes, "text/csv", $"audit-logs-{DateTime.UtcNow:yyyyMMddHHmmss}.csv");
        }

        private static IQueryable<AuditLog> ApplyFilters(IQueryable<AuditLog> query, AuditLogQueryParams filters)
        {
            if (filters.From.HasValue)
            {
                query = query.Where(l => l.CreatedAt >= filters.From.Value);
            }

            if (filters.To.HasValue)
            {
                query = query.Where(l => l.CreatedAt <= filters.To.Value);
            }

            if (filters.UserId.HasValue)
            {
                query = query.Where(l => l.ActorUserId == filters.UserId.Value);
            }

            if (!string.IsNullOrWhiteSpace(filters.Action))
            {
                var value = filters.Action.Trim().ToLowerInvariant();
                query = query.Where(l => l.Action.ToLower().Contains(value));
            }

            if (!string.IsNullOrWhiteSpace(filters.EntityType))
            {
                var value = filters.EntityType.Trim().ToLowerInvariant();
                query = query.Where(l => l.EntityType.ToLower().Contains(value));
            }

            if (!string.IsNullOrWhiteSpace(filters.EntityId))
            {
                var value = filters.EntityId.Trim().ToLowerInvariant();
                query = query.Where(l => (l.EntityId ?? string.Empty).ToLower().Contains(value));
            }

            if (!string.IsNullOrWhiteSpace(filters.Status)
                && Enum.TryParse<AuditLogStatus>(filters.Status, true, out var parsedStatus))
            {
                query = query.Where(l => l.Status == parsedStatus);
            }

            if (!string.IsNullOrWhiteSpace(filters.Q))
            {
                var value = filters.Q.Trim().ToLowerInvariant();
                query = query.Where(l =>
                    l.Action.ToLower().Contains(value) ||
                    l.EntityType.ToLower().Contains(value) ||
                    (l.EntityId ?? string.Empty).ToLower().Contains(value) ||
                    l.Summary.ToLower().Contains(value) ||
                    l.ActorEmail.ToLower().Contains(value));
            }

            return query;
        }

        private static string BuildCsv(List<AuditLog> logs)
        {
            var sb = new StringBuilder();
            sb.AppendLine("id,action,entityType,entityId,summary,status,actorUserId,actorEmail,actorRole,ipAddress,userAgent,createdAt");

            foreach (var log in logs)
            {
                sb.AppendLine(string.Join(",",
                    EscapeCsv(log.Id.ToString()),
                    EscapeCsv(log.Action),
                    EscapeCsv(log.EntityType),
                    EscapeCsv(log.EntityId),
                    EscapeCsv(log.Summary),
                    EscapeCsv(log.Status.ToString()),
                    EscapeCsv(log.ActorUserId.ToString()),
                    EscapeCsv(log.ActorEmail),
                    EscapeCsv(log.ActorRole),
                    EscapeCsv(log.IpAddress),
                    EscapeCsv(log.UserAgent),
                    EscapeCsv(log.CreatedAt.ToString("O"))));
            }

            return sb.ToString();
        }

        private static string EscapeCsv(string? value)
        {
            if (string.IsNullOrEmpty(value))
            {
                return string.Empty;
            }

            var escaped = value.Replace("\"", "\"\"");
            if (escaped.Contains(',') || escaped.Contains('"') || escaped.Contains('\n') || escaped.Contains('\r'))
            {
                return $"\"{escaped}\"";
            }

            return escaped;
        }
    }
}

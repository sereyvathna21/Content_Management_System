using Microsoft.AspNetCore.Http;

namespace Backend.Services
{
    public interface IAuditLogService
    {
        Task WriteAsync(AuditLogEntry entry, HttpContext? httpContext = null, CancellationToken cancellationToken = default);
    }
}

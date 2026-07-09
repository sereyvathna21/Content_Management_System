using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace Backend.Security
{
    public class IpWhitelistMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<IpWhitelistMiddleware> _logger;
        private readonly string[] _allowedIps;

        public IpWhitelistMiddleware(RequestDelegate next, IConfiguration configuration, ILogger<IpWhitelistMiddleware> logger)
        {
            _next = next;
            _logger = logger;
            _allowedIps = configuration.GetSection("Security:AllowedAdminIps").Get<string[]>() ?? System.Array.Empty<string>();
        }

        public async Task Invoke(HttpContext context)
        {
            var path = context.Request.Path.Value ?? string.Empty;

            // Only protect /api/admin and /api/auth
            if (path.StartsWith("/api/admin") || path.StartsWith("/api/auth"))
            {
                if (_allowedIps.Length > 0)
                {
                    var remoteIp = context.Connection.RemoteIpAddress;
                    if (remoteIp == null)
                    {
                        _logger.LogWarning("Forbidden Request: Remote IP is null.");
                        context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
                        return;
                    }

                    var ipString = remoteIp.ToString();

                    // Handle IPv4 mapped to IPv6
                    if (remoteIp.IsIPv4MappedToIPv6)
                    {
                        ipString = remoteIp.MapToIPv4().ToString();
                    }

                    if (!_allowedIps.Contains(ipString) && !_allowedIps.Contains(remoteIp.ToString()))
                    {
                        _logger.LogWarning($"Forbidden Request from Unauthorized IP: {ipString}");
                        context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
                        await context.Response.WriteAsync("Access denied. Your IP is not whitelisted.");
                        return;
                    }
                }
            }

            await _next(context);
        }
    }
}

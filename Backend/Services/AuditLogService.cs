using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Nodes;
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Backend.Services
{
    public class AuditLogService : IAuditLogService
    {
        private static readonly HashSet<string> SensitiveMetadataKeys = new(StringComparer.OrdinalIgnoreCase)
        {
            "password",
            "newpassword",
            "oldpassword",
            "confirmPassword",
            "passphrase",
            "token",
            "accessToken",
            "refreshToken",
            "idToken",
            "secret",
            "clientSecret",
            "apiKey",
            "api_key",
            "authorization",
            "cookie",
            "set-cookie",
            "session",
            "sessionId",
            "otp",
            "verificationCode",
            "code"
        };

        private readonly ApplicationDbContext _db;
        private readonly HashSet<string> _trustedProxyIps;

        public AuditLogService(ApplicationDbContext db, IConfiguration config)
        {
            _db = db;
            _trustedProxyIps = config.GetSection("App:TrustedProxyIps").Get<string[]>()?.ToHashSet(StringComparer.OrdinalIgnoreCase)
                ?? new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        }

        public async Task WriteAsync(AuditLogEntry entry, HttpContext? httpContext = null, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(entry.Action) || string.IsNullOrWhiteSpace(entry.EntityType))
            {
                return;
            }

            var user = httpContext?.User;
            var actorId = entry.ActorUserId ?? TryResolveUserId(user);
            var actorEmail = entry.ActorEmail ?? TryResolveEmail(user);
            var actorRole = entry.ActorRole ?? TryResolveRole(user);

            var ipAddress = entry.IpAddress ?? ResolveIpAddress(httpContext);
            var userAgent = entry.UserAgent ?? httpContext?.Request.Headers.UserAgent.ToString();

            var requestId = entry.RequestId ?? httpContext?.TraceIdentifier;
            var correlationId = entry.CorrelationId ?? TryResolveHeader(httpContext, "X-Correlation-Id", "X-Request-Id") ?? requestId;
            var sessionId = entry.SessionId ?? TryResolveHeader(httpContext, "X-Session-Id");

            var metadataJson = SerializeMetadata(entry.Metadata);

            var log = new AuditLog
            {
                Action = entry.Action.Trim(),
                EntityType = entry.EntityType.Trim(),
                EntityId = string.IsNullOrWhiteSpace(entry.EntityId) ? null : entry.EntityId.Trim(),
                Summary = string.IsNullOrWhiteSpace(entry.Summary) ? entry.Action.Trim() : entry.Summary.Trim(),
                Status = entry.Status,
                ActorUserId = actorId ?? 0,
                ActorEmail = actorEmail ?? string.Empty,
                ActorRole = string.IsNullOrWhiteSpace(actorRole) ? null : actorRole.Trim(),
                IpAddress = string.IsNullOrWhiteSpace(ipAddress) ? null : ipAddress.Trim(),
                UserAgent = string.IsNullOrWhiteSpace(userAgent) ? null : userAgent.Trim(),
                Metadata = metadataJson,
                ErrorMessage = string.IsNullOrWhiteSpace(entry.ErrorMessage) ? null : entry.ErrorMessage.Trim(),
                RequestId = string.IsNullOrWhiteSpace(requestId) ? null : requestId.Trim(),
                CorrelationId = string.IsNullOrWhiteSpace(correlationId) ? null : correlationId.Trim(),
                SessionId = string.IsNullOrWhiteSpace(sessionId) ? null : sessionId.Trim(),
                TenantId = string.IsNullOrWhiteSpace(entry.TenantId) ? null : entry.TenantId.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _db.AuditLogs.Add(log);
            await _db.SaveChangesAsync(cancellationToken);
        }

        private static int? TryResolveUserId(ClaimsPrincipal? user)
        {
            var subject = user?.FindFirstValue(JwtRegisteredClaimNames.Sub)
                ?? user?.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? user?.FindFirstValue("id")
                ?? user?.FindFirstValue("Id");

            if (int.TryParse(subject, out var userId))
            {
                return userId;
            }

            return null;
        }

        private static string? TryResolveEmail(ClaimsPrincipal? user)
        {
            return user?.FindFirstValue(JwtRegisteredClaimNames.Email)
                ?? user?.FindFirstValue(ClaimTypes.Email);
        }

        private static string? TryResolveRole(ClaimsPrincipal? user)
        {
            return user?.FindFirstValue(ClaimTypes.Role)
                ?? user?.FindFirstValue("role");
        }

        private static string? TryResolveHeader(HttpContext? context, params string[] names)
        {
            if (context == null)
            {
                return null;
            }

            foreach (var name in names)
            {
                var value = context.Request.Headers[name].FirstOrDefault();
                if (!string.IsNullOrWhiteSpace(value))
                {
                    return value.Trim();
                }
            }

            return null;
        }

        private string? ResolveIpAddress(HttpContext? context)
        {
            if (context == null)
            {
                return null;
            }

            var remoteIp = context.Connection.RemoteIpAddress?.ToString();
            if (string.IsNullOrWhiteSpace(remoteIp))
            {
                return null;
            }

            if (_trustedProxyIps.Count > 0 && _trustedProxyIps.Contains(remoteIp))
            {
                var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
                if (!string.IsNullOrWhiteSpace(forwardedFor))
                {
                    var first = forwardedFor.Split(',').Select(value => value.Trim()).FirstOrDefault();
                    if (!string.IsNullOrWhiteSpace(first))
                    {
                        return first;
                    }
                }

                var cloudflareIp = context.Request.Headers["CF-Connecting-IP"].FirstOrDefault();
                if (!string.IsNullOrWhiteSpace(cloudflareIp))
                {
                    return cloudflareIp.Trim();
                }
            }

            return remoteIp;
        }

        private string? SerializeMetadata(object? metadata)
        {
            if (metadata == null)
            {
                return null;
            }

            if (metadata is string text)
            {
                if (string.IsNullOrWhiteSpace(text))
                {
                    return null;
                }

                if (LooksLikeSensitiveToken(text))
                {
                    return "\"[REDACTED]\"";
                }

                if (TryParseJsonNode(text, out var parsedNode))
                {
                    var sanitized = SanitizeNode(parsedNode);
                    return sanitized?.ToJsonString();
                }

                return text;
            }

            var node = JsonSerializer.SerializeToNode(metadata);
            if (node == null)
            {
                return null;
            }

            var sanitizedNode = SanitizeNode(node);
            return sanitizedNode?.ToJsonString();
        }

        private static bool TryParseJsonNode(string text, out JsonNode? node)
        {
            try
            {
                node = JsonNode.Parse(text);
                return node != null;
            }
            catch (JsonException)
            {
                node = null;
                return false;
            }
        }

        private static JsonNode? SanitizeNode(JsonNode? node, string? parentKey = null)
        {
            if (node == null)
            {
                return null;
            }

            if (parentKey != null && SensitiveMetadataKeys.Contains(parentKey))
            {
                return JsonValue.Create("[REDACTED]");
            }

            if (node is JsonObject obj)
            {
                var sanitizedObject = new JsonObject();
                foreach (var property in obj)
                {
                    sanitizedObject[property.Key] = SanitizeNode(property.Value, property.Key);
                }

                return sanitizedObject;
            }

            if (node is JsonArray array)
            {
                var sanitizedArray = new JsonArray();
                foreach (var item in array)
                {
                    sanitizedArray.Add(SanitizeNode(item, parentKey));
                }

                return sanitizedArray;
            }

            if (node is JsonValue value)
            {
                if (parentKey != null && SensitiveMetadataKeys.Contains(parentKey))
                {
                    return JsonValue.Create("[REDACTED]");
                }

                if (value.TryGetValue<string>(out var stringValue) && LooksLikeSensitiveToken(stringValue))
                {
                    return JsonValue.Create("[REDACTED]");
                }

                return value.DeepClone();
            }

            return node.DeepClone();
        }

        private static bool LooksLikeSensitiveToken(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return false;
            }

            var trimmed = value.Trim();
            if (trimmed.Length >= 20 && trimmed.Contains('.') && trimmed.Count(c => c == '.') >= 2)
            {
                return true;
            }

            if (trimmed.Length >= 32)
            {
                var alphaNumeric = trimmed.All(char.IsLetterOrDigit);
                if (alphaNumeric)
                {
                    return true;
                }
            }

            return false;
        }
    }
}

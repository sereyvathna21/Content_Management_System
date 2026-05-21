using System.Text.Json;
using Backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;

namespace Backend.Security
{
    public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
    {
        private readonly IDistributedCache _cache;
        private readonly ApplicationDbContext _db;

        public PermissionAuthorizationHandler(IDistributedCache cache, ApplicationDbContext db)
        {
            _cache = cache;
            _db = db;
        }

        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
        {
            var roleIdClaim = context.User.FindFirst("roleId")?.Value;

            if (string.IsNullOrEmpty(roleIdClaim) || !int.TryParse(roleIdClaim, out var roleId))
            {
                return;
            }

            var cacheKey = $"role_permissions_{roleId}";
            HashSet<string>? permissions = null;

            var cachedJson = await _cache.GetStringAsync(cacheKey);

            if (!string.IsNullOrEmpty(cachedJson))
            {
                permissions = JsonSerializer.Deserialize<HashSet<string>>(cachedJson);
            }
            else
            {
                var dbPermissions = await _db.RolePermissions
                    .Where(rp => rp.RoleId == roleId)
                    .Select(rp => rp.Permission.Name)
                    .ToListAsync();

                permissions = new HashSet<string>(dbPermissions);

                // Only cache if permissions were actually found
                // This prevents caching an empty set before data is seeded
                if (permissions.Count > 0)
                {
                    await _cache.SetStringAsync(
                        cacheKey,
                        JsonSerializer.Serialize(permissions),
                        new DistributedCacheEntryOptions
                        {
                            AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(1)
                        });
                }
            }

            if (permissions != null && permissions.Contains(requirement.Permission))
            {
                context.Succeed(requirement);
            }
        }
    }
}
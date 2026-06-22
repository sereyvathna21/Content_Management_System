using System;
using System.Linq;
using System.Threading.Tasks;
using Backend.Data;
using Backend.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Backend.Services
{
    public static class DevSeeder
    {
        public static async Task SeedAsync(IServiceProvider services)
        {
            using var scope = services.CreateScope();
            var provider = scope.ServiceProvider;
            var env = provider.GetService<Microsoft.Extensions.Hosting.IHostEnvironment>();
            if (env == null || !env.IsDevelopment()) return;

            var logger = provider.GetService<ILoggerFactory>()?.CreateLogger("DevSeeder");
            try
            {
                var db = provider.GetRequiredService<ApplicationDbContext>();

                // Ensure roles exist
                var needed = new[] { "User", "Admin", "SuperAdmin" };
                var existing = db.Roles.Select(r => r.Name).ToHashSet(StringComparer.OrdinalIgnoreCase);
                foreach (var roleName in needed)
                {
                    if (!existing.Contains(roleName))
                    {
                        db.Roles.Add(new Role { Name = roleName, IsSystemRole = true });
                        logger?.LogInformation("Added role {role}", roleName);
                    }
                }

                await db.SaveChangesAsync();

                // Create a dev admin user if missing
                var adminEmail = "admin@example.com";
                if (!db.Users.Any(u => u.Email == adminEmail))
                {
                    var adminRole = db.Roles.FirstOrDefault(r => r.Name == "Admin");
                    if (adminRole == null)
                    {
                        adminRole = new Role { Name = "Admin", IsSystemRole = true };
                        db.Roles.Add(adminRole);
                        await db.SaveChangesAsync();
                    }

                    var password = "12345678"; // dev password
                    var hashed = BCrypt.Net.BCrypt.HashPassword(password);

                    var admin = new User
                    {
                        Email = adminEmail,
                        FullName = "Admin Account",
                        Password = hashed,
                        IsEmailVerified = true,
                        RoleId = adminRole.Id,
                        CreatedAt = DateTime.UtcNow
                    };

                    db.Users.Add(admin);
                    await db.SaveChangesAsync();
                    logger?.LogInformation("Seeded dev admin {email}", adminEmail);
                }

                // Seed basic permissions and assign to Admin and SuperAdmin
                var allPermissions = new[] {
                    // News
                    Security.PermissionConstants.NewsRead,
                    Security.PermissionConstants.NewsCreate,
                    Security.PermissionConstants.NewsUpdate,
                    Security.PermissionConstants.NewsDelete,
                    // Videos
                    Security.PermissionConstants.VideoRead,
                    Security.PermissionConstants.VideoCreate,
                    Security.PermissionConstants.VideoUpdate,
                    Security.PermissionConstants.VideoDelete,
                    // Laws
                    Security.PermissionConstants.LawsRead,
                    Security.PermissionConstants.LawsCreate,
                    Security.PermissionConstants.LawsUpdate,
                    Security.PermissionConstants.LawsDelete,
                    // Publications
                    Security.PermissionConstants.PublicationsRead,
                    Security.PermissionConstants.PublicationsCreate,
                    Security.PermissionConstants.PublicationsUpdate,
                    Security.PermissionConstants.PublicationsDelete,
                    // Social
                    Security.PermissionConstants.SocialRead,
                    Security.PermissionConstants.SocialCreate,
                    Security.PermissionConstants.SocialUpdate,
                    Security.PermissionConstants.SocialDelete,
                    // Media
                    Security.PermissionConstants.MediaCreate,
                    // Notifications
                    Security.PermissionConstants.NotificationsRead,
                    // Users Management
                    Security.PermissionConstants.UsersRead,
                    Security.PermissionConstants.UsersCreate,
                    Security.PermissionConstants.UsersUpdate,
                    Security.PermissionConstants.UsersDelete,
                    // Contact / Messages
                    Security.PermissionConstants.ContactRead,
                    Security.PermissionConstants.ContactCreate,
                    Security.PermissionConstants.ContactUpdate,
                    Security.PermissionConstants.ContactDelete,
                    // Roles
                    Security.PermissionConstants.RolesRead,
                    Security.PermissionConstants.RolesCreate,
                    Security.PermissionConstants.RolesUpdate,
                    Security.PermissionConstants.RolesDelete,
                    // Audit Logs
                    Security.PermissionConstants.AuditRead,
                    Security.PermissionConstants.AuditExport,
                    // System Settings
                    Security.PermissionConstants.SettingsRead,
                    Security.PermissionConstants.SettingsUpdate,
                };

                var existingPerms = db.Permissions.Select(p => p.Name).ToHashSet(StringComparer.OrdinalIgnoreCase);
                foreach (var perm in allPermissions)
                {
                    if (!existingPerms.Contains(perm))
                    {
                        db.Permissions.Add(new Permission { Name = perm });
                    }
                }

                await db.SaveChangesAsync();

                // Ensure Admin and SuperAdmin have all permissions
                var adminRoleEntity = db.Roles.FirstOrDefault(r => r.Name == "Admin");
                var superRoleEntity = db.Roles.FirstOrDefault(r => r.Name == "SuperAdmin");
                var permissionsMap = db.Permissions.ToDictionary(p => p.Name, p => p.Id);

                if (adminRoleEntity != null)
                {
                    foreach (var perm in allPermissions)
                    {
                        var pid = permissionsMap[perm];
                        if (!db.RolePermissions.Any(rp => rp.RoleId == adminRoleEntity.Id && rp.PermissionId == pid))
                        {
                            db.RolePermissions.Add(new RolePermission { RoleId = adminRoleEntity.Id, PermissionId = pid });
                        }
                    }
                }

                if (superRoleEntity != null)
                {
                    foreach (var perm in allPermissions)
                    {
                        var pid = permissionsMap[perm];
                        if (!db.RolePermissions.Any(rp => rp.RoleId == superRoleEntity.Id && rp.PermissionId == pid))
                        {
                            db.RolePermissions.Add(new RolePermission { RoleId = superRoleEntity.Id, PermissionId = pid });
                        }
                    }
                }

                await db.SaveChangesAsync();

                // Clear Redis cache for roles so they pick up new permissions
                var cache = provider.GetService<Microsoft.Extensions.Caching.Distributed.IDistributedCache>();
                if (cache != null)
                {
                    if (adminRoleEntity != null) await cache.RemoveAsync($"role_permissions_{adminRoleEntity.Id}");
                    if (superRoleEntity != null) await cache.RemoveAsync($"role_permissions_{superRoleEntity.Id}");
                }
            }
            catch (Exception ex)
            {
                logger?.LogError(ex, "Error running dev seeder");
                throw;
            }
        }
    }
}

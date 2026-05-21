using System.Security.Claims;
using System.Text.Json;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Backend.Security;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/admin/roles")]
    public class RolesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IDistributedCache _cache;
        private readonly ISecurityAuditService _audit;

        public RolesController(ApplicationDbContext db, IDistributedCache cache, ISecurityAuditService audit)
        {
            _db = db;
            _cache = cache;
            _audit = audit;
        }

        [HttpGet]
        [HasPermission(PermissionConstants.RolesRead)]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _db.Roles
                .AsNoTracking()
                .OrderBy(r => r.Id)
                .Select(r => new RoleDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    IsSystemRole = r.IsSystemRole,
                    UserCount = r.Users.Count
                })
                .ToListAsync();

            return Ok(roles);
        }

        [HttpPost]
        [HasPermission(PermissionConstants.RolesCreate)]
        public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new MessageResponse { Message = "Validation failed." });
            }

            var normalizedName = request.Name.Trim();
            if (await _db.Roles.AnyAsync(r => r.Name.ToLower() == normalizedName.ToLower()))
            {
                return Conflict(new MessageResponse { Message = "Role name already exists." });
            }

            var role = new Role
            {
                Name = normalizedName,
                Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
                IsSystemRole = request.IsSystemRole
            };

            _db.Roles.Add(role);
            await _db.SaveChangesAsync();

            var result = new RoleDto
            {
                Id = role.Id,
                Name = role.Name,
                Description = role.Description,
                IsSystemRole = role.IsSystemRole,
                UserCount = 0
            };

            return Ok(result);
        }

        [HttpPut("{roleId:int}")]
        [HasPermission(PermissionConstants.RolesUpdate)]
        public async Task<IActionResult> UpdateRole(int roleId, [FromBody] UpdateRoleRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new MessageResponse { Message = "Validation failed." });
            }

            var role = await _db.Roles.FindAsync(roleId);
            if (role == null)
            {
                return NotFound(new MessageResponse { Message = "Role not found." });
            }

            var normalizedName = request.Name.Trim();
            var nameExists = await _db.Roles
                .AnyAsync(r => r.Id != roleId && r.Name.ToLower() == normalizedName.ToLower());
            if (nameExists)
            {
                return Conflict(new MessageResponse { Message = "Role name already exists." });
            }

            role.Name = normalizedName;
            role.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
            await _db.SaveChangesAsync();

            var userCount = await _db.Users.CountAsync(u => u.RoleId == roleId);
            return Ok(new RoleDto
            {
                Id = role.Id,
                Name = role.Name,
                Description = role.Description,
                IsSystemRole = role.IsSystemRole,
                UserCount = userCount
            });
        }

        [HttpDelete("{roleId:int}")]
        [HasPermission(PermissionConstants.RolesDelete)]
        public async Task<IActionResult> DeleteRole(int roleId)
        {
            var role = await _db.Roles.FirstOrDefaultAsync(r => r.Id == roleId);
            if (role == null)
            {
                return NotFound(new MessageResponse { Message = "Role not found." });
            }

            if (role.IsSystemRole)
            {
                return BadRequest(new MessageResponse
                {
                    Message = "System roles (SuperAdmin, Admin, User) cannot be deleted."
                });
            }

            var userCount = await _db.Users.CountAsync(u => u.RoleId == roleId);
            if (userCount > 0)
            {
                return Conflict(new MessageResponse
                {
                    Message = $"Cannot delete role because it is currently assigned to {userCount} users. Reassign users first."
                });
            }

            _db.Roles.Remove(role);
            await _db.SaveChangesAsync();

            return Ok(new MessageResponse { Message = "Role deleted successfully." });
        }

        [HttpGet("/api/admin/permissions")]
        [HasPermission(PermissionConstants.RolesRead)]
        public async Task<IActionResult> GetPermissions()
        {
            var permissions = await _db.Permissions
                .AsNoTracking()
                .OrderBy(p => p.Name)
                .Select(p => new PermissionDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description
                })
                .ToListAsync();

            return Ok(permissions);
        }

        [HttpGet("{roleId:int}/permissions")]
        [HasPermission(PermissionConstants.RolesRead)]
        public async Task<IActionResult> GetRolePermissions(int roleId)
        {
            var roleExists = await _db.Roles.AnyAsync(r => r.Id == roleId);
            if (!roleExists)
            {
                return NotFound(new MessageResponse { Message = "Role not found." });
            }

            var permissions = await _db.RolePermissions
                .Where(rp => rp.RoleId == roleId)
                .Select(rp => new PermissionDto
                {
                    Id = rp.PermissionId,
                    Name = rp.Permission.Name,
                    Description = rp.Permission.Description
                })
                .ToListAsync();

            return Ok(new { roleId, permissions });
        }

        [HttpPut("{roleId:int}/permissions")]
        [HasPermission(PermissionConstants.RolesUpdate)]
        public async Task<IActionResult> UpdateRolePermissions(int roleId, [FromBody] UpdateRolePermissionsRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new MessageResponse { Message = "Validation failed." });
            }

            var role = await _db.Roles.FindAsync(roleId);
            if (role == null)
            {
                return NotFound(new MessageResponse { Message = "Role not found." });
            }

            if (string.Equals(role.Name, RoleConstants.SuperAdmin, StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new MessageResponse
                {
                    Message = "SuperAdmin permissions are locked for safety and cannot be modified."
                });
            }

            var actorId = ResolveActorId();
            var actorEmail = ResolveActorEmail();
            if (!actorId.HasValue || string.IsNullOrWhiteSpace(actorEmail))
            {
                return Unauthorized(new MessageResponse { Message = "User identity not found." });
            }

            var distinctIds = request.PermissionIds.Distinct().ToList();
            var newPermissionNames = await _db.Permissions
                .Where(p => distinctIds.Contains(p.Id))
                .Select(p => p.Name)
                .ToListAsync();

            if (newPermissionNames.Count != distinctIds.Count)
            {
                return BadRequest(new MessageResponse { Message = "One or more permissions are invalid." });
            }

            var currentPermissionNames = await _db.RolePermissions
                .Where(rp => rp.RoleId == roleId)
                .Select(rp => rp.Permission.Name)
                .ToListAsync();

            var toRemove = _db.RolePermissions.Where(rp => rp.RoleId == roleId);
            _db.RolePermissions.RemoveRange(toRemove);

            foreach (var permissionId in distinctIds)
            {
                _db.RolePermissions.Add(new RolePermission
                {
                    RoleId = roleId,
                    PermissionId = permissionId
                });
            }

            await _db.SaveChangesAsync();

            await _audit.LogAsync(
                actorId.Value,
                actorEmail,
                "UpdateRolePermissions",
                roleId.ToString(),
                new
                {
                    OldPermissions = currentPermissionNames,
                    NewPermissions = newPermissionNames
                });

            await _cache.RemoveAsync($"role_permissions_{roleId}");

            var affectedUsers = await _db.Users.Where(u => u.RoleId == roleId).ToListAsync();
            if (affectedUsers.Count > 0)
            {
                var revocationTime = DateTime.UtcNow;
                foreach (var user in affectedUsers)
                {
                    user.TokenValidAfter = revocationTime;
                }

                await _db.SaveChangesAsync();

                foreach (var user in affectedUsers)
                {
                    await _cache.SetStringAsync(
                        $"user_revocation_time_{user.Id}",
                        JsonSerializer.Serialize(revocationTime),
                        new DistributedCacheEntryOptions
                        {
                            AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(1)
                        });
                }
            }

            return Ok(new MessageResponse { Message = "Permissions updated successfully." });
        }

        private int? ResolveActorId()
        {
            var subject = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)
                ?? User.FindFirstValue("id");

            return int.TryParse(subject, out var userId) ? userId : null;
        }

        private string? ResolveActorEmail()
        {
            return User.FindFirstValue(ClaimTypes.Email)
                ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Email)
                ?? User.FindFirstValue("email");
        }
    }
}

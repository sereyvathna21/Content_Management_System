using Backend.DTOs;
using Backend.Services;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/auth")]
    [Microsoft.AspNetCore.RateLimiting.EnableRateLimiting("Auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _auth;
        private readonly IAuditLogService _audit;

        public AuthController(IAuthService auth, IAuditLogService audit)
        {
            _auth = auth;
            _audit = audit;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var result = await _auth.LoginAsync(request);
            if (!result.Success)
            {
                await _audit.WriteAsync(new AuditLogEntry
                {
                    Action = "auth:login_failed",
                    EntityType = "Auth",
                    Summary = "Login failed",
                    Status = AuditLogStatus.Failure,
                    ErrorMessage = result.Message,
                    Metadata = new { request.Email }
                }, HttpContext);

                if (result.Message.Contains("blocked") || result.Message.Contains("verify") || result.Message.Contains("Invalid"))
                    return Unauthorized(new MessageResponse { Message = result.Message });

                return BadRequest(new MessageResponse { Message = result.Message });
            }

            if (result.Data?.User != null)
            {
                await _audit.WriteAsync(new AuditLogEntry
                {
                    Action = "auth:login",
                    EntityType = "User",
                    EntityId = result.Data.User.Id.ToString(),
                    Summary = "Login successful",
                    Status = AuditLogStatus.Success,
                    Metadata = new { result.Data.User.Email, result.Data.User.Role }
                }, HttpContext);
            }

            // The frontend should read this token and pass it via Authorization: Bearer
            return Ok(result.Data);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            // Clear the cookie in case one existed previously
            Response.Cookies.Delete("access_token", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None
            });

            await _audit.WriteAsync(new AuditLogEntry
            {
                Action = "auth:logout",
                EntityType = "Auth",
                Summary = "Logged out",
                Status = AuditLogStatus.Success
            }, HttpContext);
            return Ok(new MessageResponse { Message = "Logged out successfully." });
        }

        [HttpGet("verify-session")]
        [Authorize]
        public async Task<IActionResult> VerifySession()
        {
            var roleIdClaim = User.FindFirst("roleId")?.Value;
            if (string.IsNullOrWhiteSpace(roleIdClaim) || !int.TryParse(roleIdClaim, out var roleId))
            {
                return Forbid();
            }

            var permissions = await _auth.GetRolePermissionsAsync(roleId);

            return Ok(new
            {
                userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub),
                role = User.FindFirstValue(ClaimTypes.Role) ?? User.FindFirstValue("role"),
                permissions
            });
        }
    }
}

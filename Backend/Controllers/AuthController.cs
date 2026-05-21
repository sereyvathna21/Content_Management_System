using Backend.DTOs;
using Backend.Services;
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

        public AuthController(IAuthService auth)
        {
            _auth = auth;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var result = await _auth.LoginAsync(request);
            if (!result.Success)
            {
                if (result.Message.Contains("blocked") || result.Message.Contains("verify") || result.Message.Contains("Invalid"))
                    return Unauthorized(new MessageResponse { Message = result.Message });

                return BadRequest(new MessageResponse { Message = result.Message });
            }

            // The frontend should read this token and pass it via Authorization: Bearer
            return Ok(result.Data);
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // Clear the cookie in case one existed previously
            Response.Cookies.Delete("access_token", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None
            });
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

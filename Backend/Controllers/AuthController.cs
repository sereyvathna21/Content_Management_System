using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

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
    }
}

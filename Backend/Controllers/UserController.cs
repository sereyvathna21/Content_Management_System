using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/user")]
    [Microsoft.AspNetCore.RateLimiting.EnableRateLimiting("Auth")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _user;

        public UserController(IUserService user)
        {
            _user = user;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var result = await _user.RegisterAsync(request);
            if (!result.Success)
            {
                if (result.Message.Contains("exists") || result.Message.Contains("blocked"))
                    return Conflict(new MessageResponse { Message = result.Message });

                return BadRequest(new MessageResponse { Message = result.Message });
            }
            return Ok(new MessageResponse { Message = result.Message });
        }

        [HttpPost("verify-email")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
        {
            var result = await _user.VerifyEmailAsync(request);
            if (!result.Success)
            {
                if (result.Message.Contains("not found")) return NotFound(new MessageResponse { Message = result.Message });
                return BadRequest(new MessageResponse { Message = result.Message });
            }
            return Ok(new MessageResponse { Message = result.Message });
        }

        [HttpPost("resend-otp")]
        [AllowAnonymous]
        public async Task<IActionResult> ResendOtp([FromBody] ForgotPasswordRequest request)
        {
            var result = await _user.ResendOtpAsync(request);
            if (!result.Success)
            {
                if (result.Message.Contains("not found")) return NotFound(new MessageResponse { Message = result.Message });
                return BadRequest(new MessageResponse { Message = result.Message });
            }
            return Ok(new MessageResponse { Message = result.Message });
        }

        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var result = await _user.ForgotPasswordAsync(request);
            return Ok(new MessageResponse { Message = result.Message });
        }

        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var result = await _user.ResetPasswordAsync(request);
            if (!result.Success)
                return BadRequest(new MessageResponse { Message = result.Message });

            return Ok(new MessageResponse { Message = result.Message });
        }

        [HttpGet]
        [Authorize(Roles = "Admin,admin,SuperAdmin")]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? q = null)
        {
            var hasPaging = Request.Query.ContainsKey("page") || Request.Query.ContainsKey("pageSize") || Request.Query.ContainsKey("q");
            if (!hasPaging)
            {
                var users = await _user.GetAllUsersAsync();
                return Ok(users);
            }

            var (items, total) = await _user.GetUsersAsync(page, pageSize, q);
            return Ok(new { total, page, pageSize, items });
        }

        [HttpPost]
        [Authorize(Roles = "Admin,admin,SuperAdmin")]
        public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
        {
            var result = await _user.CreateUserAsync(request);
            if (!result.Success)
            {
                if (result.Message.Contains("exists") || result.Message.Contains("blocked"))
                    return Conflict(new MessageResponse { Message = result.Message });

                return BadRequest(new MessageResponse { Message = result.Message });
            }
            return Ok(result.Data);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin,admin,SuperAdmin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUserRequest request)
        {
            var result = await _user.UpdateUserAsync(id, request);
            if (!result.Success)
            {
                if (result.Message.Contains("not found")) return NotFound(new MessageResponse { Message = result.Message });
                if (result.Message.Contains("exists")) return Conflict(new MessageResponse { Message = result.Message });
                return BadRequest(new MessageResponse { Message = result.Message });
            }
            return Ok(result.Data);
        }
    }
}

using Backend.DTOs;
using Backend.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/user")]
    [Microsoft.AspNetCore.RateLimiting.EnableRateLimiting("Auth")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _user;
        private readonly IWebHostEnvironment _environment;

        public UserController(IUserService user, IWebHostEnvironment environment)
        {
            _user = user;
            _environment = environment;
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
        [Authorize(Roles = "Admin,SuperAdmin")]
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
        [Authorize(Roles = "Admin,SuperAdmin")]
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
        [Authorize(Roles = "Admin,SuperAdmin")]
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

        [HttpGet("me")]
        [Authorize]
        [DisableRateLimiting]
        public async Task<IActionResult> GetCurrentUser()
        {
            var subject = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("id");

            if (!int.TryParse(subject, out var userId))
            {
                return Unauthorized(new MessageResponse { Message = "User ID not found in token." });
            }

            var user = await _user.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new MessageResponse { Message = "User not found." });
            }

            return Ok(user);
        }

        [HttpPost("me/avatar")]
        [Authorize]
        [EnableRateLimiting("Auth")]
        [RequestSizeLimit(5_000_000)]
        public async Task<IActionResult> UploadCurrentUserAvatar([FromForm] IFormFile? file, CancellationToken cancellationToken)
        {
            var subject = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("id");

            if (!int.TryParse(subject, out var userId))
            {
                return Unauthorized(new MessageResponse { Message = "User ID not found in token." });
            }

            if (file == null || file.Length <= 0)
            {
                return BadRequest(new MessageResponse { Message = "Avatar file is required." });
            }

            var allowedExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                ".jpg",
                ".jpeg",
                ".png",
                ".webp",
                ".gif"
            };

            var extension = Path.GetExtension(file.FileName);
            if (string.IsNullOrWhiteSpace(extension) || !allowedExtensions.Contains(extension))
            {
                return BadRequest(new MessageResponse { Message = "Only jpg, jpeg, png, webp, and gif images are allowed." });
            }

            if (!await IsLikelyImageAsync(file, cancellationToken))
            {
                return BadRequest(new MessageResponse { Message = "Uploaded file is not a valid image." });
            }

            var webRoot = string.IsNullOrWhiteSpace(_environment.WebRootPath)
                ? Path.Combine(_environment.ContentRootPath, "wwwroot")
                : _environment.WebRootPath;

            var uploadRoot = Path.Combine(webRoot, "uploads", "avatars");
            Directory.CreateDirectory(uploadRoot);

            var fileName = $"{userId}-{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
            var destination = Path.Combine(uploadRoot, fileName);

            await using (var stream = new FileStream(destination, FileMode.Create, FileAccess.Write, FileShare.None))
            {
                await file.CopyToAsync(stream, cancellationToken);
            }

            var avatarUrl = $"/uploads/avatars/{fileName}";
            var current = await _user.GetUserByIdAsync(userId);
            if (current == null)
            {
                return NotFound(new MessageResponse { Message = "User not found." });
            }

            var merged = new UpdateUserRequest
            {
                FullName = current.FullName,
                Email = current.Email,
                Role = current.Role,
                Avatar = avatarUrl,
                Phone = current.Phone,
                Bio = current.Bio,
                Country = current.Country,
                City = current.City,
                PostalCode = current.PostalCode,
                Password = null,
                IsBlocked = current.IsBlocked
            };

            var result = await _user.UpdateUserAsync(userId, merged);
            if (!result.Success)
            {
                return BadRequest(new MessageResponse { Message = result.Message });
            }

            return Ok(new { avatarUrl });
        }

        [HttpPut("me")]
        [Authorize]
        [EnableRateLimiting("Auth")]
        public async Task<IActionResult> UpdateCurrentUser([FromBody] UpdateCurrentUserRequest request)
        {
            var subject = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("id");

            if (!int.TryParse(subject, out var userId))
            {
                return Unauthorized(new MessageResponse { Message = "User ID not found in token." });
            }

            var current = await _user.GetUserByIdAsync(userId);
            if (current == null)
            {
                return NotFound(new MessageResponse { Message = "User not found." });
            }

            // Keep required fields stable for partial profile updates.
            // Prevent users from elevating their own role: always keep the current role.
            var merged = new UpdateUserRequest
            {
                FullName = string.IsNullOrWhiteSpace(request.FullName) ? current.FullName : request.FullName,
                Email = string.IsNullOrWhiteSpace(request.Email) ? current.Email : request.Email,
                Role = current.Role, // ignore any role the caller provides
                Avatar = request.Avatar ?? current.Avatar,
                Phone = request.Phone ?? current.Phone,
                Bio = request.Bio ?? current.Bio,
                Country = request.Country ?? current.Country,
                City = request.City ?? current.City,
                PostalCode = request.PostalCode ?? current.PostalCode,
                Password = request.Password,
                IsBlocked = current.IsBlocked
            };

            var result = await _user.UpdateUserAsync(userId, merged);
            if (!result.Success)
            {
                if (result.Message.Contains("not found")) return NotFound(new MessageResponse { Message = result.Message });
                if (result.Message.Contains("exists")) return Conflict(new MessageResponse { Message = result.Message });
                return BadRequest(new MessageResponse { Message = result.Message });
            }

            return Ok(result.Data);
        }

        private static async Task<bool> IsLikelyImageAsync(IFormFile file, CancellationToken cancellationToken)
        {
            await using var stream = file.OpenReadStream();
            var header = new byte[12];
            var bytesRead = await stream.ReadAsync(header.AsMemory(0, header.Length), cancellationToken);
            if (bytesRead < 6)
            {
                return false;
            }

            var isJpeg = bytesRead >= 3 && header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF;
            var isPng = bytesRead >= 8 &&
                        header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47 &&
                        header[4] == 0x0D && header[5] == 0x0A && header[6] == 0x1A && header[7] == 0x0A;
            var isGif = bytesRead >= 6 &&
                        header[0] == 0x47 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x38 &&
                        (header[4] == 0x37 || header[4] == 0x39) && header[5] == 0x61;
            var isWebp = bytesRead >= 12 &&
                         header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46 &&
                         header[8] == 0x57 && header[9] == 0x45 && header[10] == 0x42 && header[11] == 0x50;

            return isJpeg || isPng || isGif || isWebp;
        }
    }
}

using Backend.Models;
using Backend.Services;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;

namespace Backend.Controllers.Admin
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly JwtService _jwtService;
        private readonly EmailService _emailService;
        private readonly IConfiguration _config;

        public AuthController(
            UserManager<AppUser> userManager,
            JwtService jwtService,
            EmailService emailService,
            IConfiguration config)
        {
            _userManager = userManager;
            _jwtService = jwtService;
            _emailService = emailService;
            _config = config;
        }

        // ── DTOs ──────────────────────────────────────────────────────────────

        public record RegisterDto(string FullName, string Email, string Password);
        public record LoginDto(string Email, string Password);
        public record ForgotPasswordDto(string Email);
        public record ResetPasswordDto(string Email, string Token, string NewPassword);
        public record GoogleAuthDto(string IdToken);

        // ── Register ─────────────────────────────────────────────────────────

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var existing = await _userManager.FindByEmailAsync(dto.Email);
            if (existing != null)
                return BadRequest(new { message = "Email is already registered." });

            var user = new AppUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                DisplayName = dto.FullName,
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

            var roleResult = await _userManager.AddToRoleAsync(user, "User");
            if (!roleResult.Succeeded)
            {
                await _userManager.DeleteAsync(user);
                return StatusCode(500, new { message = "Failed to assign user role. Please try again." });
            }

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var frontendBase = _config["Frontend:BaseUrl"];
            var verifyUrl = $"{frontendBase}/Landing-page/Authentication/VerifyEmail" +
                            $"?userId={Uri.EscapeDataString(user.Id)}" +
                            $"&token={Uri.EscapeDataString(token)}";

            string emailWarning = "";
            try
            {
                await _emailService.SendVerificationEmailAsync(user.Email, verifyUrl);
            }
            catch (Exception ex)
            {
                // Email is not critical — account was created. Log and surface a warning.
                Console.Error.WriteLine($"[EmailService] Failed to send verification email: {ex.Message}");
                emailWarning = " (Note: verification email could not be sent — check SMTP settings.)";
            }

            return Ok(new { message = $"Registration successful. Please check your email to verify your account.{emailWarning}" });
        }

        // ── Login ─────────────────────────────────────────────────────────────

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
                return Unauthorized(new { message = "Invalid email or password." });

            if (!user.EmailConfirmed)
                return Unauthorized(new { message = "Please verify your email before signing in." });

            var roles = await _userManager.GetRolesAsync(user);
            var token = _jwtService.GenerateToken(user, roles);

            return Ok(new
            {
                token,
                user = new
                {
                    id = user.Id,
                    email = user.Email,
                    name = user.DisplayName,
                    avatar = user.AvatarUrl,
                    roles,
                }
            });
        }

        // ── Verify Email ──────────────────────────────────────────────────────

        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail(
            [FromQuery] string userId,
            [FromQuery] string token)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return BadRequest(new { message = "Invalid verification link." });

            var result = await _userManager.ConfirmEmailAsync(user, token);
            if (!result.Succeeded)
                return BadRequest(new { message = "Email verification failed. The link may have expired." });

            return Ok(new { message = "Email verified successfully. You can now sign in." });
        }

        // ── Forgot Password ───────────────────────────────────────────────────

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            // Always return OK to prevent email enumeration
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null || !user.EmailConfirmed)
                return Ok(new { message = "If an account exists for that email, a reset link has been sent." });

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var frontendBase = _config["Frontend:BaseUrl"];
            var resetUrl = $"{frontendBase}/Landing-page/Authentication/Resetpassword" +
                           $"?email={Uri.EscapeDataString(user.Email!)}" +
                           $"&token={Uri.EscapeDataString(token)}";

            try
            {
                await _emailService.SendPasswordResetEmailAsync(user.Email!, resetUrl);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[EmailService] Failed to send password reset email: {ex.Message}");
            }

            return Ok(new { message = "If an account exists for that email, a reset link has been sent." });
        }

        // ── Reset Password ────────────────────────────────────────────────────

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return BadRequest(new { message = "Invalid request." });

            var result = await _userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);
            if (!result.Succeeded)
                return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

            return Ok(new { message = "Password has been reset successfully." });
        }

        // ── Google OAuth ──────────────────────────────────────────────────────

        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleAuthDto dto)
        {
            GoogleJsonWebSignature.Payload payload;
            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = [_config["Google:ClientId"]!]
                };
                payload = await GoogleJsonWebSignature.ValidateAsync(dto.IdToken, settings);
            }
            catch
            {
                return Unauthorized(new { message = "Invalid Google token." });
            }

            var user = await _userManager.FindByEmailAsync(payload.Email);
            if (user == null)
            {
                user = new AppUser
                {
                    UserName = payload.Email,
                    Email = payload.Email,
                    DisplayName = payload.Name,
                    AvatarUrl = payload.Picture,
                    GoogleId = payload.Subject,
                    EmailConfirmed = true,
                };
                var result = await _userManager.CreateAsync(user);
                if (!result.Succeeded)
                    return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

                await _userManager.AddToRoleAsync(user, "User");
            }
            else
            {
                if (string.IsNullOrEmpty(user.GoogleId))
                {
                    user.GoogleId = payload.Subject;
                    user.AvatarUrl ??= payload.Picture;
                    await _userManager.UpdateAsync(user);
                }
            }

            var roles = await _userManager.GetRolesAsync(user);
            var token = _jwtService.GenerateToken(user, roles);

            return Ok(new
            {
                token,
                user = new
                {
                    id = user.Id,
                    email = user.Email,
                    name = user.DisplayName,
                    avatar = user.AvatarUrl,
                    roles,
                }
            });
        }
    }
}

using System.Security.Cryptography;
using System.Text;
using Backend.Models;
using Backend.Models.Dtos;
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
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            UserManager<AppUser> userManager,
            JwtService jwtService,
            EmailService emailService,
            IConfiguration config,
            ILogger<AuthController> logger)
        {
            _userManager = userManager;
            _jwtService = jwtService;
            _emailService = emailService;
            _config = config;
            _logger = logger;
        }

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

            // Generate 6-digit OTP, hash it, and store hash with expiry + attempt count
            var otp = RandomNumberGenerator.GetInt32(100000, 1000000).ToString("D6");
            var otpHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(otp)));
            var expiry = DateTime.UtcNow.AddMinutes(10).ToString("o");
            await _userManager.SetAuthenticationTokenAsync(user, "EmailOTP", "otp", $"{otpHash}|{expiry}|0");

            string emailWarning = "";
            try
            {
                await _emailService.SendOtpEmailAsync(user.Email!, otp);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send OTP email to {Email}", user.Email);
                emailWarning = " (Note: OTP email could not be sent — check SMTP settings.)";
            }

            return Ok(new { message = $"Registration successful. Please check your email for a 6-digit verification code.{emailWarning}" });
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

        // ── Verify Email OTP ───────────────────────────────────────────────────

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return BadRequest(new { message = "Invalid request." });

            if (user.EmailConfirmed)
                return BadRequest(new { message = "Email is already verified." });

            var storedValue = await _userManager.GetAuthenticationTokenAsync(user, "EmailOTP", "otp");
            if (storedValue == null)
                return BadRequest(new { message = "No OTP found. Please request a new one." });

            var parts = storedValue.Split('|');
            var storedHash = parts[0];
            var expiry = parts.Length > 1 ? DateTime.Parse(parts[1], null, System.Globalization.DateTimeStyles.RoundtripKind) : DateTime.MinValue;
            var attempts = parts.Length > 2 ? int.Parse(parts[2]) : 0;

            if (DateTime.UtcNow > expiry)
            {
                await _userManager.RemoveAuthenticationTokenAsync(user, "EmailOTP", "otp");
                return BadRequest(new { message = "OTP has expired. Please request a new one." });
            }

            var incomingHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(dto.Otp)));
            if (!CryptographicOperations.FixedTimeEquals(
                    Convert.FromHexString(storedHash),
                    Convert.FromHexString(incomingHash)))
            {
                attempts++;
                if (attempts >= 3)
                {
                    await _userManager.RemoveAuthenticationTokenAsync(user, "EmailOTP", "otp");
                    return BadRequest(new { message = "Too many incorrect attempts. Please request a new code.", locked = true });
                }
                await _userManager.SetAuthenticationTokenAsync(user, "EmailOTP", "otp", $"{storedHash}|{expiry.ToString("o")}|{attempts}");
                return BadRequest(new { message = $"Invalid OTP. {3 - attempts} attempt{(3 - attempts == 1 ? "" : "s")} remaining." });
            }

            // Confirm email directly
            user.EmailConfirmed = true;
            await _userManager.UpdateAsync(user);
            await _userManager.RemoveAuthenticationTokenAsync(user, "EmailOTP", "otp");

            return Ok(new { message = "Email verified successfully. You can now sign in." });
        }

        // ── Resend OTP ─────────────────────────────────────────────────────────

        [HttpPost("resend-otp")]
        public async Task<IActionResult> ResendOtp([FromBody] ResendOtpDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null || user.EmailConfirmed)
                return Ok(new { message = "If the account exists and is unverified, a new code has been sent." });

            var otp = RandomNumberGenerator.GetInt32(100000, 1000000).ToString("D6");
            var otpHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(otp)));
            var expiry = DateTime.UtcNow.AddMinutes(10).ToString("o");
            await _userManager.SetAuthenticationTokenAsync(user, "EmailOTP", "otp", $"{otpHash}|{expiry}|0");

            try
            {
                await _emailService.SendOtpEmailAsync(user.Email!, otp);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to resend OTP email to {Email}", user.Email);
            }

            return Ok(new { message = "A new verification code has been sent to your email." });
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
                _logger.LogWarning(ex, "Failed to send password reset email to {Email}", user.Email);
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

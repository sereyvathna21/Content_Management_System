using System.Security.Cryptography;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/user")]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly EmailService _email;
        private readonly IConfiguration _config;

        public UserController(ApplicationDbContext db, EmailService email, IConfiguration config)
        {
            _db = db;
            _email = email;
            _config = config;
        }

        // POST /api/user/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.FullName))
                return BadRequest(new MessageResponse { Message = "All fields are required." });

            if (await _db.Users.AnyAsync(u => u.Email == request.Email))
                return Conflict(new MessageResponse { Message = "An account with this email already exists." });

            var otp = GenerateOtp();
            var expiryMinutes = int.Parse(_config["App:OtpExpiryMinutes"] ?? "10");

            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
                OtpCode = otp,
                OtpExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes),
                OtpAttempts = 0
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            await _email.SendOtpAsync(user.Email, otp, "Verify Your Email");

            return Ok(new MessageResponse { Message = "Registration successful. Please check your email for the verification code." });
        }

        // POST /api/user/verify-email
        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
        {
            const int maxAttempts = 5;

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
                return NotFound(new MessageResponse { Message = "User not found." });

            if (user.IsEmailVerified)
                return BadRequest(new MessageResponse { Message = "Email is already verified." });

            if (user.OtpCode == null || user.OtpExpiresAt < DateTime.UtcNow)
                return BadRequest(new MessageResponse { Message = "Verification code has expired. Please request a new one." });

            if (user.OtpAttempts >= maxAttempts)
            {
                user.OtpCode = null;
                user.OtpExpiresAt = null;
                user.OtpAttempts = 0;
                await _db.SaveChangesAsync();
                return BadRequest(new MessageResponse { Message = "Too many failed attempts. Please request a new verification code." });
            }

            if (user.OtpCode != request.Code)
            {
                user.OtpAttempts++;
                await _db.SaveChangesAsync();
                var remaining = maxAttempts - user.OtpAttempts;
                return BadRequest(new MessageResponse { Message = $"Invalid verification code. {remaining} attempt(s) remaining." });
            }

            user.IsEmailVerified = true;
            user.OtpCode = null;
            user.OtpExpiresAt = null;
            user.OtpAttempts = 0;
            await _db.SaveChangesAsync();

            return Ok(new MessageResponse { Message = "Email verified successfully. You can now log in." });
        }

        // POST /api/user/resend-otp
        [HttpPost("resend-otp")]
        public async Task<IActionResult> ResendOtp([FromBody] ForgotPasswordRequest request)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
                return NotFound(new MessageResponse { Message = "User not found." });

            if (user.IsEmailVerified)
                return BadRequest(new MessageResponse { Message = "Email is already verified." });

            var otp = GenerateOtp();
            var expiryMinutes = int.Parse(_config["App:OtpExpiryMinutes"] ?? "10");

            user.OtpCode = otp;
            user.OtpExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes);
            user.OtpAttempts = 0;
            await _db.SaveChangesAsync();

            await _email.SendOtpAsync(user.Email, otp, "Verify Your Email");

            return Ok(new MessageResponse { Message = "A new verification code has been sent to your email." });
        }

        // POST /api/user/forgot-password
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            // Always return OK to prevent email enumeration
            if (user == null)
                return Ok(new MessageResponse { Message = "If that email exists, a reset link has been sent." });

            var token = GenerateSecureToken();
            user.PasswordResetToken = token;
            user.PasswordResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(30);
            await _db.SaveChangesAsync();

            await _email.SendPasswordResetAsync(user.Email, token);

            return Ok(new MessageResponse { Message = "If that email exists, a reset link has been sent." });
        }

        // POST /api/user/reset-password
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null ||
                user.PasswordResetToken != request.Token ||
                user.PasswordResetTokenExpiresAt < DateTime.UtcNow)
                return BadRequest(new MessageResponse { Message = "Invalid or expired reset token." });

            user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiresAt = null;
            await _db.SaveChangesAsync();

            return Ok(new MessageResponse { Message = "Password has been reset successfully. You can now log in." });
        }

        private static string GenerateOtp() =>
            Random.Shared.Next(100000, 999999).ToString();

        private static string GenerateSecureToken() =>
            Convert.ToBase64String(RandomNumberGenerator.GetBytes(64))
                .Replace("+", "-").Replace("/", "_").Replace("=", "");
    }
}

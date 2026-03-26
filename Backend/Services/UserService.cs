using System.Security.Cryptography;
using AutoMapper;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _db;
        private readonly EmailService _email;
        private readonly IConfiguration _config;
        private readonly IMapper _mapper;

        public UserService(ApplicationDbContext db, EmailService email, IConfiguration config, IMapper mapper)
        {
            _db = db;
            _email = email;
            _config = config;
            _mapper = mapper;
        }

        public async Task<(bool Success, string Message)> RegisterAsync(RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.FullName))
                return (false, "All fields are required.");

            var existing = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (existing != null)
            {
                return (false, "An account with this email already exists.");
            }

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

            return (true, "Registration successful. Please check your email for the verification code.");
        }

        public async Task<(bool Success, string Message)> VerifyEmailAsync(VerifyEmailRequest request)
        {
            const int maxAttempts = 5;

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
                return (false, "User not found.");

            if (user.IsEmailVerified)
                return (false, "Email is already verified.");

            if (user.OtpCode == null || user.OtpExpiresAt < DateTime.UtcNow)
                return (false, "Verification code has expired. Please request a new one.");

            if (user.OtpAttempts >= maxAttempts)
            {
                user.OtpCode = null;
                user.OtpExpiresAt = null;
                user.OtpAttempts = 0;
                await _db.SaveChangesAsync();
                return (false, "Too many failed attempts. Please request a new verification code.");
            }

            if (user.OtpCode != request.Code)
            {
                user.OtpAttempts++;
                await _db.SaveChangesAsync();
                var remaining = maxAttempts - user.OtpAttempts;
                return (false, $"Invalid verification code. {remaining} attempt(s) remaining.");
            }

            user.IsEmailVerified = true;
            user.OtpCode = null;
            user.OtpExpiresAt = null;
            user.OtpAttempts = 0;
            await _db.SaveChangesAsync();

            return (true, "Email verified successfully. You can now log in.");
        }

        public async Task<(bool Success, string Message)> ResendOtpAsync(ForgotPasswordRequest request)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
                return (false, "User not found.");

            if (user.IsEmailVerified)
                return (false, "Email is already verified.");

            var otp = GenerateOtp();
            var expiryMinutes = int.Parse(_config["App:OtpExpiryMinutes"] ?? "10");

            user.OtpCode = otp;
            user.OtpExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes);
            user.OtpAttempts = 0;
            await _db.SaveChangesAsync();

            await _email.SendOtpAsync(user.Email, otp, "Verify Your Email");

            return (true, "A new verification code has been sent to your email.");
        }

        public async Task<(bool Success, string Message)> ForgotPasswordAsync(ForgotPasswordRequest request)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
                return (true, "If that email exists, a reset link has been sent.");

            var token = GenerateSecureToken();
            user.PasswordResetToken = token;
            user.PasswordResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(30);
            await _db.SaveChangesAsync();

            await _email.SendPasswordResetAsync(user.Email, token);

            return (true, "If that email exists, a reset link has been sent.");
        }

        public async Task<(bool Success, string Message)> ResetPasswordAsync(ResetPasswordRequest request)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null ||
                user.PasswordResetToken != request.Token ||
                user.PasswordResetTokenExpiresAt < DateTime.UtcNow)
                return (false, "Invalid or expired reset token.");

            user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiresAt = null;
            await _db.SaveChangesAsync();

            return (true, "Password has been reset successfully. You can now log in.");
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _db.Users.ToListAsync();
            return _mapper.Map<IEnumerable<UserDto>>(users);
        }

        public async Task<(bool Success, string Message, UserDto? Data)> CreateUserAsync(CreateUserRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.FullName))
                return (false, "All fields are required.", null);

            var existing = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (existing != null)
            {
                return (false, "An account with this email already exists.", null);
            }

            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = string.IsNullOrWhiteSpace(request.Role) ? "User" : request.Role,
                Avatar = request.Avatar,
                IsEmailVerified = true
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return (true, "User created successfully.", _mapper.Map<UserDto>(user));
        }

        public async Task<(bool Success, string Message, UserDto? Data)> UpdateUserAsync(int id, UpdateUserRequest request)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
                return (false, "User not found.", null);

            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.FullName))
                return (false, "Full name and email are required.", null);

            var emailExists = await _db.Users.AnyAsync(u => u.Email == request.Email && u.Id != id);
            if (emailExists)
                return (false, "An account with this email already exists.", null);

            if (request.IsBlocked != null)
            {
                user.IsBlocked = request.IsBlocked.Value;
            }

            user.FullName = request.FullName;
            user.Email = request.Email;
            user.Role = string.IsNullOrWhiteSpace(request.Role) ? user.Role : request.Role;
            user.Avatar = request.Avatar;

            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                user.Password = BCrypt.Net.BCrypt.HashPassword(request.Password);
            }

            await _db.SaveChangesAsync();

            return (true, "User updated successfully.", _mapper.Map<UserDto>(user));
        }

        private static string GenerateOtp() =>
            Random.Shared.Next(100000, 999999).ToString();

        private static string GenerateSecureToken() =>
            Convert.ToBase64String(RandomNumberGenerator.GetBytes(64))
                .Replace("+", "-").Replace("/", "_").Replace("=", "");
    }
}

using System.Security.Cryptography;
using System.Text.Json;
using AutoMapper;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Backend.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;

namespace Backend.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _db;
        private readonly EmailService _email;
        private readonly IConfiguration _config;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;
        private readonly IDistributedCache _distributedCache;

        public UserService(ApplicationDbContext db, EmailService email, IConfiguration config, IMapper mapper, IMemoryCache cache, IDistributedCache distributedCache)
        {
            _db = db;
            _email = email;
            _config = config;
            _mapper = mapper;
            _cache = cache;
            _distributedCache = distributedCache;
        }

        public async Task<(bool Success, string Message)> RegisterAsync(RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.FullName))
                return (false, "All fields are required.");

            var normalizedEmail = NormalizeEmail(request.Email);
            var existing = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
            if (existing != null)
            {
                if (existing.IsEmailVerified)
                {
                    return (false, "An account with this email already exists.");
                }
                else
                {
                    _db.Users.Remove(existing);
                    await _db.SaveChangesAsync();
                }
            }

            var otp = GenerateOtp();
            var expiryMinutes = int.Parse(_config["App:OtpExpiryMinutes"] ?? "10");

            var cacheKey = $"pending_reg_{normalizedEmail}";
            var pending = new PendingRegistration
            {
                FullName = request.FullName,
                Email = normalizedEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                OtpCode = otp,
                OtpExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes),
                OtpAttempts = 0
            };

            _cache.Set(cacheKey, pending, TimeSpan.FromMinutes(expiryMinutes));

            try
            {
                await _email.SendOtpAsync(normalizedEmail, otp, "Verify Your Email");
            }
            catch (Exception ex)
            {
                _cache.Remove(cacheKey);
                Console.WriteLine($"[UserService] Failed to send registration OTP to {normalizedEmail}: {ex.Message}");
                return (false, "Unable to send verification email right now. Please try again later.");
            }

            return (true, "Registration successful. Please check your email for the verification code.");
        }

        public async Task<(bool Success, string Message)> VerifyEmailAsync(VerifyEmailRequest request)
        {
            const int maxAttempts = 5;

            var normalizedEmail = NormalizeEmail(request.Email);
            var existing = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
            if (existing != null && existing.IsEmailVerified)
                return (false, "Email is already verified.");

            var cacheKey = $"pending_reg_{normalizedEmail}";
            if (!_cache.TryGetValue(cacheKey, out PendingRegistration? pending))
            {
                return (false, "Verification session expired or not found. Please register again.");
            }

            if (pending == null)
            {
                return (false, "Verification session expired or not found. Please register again.");
            }

            if (pending.OtpExpiresAt < DateTime.UtcNow)
            {
                _cache.Remove(cacheKey);
                return (false, "Verification code has expired. Please request a new one.");
            }

            if (pending.OtpAttempts >= maxAttempts)
            {
                _cache.Remove(cacheKey);
                return (false, "Too many failed attempts. Please register again.");
            }

            if (pending.OtpCode != request.Code)
            {
                pending.OtpAttempts++;
                _cache.Set(cacheKey, pending, pending.OtpExpiresAt - DateTime.UtcNow);
                var remaining = maxAttempts - pending.OtpAttempts;
                return (false, $"Invalid verification code. {remaining} attempt(s) remaining.");
            }

            var role = await GetRoleByNameAsync(RoleConstants.User);
            if (role == null)
            {
                return (false, "Default role not found. Please contact an administrator.");
            }

            var user = new User
            {
                FullName = pending.FullName,
                Email = pending.Email,
                Password = pending.PasswordHash,
                RoleId = role.Id,
                IsEmailVerified = true,
                OtpCode = null,
                OtpExpiresAt = null,
                OtpAttempts = 0
            };

            if (existing != null)
            {
                _db.Users.Remove(existing);
            }

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            _cache.Remove(cacheKey);

            return (true, "Email verified successfully. You can now log in.");
        }

        public async Task<(bool Success, string Message)> ResendOtpAsync(ForgotPasswordRequest request)
        {
            var normalizedEmail = NormalizeEmail(request.Email);
            var existing = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
            if (existing != null && existing.IsEmailVerified)
                return (false, "Email is already verified.");

            var cacheKey = $"pending_reg_{normalizedEmail}";
            if (!_cache.TryGetValue(cacheKey, out PendingRegistration? pending))
            {
                // Cache entry expired or server restarted — recover from DB if possible
                if (existing != null && !existing.IsEmailVerified)
                {
                    pending = new PendingRegistration
                    {
                        FullName = existing.FullName,
                        Email = existing.Email,
                        PasswordHash = existing.Password,
                        OtpCode = "",
                        OtpExpiresAt = DateTime.UtcNow,
                        OtpAttempts = 0
                    };
                }
                else
                {
                    return (false, "Registration session expired. Please register again.");
                }
            }

            if (pending == null)
            {
                return (false, "Registration session expired. Please register again.");
            }

            var otp = GenerateOtp();
            var expiryMinutes = int.Parse(_config["App:OtpExpiryMinutes"] ?? "10");

            pending.OtpCode = otp;
            pending.OtpExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes);
            pending.OtpAttempts = 0;

            _cache.Set(cacheKey, pending, TimeSpan.FromMinutes(expiryMinutes));

            await _email.SendOtpAsync(pending.Email, otp, "Verify Your Email");

            return (true, "A new verification code has been sent to your email.");
        }

        public async Task<(bool Success, string Message)> ForgotPasswordAsync(ForgotPasswordRequest request)
        {
            var normalizedEmail = NormalizeEmail(request.Email);
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
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
            var normalizedEmail = NormalizeEmail(request.Email);
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
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
            var users = await _db.Users
                .Include(u => u.Role)
                .ToListAsync();
            return _mapper.Map<IEnumerable<UserDto>>(users);
        }

        public async Task<(IEnumerable<UserDto> Items, int Total)> GetUsersAsync(int page, int pageSize, string? query)
        {
            page = Math.Max(1, page);
            pageSize = Math.Max(1, pageSize);

            var usersQuery = _db.Users
                .Include(u => u.Role)
                .AsQueryable();
            if (!string.IsNullOrWhiteSpace(query))
            {
                var q = query.Trim().ToLower();
                usersQuery = usersQuery.Where(u =>
                    u.FullName.ToLower().Contains(q) ||
                    u.Email.ToLower().Contains(q));
            }

            var total = await usersQuery.CountAsync();
            var users = await usersQuery
                .OrderByDescending(u => u.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (_mapper.Map<IEnumerable<UserDto>>(users), total);
        }

        public async Task<(bool Success, string Message, UserDto? Data)> CreateUserAsync(CreateUserRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.FullName))
                return (false, "All fields are required.", null);

            var normalizedEmail = NormalizeEmail(request.Email);
            var existing = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
            if (existing != null)
            {
                return (false, "An account with this email already exists.", null);
            }

            if (!RoleConstants.TryNormalize(request.Role, out var normalizedRole))
            {
                return (false, "Role must be one of: admin, user, superadmin.", null);
            }

            var role = await GetRoleByNameAsync(normalizedRole);
            if (role == null)
            {
                return (false, "Specified role does not exist.", null);
            }

            var user = new User
            {
                FullName = request.FullName,
                Email = normalizedEmail,
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
                RoleId = role.Id,
                Avatar = request.Avatar,
                Phone = request.Phone,
                Bio = request.Bio,
                Country = request.Country,
                City = request.City,
                PostalCode = request.PostalCode,
                IsEmailVerified = true
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            // FIX 1: Reload Role navigation property after save so mapper has it
            await _db.Entry(user).Reference(u => u.Role).LoadAsync();

            return (true, "User created successfully.", _mapper.Map<UserDto>(user));
        }

        public async Task<(bool Success, string Message, UserDto? Data)> UpdateUserAsync(int id, UpdateUserRequest request)
        {
            // FIX 2: Include Role so mapper has it after save
            var user = await _db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
                return (false, "User not found.", null);

            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.FullName))
                return (false, "Full name and email are required.", null);

            if (!RoleConstants.TryNormalize(request.Role, out var normalizedRole))
                return (false, "Role must be one of: admin, user, superadmin.", null);

            var role = await GetRoleByNameAsync(normalizedRole);
            if (role == null)
            {
                return (false, "Specified role does not exist.", null);
            }

            var normalizedEmail = NormalizeEmail(request.Email);

            var emailExists = await _db.Users.AnyAsync(u => u.Email == normalizedEmail && u.Id != id);
            if (emailExists)
                return (false, "An account with this email already exists.", null);

            var previousRoleId = user.RoleId;
            var previousIsBlocked = user.IsBlocked;

            if (request.IsBlocked != null)
            {
                user.IsBlocked = request.IsBlocked.Value;
            }

            user.FullName = request.FullName;
            user.Email = normalizedEmail;
            user.Avatar = request.Avatar;
            user.Phone = request.Phone ?? user.Phone;
            user.Bio = request.Bio ?? user.Bio;
            user.Country = request.Country ?? user.Country;
            user.City = request.City ?? user.City;
            user.PostalCode = request.PostalCode ?? user.PostalCode;

            // FIX 3: Check role/block change BEFORE updating RoleId, otherwise comparison is always false
            var shouldRevokeTokens = role.Id != previousRoleId || user.IsBlocked != previousIsBlocked;
            if (shouldRevokeTokens)
            {
                user.TokenValidAfter = DateTime.UtcNow;
            }

            user.RoleId = role.Id;

            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                user.Password = BCrypt.Net.BCrypt.HashPassword(request.Password);
            }

            await _db.SaveChangesAsync();

            if (shouldRevokeTokens && user.TokenValidAfter.HasValue)
            {
                await SyncUserRevocationCacheAsync(user.Id, user.TokenValidAfter.Value);
            }

            return (true, "User updated successfully.", _mapper.Map<UserDto>(user));
        }

        public async Task<UserDto?> GetUserByIdAsync(int userId)
        {
            var user = await _db.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return null;

            var dto = _mapper.Map<UserDto>(user);

            var cacheKey = $"role_permissions_{user.RoleId}";
            List<string> permissionsList;
            try
            {
                var cachedJson = await _distributedCache.GetStringAsync(cacheKey);
                if (!string.IsNullOrEmpty(cachedJson))
                {
                    var permissions = JsonSerializer.Deserialize<HashSet<string>>(cachedJson);
                    permissionsList = permissions?.ToList() ?? new List<string>();
                }
                else
                {
                    permissionsList = await _db.RolePermissions
                        .Where(rp => rp.RoleId == user.RoleId)
                        .Select(rp => rp.Permission.Name)
                        .ToListAsync();

                    if (permissionsList.Count > 0)
                    {
                        var permSet = new HashSet<string>(permissionsList);
                        await _distributedCache.SetStringAsync(
                            cacheKey,
                            JsonSerializer.Serialize(permSet),
                            new DistributedCacheEntryOptions
                            {
                                AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(1)
                            });
                    }
                }
            }
            catch
            {
                permissionsList = await _db.RolePermissions
                    .Where(rp => rp.RoleId == user.RoleId)
                    .Select(rp => rp.Permission.Name)
                    .ToListAsync();
            }

            dto.Permissions = permissionsList;
            return dto;
        }

        private async Task<Role?> GetRoleByNameAsync(string roleName)
        {
            return await _db.Roles.FirstOrDefaultAsync(r => r.Name == roleName);
        }

        private static string GenerateOtp() =>
            Random.Shared.Next(100000, 999999).ToString();

        private static string GenerateSecureToken() =>
            Convert.ToBase64String(RandomNumberGenerator.GetBytes(64))
                .Replace("+", "-").Replace("/", "_").Replace("=", "");

        private static string NormalizeEmail(string email) =>
            email.Trim().ToLowerInvariant();

        // FIX 4: Wrapped in try/catch so a Redis outage never crashes a user request
        private async Task SyncUserRevocationCacheAsync(int userId, DateTime revocationTime)
        {
            try
            {
                var cacheKey = $"user_revocation_time_{userId}";
                await _distributedCache.SetStringAsync(
                    cacheKey,
                    JsonSerializer.Serialize(revocationTime),
                    new DistributedCacheEntryOptions
                    {
                        AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(1)
                    });
            }
            catch (Exception ex)
            {
                // Redis unavailable — log and continue, don't crash the request
                Console.WriteLine($"[Cache] Failed to sync revocation cache for user {userId}: {ex.Message}");
            }
        }
    }

    public class PendingRegistration
    {
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public required string OtpCode { get; set; }
        public required DateTime OtpExpiresAt { get; set; }
        public int OtpAttempts { get; set; }
    }
}
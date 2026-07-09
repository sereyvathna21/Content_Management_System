using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AutoMapper;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Backend.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json;

namespace Backend.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _config;
        private readonly IMapper _mapper;
        private readonly IDistributedCache _cache;
        private readonly EmailService _email;

        public AuthService(ApplicationDbContext db, IConfiguration config, IMapper mapper, IDistributedCache cache, EmailService email)
        {
            _db = db;
            _config = config;
            _mapper = mapper;
            _cache = cache;
            _email = email;
        }

        public async Task<(bool Success, string Message, LoginResponse? Data)> LoginAsync(LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return (false, "Email and password are required.", null);

            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            var user = await _db.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == normalizedEmail);

            if (user != null && user.LockoutEnd.HasValue && user.LockoutEnd > DateTime.UtcNow)
                return (false, "Account is locked due to too many failed login attempts. Please try again later.", null);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            {
                if (user != null)
                {
                    user.FailedLoginAttempts++;
                    if (user.FailedLoginAttempts >= 5)
                    {
                        user.LockoutEnd = DateTime.UtcNow.AddMinutes(15);
                    }
                    await _db.SaveChangesAsync();
                }
                return (false, "Invalid email or password.", null);
            }

            if (user.IsBlocked)
                return (false, "This account is blocked. Please contact an administrator.", null);

            if (!user.IsEmailVerified)
                return (false, "Please verify your email before logging in.", null);

            user.FailedLoginAttempts = 0;
            user.LockoutEnd = null;

            if (user.IsMfaEnabled)
            {
                var otp = new Random().Next(100000, 999999).ToString();
                user.OtpCode = otp;
                user.OtpExpiresAt = DateTime.UtcNow.AddMinutes(10);
                await _db.SaveChangesAsync();
                
                await _email.SendOtpAsync(user.Email, otp, "Your MFA Login Code");
                
                return (true, "MFA required.", new LoginResponse { Token = "MFA_REQUIRED" });
            }

            await _db.SaveChangesAsync();

            var token = GenerateJwtToken(user);

            var response = new LoginResponse
            {
                Token = token,
                User = _mapper.Map<UserDto>(user)
            };
            var permissions = await GetRolePermissionsAsync(user.RoleId);
            response.User.Permissions = permissions.ToList();

            return (true, "Login successful.", response);
        }

        public async Task<(bool Success, string Message, LoginResponse? Data)> VerifyMfaAsync(VerifyMfaRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password) || string.IsNullOrWhiteSpace(request.Code))
                return (false, "Email, password, and code are required.", null);

            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            var user = await _db.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == normalizedEmail);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
                return (false, "Invalid email or password.", null);

            if (!user.IsMfaEnabled)
                return (false, "MFA is not enabled for this account.", null);

            if (user.OtpCode != request.Code || user.OtpExpiresAt < DateTime.UtcNow)
                return (false, "Invalid or expired MFA code.", null);

            // Clear the OTP code
            user.OtpCode = null;
            user.OtpExpiresAt = null;
            await _db.SaveChangesAsync();

            var token = GenerateJwtToken(user);

            var response = new LoginResponse
            {
                Token = token,
                User = _mapper.Map<UserDto>(user)
            };
            var permissions = await GetRolePermissionsAsync(user.RoleId);
            response.User.Permissions = permissions.ToList();

            return (true, "MFA Verification successful.", response);
        }

        private string GenerateJwtToken(User user)
        {
            var secret = _config["Jwt:Secret"]!;
            var issuer = _config["Jwt:Issuer"]!;
            var audience = _config["Jwt:Audience"]!;
            var expiryMinutes = int.Parse(_config["Jwt:ExpiryMinutes"] ?? "1440");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var normalizedRole = RoleConstants.NormalizeOrDefault(user.Role?.Name);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("fullName", user.FullName ?? ""),
                new Claim("roleId", user.RoleId.ToString()),
                new Claim(ClaimTypes.Role, normalizedRole),
                new Claim("role", normalizedRole),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<IReadOnlyCollection<string>> GetRolePermissionsAsync(int roleId)
        {
            var cacheKey = $"role_permissions_{roleId}";
            var cachedJson = await _cache.GetStringAsync(cacheKey);

            if (!string.IsNullOrEmpty(cachedJson))
            {
                var cachedPermissions = JsonSerializer.Deserialize<HashSet<string>>(cachedJson);
                if (cachedPermissions != null)
                {
                    return cachedPermissions;
                }
            }

            var dbPermissions = await _db.RolePermissions
                .Where(rp => rp.RoleId == roleId)
                .Select(rp => rp.Permission.Name)
                .ToListAsync();

            var permissions = new HashSet<string>(dbPermissions);

            await _cache.SetStringAsync(
                cacheKey,
                JsonSerializer.Serialize(permissions),
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(1)
                });

            return permissions;
        }
    }
}

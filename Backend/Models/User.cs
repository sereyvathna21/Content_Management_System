namespace Backend.Models
{
    public class User
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? Avatar { get; set; }
        public string? Phone { get; set; }
        public string? Bio { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? PostalCode { get; set; }
        public string Role { get; set; } = "User";
        public bool IsEmailVerified { get; set; }
        public string? OtpCode { get; set; }
        public DateTime? OtpExpiresAt { get; set; }
        public int OtpAttempts { get; set; } = 0;
        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetTokenExpiresAt { get; set; }
        public bool IsBlocked { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

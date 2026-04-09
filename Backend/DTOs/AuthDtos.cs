using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(128)]
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public UserDto User { get; set; } = new();
    }

    public class RegisterRequest
    {
        [Required]
        [MaxLength(120)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(8)]
        [MaxLength(128)]
        public string Password { get; set; } = string.Empty;
    }

    public class CreateUserRequest
    {
        [Required]
        [MaxLength(120)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(8)]
        [MaxLength(128)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [RegularExpression("^(?i)(admin|user|superadmin)$", ErrorMessage = "Role must be one of: admin, user, superadmin.")]
        public string Role { get; set; } = "User";

        [MaxLength(2048)]
        public string? Avatar { get; set; }

        [MaxLength(30)]
        public string? Phone { get; set; }

        [MaxLength(1000)]
        public string? Bio { get; set; }

        [MaxLength(100)]
        public string? Country { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(20)]
        public string? PostalCode { get; set; }
    }

    public class UpdateUserRequest
    {
        [Required]
        [MaxLength(120)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [RegularExpression("^(?i)(admin|user|superadmin)$", ErrorMessage = "Role must be one of: admin, user, superadmin.")]
        public string Role { get; set; } = "User";

        [MaxLength(2048)]
        public string? Avatar { get; set; }

        [MaxLength(30)]
        public string? Phone { get; set; }

        [MaxLength(1000)]
        public string? Bio { get; set; }

        [MaxLength(100)]
        public string? Country { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(20)]
        public string? PostalCode { get; set; }

        [MinLength(8)]
        [MaxLength(128)]
        public string? Password { get; set; }

        public bool? IsBlocked { get; set; }
    }

    public class UpdateCurrentUserRequest
    {
        [MaxLength(120)]
        public string? FullName { get; set; }

        [EmailAddress]
        [MaxLength(255)]
        public string? Email { get; set; }

        [MaxLength(2048)]
        public string? Avatar { get; set; }

        [MaxLength(30)]
        public string? Phone { get; set; }

        [MaxLength(1000)]
        public string? Bio { get; set; }

        [MaxLength(100)]
        public string? Country { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(20)]
        public string? PostalCode { get; set; }

        [MinLength(8)]
        [MaxLength(128)]
        public string? Password { get; set; }
    }

    public class VerifyEmailRequest
    {
        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(4)]
        [MaxLength(20)]
        public string Code { get; set; } = string.Empty;
    }

    public class ForgotPasswordRequest
    {
        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordRequest
    {
        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(512)]
        public string Token { get; set; } = string.Empty;

        [Required]
        [MinLength(8)]
        [MaxLength(128)]
        public string NewPassword { get; set; } = string.Empty;
    }

    public class UserDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? Avatar { get; set; }
        public string? Phone { get; set; }
        public string? Bio { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? PostalCode { get; set; }
        public bool IsBlocked { get; set; }
        public bool PasswordSet { get; set; }
    }

    public class MessageResponse
    {
        public string Message { get; set; } = string.Empty;
    }
}

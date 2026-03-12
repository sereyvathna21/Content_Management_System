using System.ComponentModel.DataAnnotations;

namespace Backend.Models.Dtos
{
    public record RegisterDto(
        [Required, MaxLength(100)] string FullName,
        [Required, EmailAddress, MaxLength(256)] string Email,
        [Required, MinLength(8), MaxLength(128)] string Password);

    public record LoginDto(
        [Required, EmailAddress] string Email,
        [Required] string Password);

    public record ForgotPasswordDto(
        [Required, EmailAddress] string Email);

    public record ResetPasswordDto(
        [Required, EmailAddress] string Email,
        [Required] string Token,
        [Required, MinLength(8)] string NewPassword);

    public record GoogleAuthDto(
        [Required] string IdToken);

    public record VerifyOtpDto(
        [Required, EmailAddress] string Email,
        [Required, Length(6, 6)] string Otp);

    public record ResendOtpDto(
        [Required, EmailAddress] string Email);
}

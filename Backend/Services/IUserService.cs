using Backend.DTOs;
using Backend.Models;

namespace Backend.Services
{
    public interface IUserService
    {
        Task<(bool Success, string Message)> RegisterAsync(RegisterRequest request);
        Task<(bool Success, string Message)> VerifyEmailAsync(VerifyEmailRequest request);
        Task<(bool Success, string Message)> ResendOtpAsync(ForgotPasswordRequest request);
        Task<(bool Success, string Message)> ForgotPasswordAsync(ForgotPasswordRequest request);
        Task<(bool Success, string Message)> ResetPasswordAsync(ResetPasswordRequest request);

        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task<(IEnumerable<UserDto> Items, int Total)> GetUsersAsync(int page, int pageSize, string? query);
        Task<(bool Success, string Message, UserDto? Data)> CreateUserAsync(CreateUserRequest request);
        Task<(bool Success, string Message, UserDto? Data)> UpdateUserAsync(int id, UpdateUserRequest request);
    }
}

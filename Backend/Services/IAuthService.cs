using Backend.DTOs;
using Backend.Models;

namespace Backend.Services
{
    public interface IAuthService
    {
        Task<(bool Success, string Message, LoginResponse? Data)> LoginAsync(LoginRequest request);
    }
}

using UserService.DTOs.Requests;
using UserService.DTOs.Responses;
using UserService.Entities;


namespace UserService.Services.Interfaces;

public interface IUserService
{
    Task RegisterAsync(RegisterRequest request);

    Task<LoginResponse> LoginAsync(LoginRequest request);

    Task<List<User>> GetAllUsersAsync();

    Task<User?> GetUserByIdAsync(Guid id);
}
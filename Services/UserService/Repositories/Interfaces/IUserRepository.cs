using UserService.Entities;

namespace UserService.Repositories.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);

    Task<User?> GetByIdAsync(Guid id);

    Task AddAsync(User user);

    Task<List<User>> GetAllAsync();

    Task SaveChangesAsync();
}
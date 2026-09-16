using UserService.Entities;

namespace UserService.Data;

public static class DbSeeder
{
    public static async Task SeedAdminAsync(
        UserDbContext context)
    {
        if (context.Users.Any())
            return;

        context.Users.Add(
            new User
            {
                Id = Guid.NewGuid(),
                Name = "System Admin",
                Email = "admin@pharmacy.com",
                MobileNumber = "9999999999",
                PasswordHash =
                    BCrypt.Net.BCrypt.HashPassword(
                        "Admin123"),
                Role = Role.Admin,
                CreatedOn = DateTime.UtcNow
            });

        await context.SaveChangesAsync();
    }
}
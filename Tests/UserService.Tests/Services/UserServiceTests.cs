using FluentAssertions;
using Moq;
using NUnit.Framework;
using Microsoft.Extensions.Configuration;
using UserService.DTOs.Requests;
using UserService.Entities;
using UserService.Helpers;
using UserService.Repositories.Interfaces;
using UserService.Services;

namespace UserService.Tests.Services;

[TestFixture]
public class UserServiceTests
{
    private Mock<IUserRepository> _repository = null!;
    private UserService.Services.UserService _service = null!;

    [SetUp]
    public void SetUp()
    {
        _repository = new Mock<IUserRepository>();
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "test-key-that-is-long-enough-for-hmac",
                ["Jwt:Issuer"] = "UserService",
                ["Jwt:Audience"] = "PharmacyManagementSystem"
            })
            .Build();
        _service = new UserService.Services.UserService(
            _repository.Object,
            new JwtTokenGenerator(configuration));
    }

    [Test]
    public async Task RegisterAsync_ShouldPersistAdminWithCanonicalRole_WhenRoleIsMixedCase()
    {
        User? savedUser = null;
        _repository.Setup(x => x.GetByEmailAsync("admin@example.com"))
            .ReturnsAsync((User?)null);
        _repository.Setup(x => x.AddAsync(It.IsAny<User>()))
            .Callback<User>(user => savedUser = user)
            .Returns(Task.CompletedTask);

        await _service.RegisterAsync(new RegisterRequest
        {
            Name = "Admin",
            Email = "admin@example.com",
            MobileNumber = "1234567890",
            Password = "Password1!",
            Role = "aDmIn"
        });

        savedUser.Should().NotBeNull();
        savedUser!.Role.Should().Be(Role.Admin);
        savedUser.PasswordHash.Should().NotBe("Password1!");
        _repository.Verify(x => x.SaveChangesAsync(), Times.Once);
    }

    [Test]
    public async Task RegisterAsync_ShouldThrowDuplicateException_WhenEmailAlreadyExists()
    {
        _repository.Setup(x => x.GetByEmailAsync("existing@example.com"))
            .ReturnsAsync(new User { Email = "existing@example.com" });

        var action = () => _service.RegisterAsync(new RegisterRequest
        {
            Email = "existing@example.com",
            Role = Role.Doctor,
            Password = "Password1!"
        });

        await action.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("User already exists.");
        _repository.Verify(x => x.AddAsync(It.IsAny<User>()), Times.Never);
    }

    [Test]
    public async Task LoginAsync_ShouldReturnJwtAndRole_WhenCredentialsAreValid()
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = "Doctor",
            Email = "doctor@example.com",
            Role = Role.Doctor,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password1!")
        };
        _repository.Setup(x => x.GetByEmailAsync(user.Email)).ReturnsAsync(user);

        var response = await _service.LoginAsync(new LoginRequest
        {
            Email = user.Email,
            Password = "Password1!"
        });

        response.Token.Should().NotBeNullOrWhiteSpace();
        response.Role.Should().Be(Role.Doctor);
        response.Email.Should().Be(user.Email);
    }

    [Test]
    public async Task LoginAsync_ShouldRejectCredentials_WhenPasswordIsInvalid()
    {
        _repository.Setup(x => x.GetByEmailAsync("doctor@example.com"))
            .ReturnsAsync(new User
            {
                Email = "doctor@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("correct")
            });

        var action = () => _service.LoginAsync(new LoginRequest
        {
            Email = "doctor@example.com",
            Password = "wrong"
        });

        await action.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Invalid credentials.");
    }
}

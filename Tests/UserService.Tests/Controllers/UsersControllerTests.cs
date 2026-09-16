using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NUnit.Framework;
using UserService.DTOs.Requests;
using UserService.DTOs.Responses;
using UserService.Entities;
using UserService.Services.Interfaces;
using UserService.Controllers;

namespace UserService.Tests.Controllers;

[TestFixture]
public class UsersControllerTests
{
    [Test]
    public async Task Register_ShouldReturnOk_WhenServiceRegistersUser()
    {
        var service = new Mock<IUserService>();
        var controller = new UsersController(service.Object);

        var result = await controller.Register(new RegisterRequest());

        result.Should().BeOfType<OkObjectResult>();
        service.Verify(x => x.RegisterAsync(It.IsAny<RegisterRequest>()), Times.Once);
    }

    [Test]
    public async Task Register_ShouldReturnConflict_WhenEmailAlreadyExists()
    {
        var service = new Mock<IUserService>();
        service.Setup(x => x.RegisterAsync(It.IsAny<RegisterRequest>()))
            .ThrowsAsync(new InvalidOperationException("User already exists."));
        var controller = new UsersController(service.Object);

        var result = await controller.Register(new RegisterRequest());

        var conflict = result.Should().BeOfType<ConflictObjectResult>().Subject;
        conflict.Value.Should().NotBeNull();
    }

    [Test]
    public async Task Login_ShouldReturnUnauthorized_WhenCredentialsAreInvalid()
    {
        var service = new Mock<IUserService>();
        service.Setup(x => x.LoginAsync(It.IsAny<LoginRequest>()))
            .ThrowsAsync(new UnauthorizedAccessException("Invalid credentials."));
        var controller = new UsersController(service.Object);

        var result = await controller.Login(new LoginRequest());

        result.Should().BeOfType<UnauthorizedObjectResult>();
    }

    [Test]
    public async Task GetAllUsers_ShouldReturnUsers_WhenAuthenticated()
    {
        var users = new List<User> { new() { Id = Guid.NewGuid(), Name = "Admin" } };
        var service = new Mock<IUserService>();
        service.Setup(x => x.GetAllUsersAsync()).ReturnsAsync(users);
        var controller = new UsersController(service.Object);

        var result = await controller.GetAllUsers();

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        ok.Value.Should().BeSameAs(users);
    }
}

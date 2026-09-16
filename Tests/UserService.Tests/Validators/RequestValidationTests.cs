using FluentAssertions;
using NUnit.Framework;
using System.ComponentModel.DataAnnotations;
using UserService.DTOs.Requests;

namespace UserService.Tests.Validators;

[TestFixture]
public class RequestValidationTests
{
    [Test]
    public void RegisterRequest_ShouldRejectInvalidMobileNumber()
    {
        var request = new RegisterRequest { MobileNumber = "123" };
        var results = Validate(request);

        results.Should().Contain(error => error.MemberNames.Contains(nameof(RegisterRequest.MobileNumber)));
    }

    [Test]
    public void RegisterRequest_ShouldRejectInvalidRole()
    {
        var request = new RegisterRequest { Role = "Nurse" };
        var results = Validate(request);

        results.Should().Contain(error => error.MemberNames.Contains(nameof(RegisterRequest.Role)));
    }

    [Test]
    public void LoginRequest_ShouldRejectInvalidEmail()
    {
        var results = Validate(new LoginRequest { Email = "not-an-email" });

        results.Should().Contain(error => error.MemberNames.Contains(nameof(LoginRequest.Email)));
    }

    private static List<ValidationResult> Validate(object model)
    {
        var context = new ValidationContext(model);
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(model, context, results, validateAllProperties: true);
        return results;
    }
}

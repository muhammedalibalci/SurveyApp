using FluentValidation.TestHelper;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Validators;

namespace SurveyApp.Tests.Validators;

public class RegisterRequestValidatorTests
{
    private readonly RegisterRequestValidator _validator = new();

    [Fact]
    public void ValidRequest_NoErrors()
    {
        var model = new RegisterRequest
        {
            Email = "test@test.com",
            Password = "123456",
            FullName = "Test User"
        };

        var result = _validator.TestValidate(model);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void EmptyEmail_HasError()
    {
        var model = new RegisterRequest { Email = "", Password = "123456", FullName = "Test" };

        _validator.TestValidate(model).ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void InvalidEmail_HasError()
    {
        var model = new RegisterRequest { Email = "bad", Password = "123456", FullName = "Test" };

        _validator.TestValidate(model).ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void ShortPassword_HasError()
    {
        var model = new RegisterRequest { Email = "test@test.com", Password = "12345", FullName = "Test" };

        _validator.TestValidate(model).ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public void EmptyPassword_HasError()
    {
        var model = new RegisterRequest { Email = "test@test.com", Password = "", FullName = "Test" };

        _validator.TestValidate(model).ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public void EmptyFullName_HasError()
    {
        var model = new RegisterRequest { Email = "test@test.com", Password = "123456", FullName = "" };

        _validator.TestValidate(model).ShouldHaveValidationErrorFor(x => x.FullName);
    }

    [Fact]
    public void TooLongFullName_HasError()
    {
        var model = new RegisterRequest
        {
            Email = "test@test.com",
            Password = "123456",
            FullName = new string('A', 201)
        };

        _validator.TestValidate(model).ShouldHaveValidationErrorFor(x => x.FullName);
    }

    [Fact]
    public void ExactlyMinPasswordLength_NoError()
    {
        var model = new RegisterRequest { Email = "test@test.com", Password = "123456", FullName = "Test" };

        _validator.TestValidate(model).ShouldNotHaveValidationErrorFor(x => x.Password);
    }
}

using FluentValidation.TestHelper;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Validators;

namespace SurveyApp.Tests.Validators;

public class CreateSurveyRequestValidatorTests
{
    private readonly CreateSurveyRequestValidator _validator = new();

    private static CreateSurveyRequest ValidRequest() => new()
    {
        Title = "Test Survey",
        Description = "Description",
        StartDate = DateTime.UtcNow,
        EndDate = DateTime.UtcNow.AddDays(7),
        IsActive = true,
        Questions = new List<SurveyQuestionInput> { new() { QuestionId = 1, Order = 1 } },
        AssignedUserIds = new List<int> { 1 }
    };

    [Fact]
    public void ValidRequest_NoErrors()
    {
        _validator.TestValidate(ValidRequest()).ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void EmptyTitle_HasError()
    {
        var model = ValidRequest();
        model.Title = "";

        _validator.TestValidate(model).ShouldHaveValidationErrorFor(x => x.Title);
    }

    [Fact]
    public void TooLongTitle_HasError()
    {
        var model = ValidRequest();
        model.Title = new string('A', 301);

        _validator.TestValidate(model).ShouldHaveValidationErrorFor(x => x.Title);
    }

    [Fact]
    public void TooLongDescription_HasError()
    {
        var model = ValidRequest();
        model.Description = new string('A', 2001);

        _validator.TestValidate(model).ShouldHaveValidationErrorFor(x => x.Description);
    }

    [Fact]
    public void EndDateBeforeStartDate_HasError()
    {
        var model = ValidRequest();
        model.EndDate = model.StartDate.AddDays(-1);

        _validator.TestValidate(model).ShouldHaveValidationErrorFor(x => x.EndDate);
    }

    [Fact]
    public void EmptyQuestions_HasError()
    {
        var model = ValidRequest();
        model.Questions = new List<SurveyQuestionInput>();

        _validator.TestValidate(model).ShouldHaveValidationErrorFor(x => x.Questions);
    }

    [Fact]
    public void InvalidQuestionId_HasError()
    {
        var model = ValidRequest();
        model.Questions = new List<SurveyQuestionInput> { new() { QuestionId = 0, Order = 1 } };

        var result = _validator.TestValidate(model);

        result.ShouldHaveAnyValidationError();
    }
}

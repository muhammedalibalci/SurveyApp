using FluentValidation.TestHelper;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Validators;

namespace SurveyApp.Tests.Validators;

public class SubmitSurveyRequestValidatorTests
{
    private readonly SubmitSurveyRequestValidator _validator = new();

    private static SubmitSurveyRequest ValidRequest() => new()
    {
        SurveyId = 1,
        Answers = new List<AnswerInput>
        {
            new() { QuestionId = 1, SelectedOptionId = 1 }
        }
    };

    [Fact]
    public void ValidRequest_NoErrors()
    {
        _validator.TestValidate(ValidRequest()).ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void ZeroSurveyId_HasError()
    {
        var model = ValidRequest();
        model.SurveyId = 0;

        _validator.TestValidate(model).ShouldHaveValidationErrorFor(x => x.SurveyId);
    }

    [Fact]
    public void EmptyAnswers_HasError()
    {
        var model = ValidRequest();
        model.Answers = new List<AnswerInput>();

        _validator.TestValidate(model).ShouldHaveValidationErrorFor(x => x.Answers);
    }

    [Fact]
    public void InvalidQuestionId_HasError()
    {
        var model = ValidRequest();
        model.Answers = new List<AnswerInput> { new() { QuestionId = 0, SelectedOptionId = 1 } };

        _validator.TestValidate(model).ShouldHaveAnyValidationError();
    }

    [Fact]
    public void InvalidSelectedOptionId_HasError()
    {
        var model = ValidRequest();
        model.Answers = new List<AnswerInput> { new() { QuestionId = 1, SelectedOptionId = 0 } };

        _validator.TestValidate(model).ShouldHaveAnyValidationError();
    }
}

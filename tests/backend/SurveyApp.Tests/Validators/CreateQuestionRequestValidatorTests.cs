using FluentValidation.TestHelper;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Validators;

namespace SurveyApp.Tests.Validators;

public class CreateQuestionRequestValidatorTests
{
    private readonly CreateQuestionRequestValidator _validator = new();

    [Fact]
    public void ValidRequest_NoErrors()
    {
        var model = new CreateQuestionRequest { Text = "What is this?", AnswerTemplateId = 1 };

        _validator.TestValidate(model).ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void EmptyText_HasError()
    {
        var model = new CreateQuestionRequest { Text = "", AnswerTemplateId = 1 };

        _validator.TestValidate(model).ShouldHaveValidationErrorFor(x => x.Text);
    }

    [Fact]
    public void TooLongText_HasError()
    {
        var model = new CreateQuestionRequest { Text = new string('A', 1001), AnswerTemplateId = 1 };

        _validator.TestValidate(model).ShouldHaveValidationErrorFor(x => x.Text);
    }

    [Fact]
    public void ZeroAnswerTemplateId_HasError()
    {
        var model = new CreateQuestionRequest { Text = "Q?", AnswerTemplateId = 0 };

        _validator.TestValidate(model).ShouldHaveValidationErrorFor(x => x.AnswerTemplateId);
    }

    [Fact]
    public void NegativeAnswerTemplateId_HasError()
    {
        var model = new CreateQuestionRequest { Text = "Q?", AnswerTemplateId = -1 };

        _validator.TestValidate(model).ShouldHaveValidationErrorFor(x => x.AnswerTemplateId);
    }
}

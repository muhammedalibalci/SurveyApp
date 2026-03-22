using FluentValidation.TestHelper;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Validators;

namespace SurveyApp.Tests.Validators;

public class CreateAnswerTemplateRequestValidatorTests
{
    private readonly CreateAnswerTemplateRequestValidator _validator = new();

    private static CreateAnswerTemplateRequest ValidRequest() => new()
    {
        Name = "Yes/No",
        Options = new List<CreateAnswerOptionRequest>
        {
            new() { Text = "Yes", Order = 1 },
            new() { Text = "No", Order = 2 }
        }
    };

    [Fact]
    public void ValidRequest_NoErrors()
    {
        _validator.TestValidate(ValidRequest()).ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void EmptyName_HasError()
    {
        var model = ValidRequest();
        model.Name = "";

        _validator.TestValidate(model).ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void TooLongName_HasError()
    {
        var model = ValidRequest();
        model.Name = new string('A', 201);

        _validator.TestValidate(model).ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void OneOption_HasError()
    {
        var model = ValidRequest();
        model.Options = new List<CreateAnswerOptionRequest>
        {
            new() { Text = "Only", Order = 1 }
        };

        _validator.TestValidate(model).ShouldHaveValidationErrorFor(x => x.Options);
    }

    [Fact]
    public void FiveOptions_HasError()
    {
        var model = ValidRequest();
        model.Options = Enumerable.Range(1, 5)
            .Select(i => new CreateAnswerOptionRequest { Text = $"Opt {i}", Order = i })
            .ToList();

        _validator.TestValidate(model).ShouldHaveValidationErrorFor(x => x.Options);
    }

    [Fact]
    public void EmptyOptionText_HasError()
    {
        var model = ValidRequest();
        model.Options[0].Text = "";

        var result = _validator.TestValidate(model);

        result.ShouldHaveAnyValidationError();
    }

    [Fact]
    public void TooLongOptionText_HasError()
    {
        var model = ValidRequest();
        model.Options[0].Text = new string('A', 501);

        var result = _validator.TestValidate(model);

        result.ShouldHaveAnyValidationError();
    }

    [Fact]
    public void FourOptions_NoError()
    {
        var model = ValidRequest();
        model.Options = Enumerable.Range(1, 4)
            .Select(i => new CreateAnswerOptionRequest { Text = $"Opt {i}", Order = i })
            .ToList();

        _validator.TestValidate(model).ShouldNotHaveAnyValidationErrors();
    }
}

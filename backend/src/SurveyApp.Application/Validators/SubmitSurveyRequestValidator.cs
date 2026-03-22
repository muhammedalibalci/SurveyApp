using FluentValidation;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Validators;

public class SubmitSurveyRequestValidator : AbstractValidator<SubmitSurveyRequest>
{
    public SubmitSurveyRequestValidator()
    {
        RuleFor(x => x.SurveyId)
            .GreaterThan(0).WithMessage("Gecersiz anket.");

        RuleFor(x => x.Answers)
            .NotEmpty().WithMessage("En az bir cevap gereklidir.");

        RuleForEach(x => x.Answers).ChildRules(a =>
        {
            a.RuleFor(x => x.QuestionId).GreaterThan(0).WithMessage("Gecersiz soru.");
            a.RuleFor(x => x.SelectedOptionId).GreaterThan(0).WithMessage("Gecersiz secenek.");
        });
    }
}

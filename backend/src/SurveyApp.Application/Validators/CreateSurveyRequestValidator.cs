using FluentValidation;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Validators;

public class CreateSurveyRequestValidator : AbstractValidator<CreateSurveyRequest>
{
    public CreateSurveyRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Anket basligi gereklidir.")
            .MaximumLength(300).WithMessage("Baslik en fazla 300 karakter olabilir.");

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Aciklama en fazla 2000 karakter olabilir.");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Baslangic tarihi gereklidir.");

        RuleFor(x => x.EndDate)
            .NotEmpty().WithMessage("Bitis tarihi gereklidir.")
            .GreaterThan(x => x.StartDate).WithMessage("Bitis tarihi baslangic tarihinden sonra olmalidir.");

        RuleFor(x => x.Questions)
            .NotEmpty().WithMessage("En az bir soru secmelisiniz.");

        RuleForEach(x => x.Questions).ChildRules(q =>
        {
            q.RuleFor(x => x.QuestionId).GreaterThan(0).WithMessage("Gecersiz soru.");
        });
    }
}

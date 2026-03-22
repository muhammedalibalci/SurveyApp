using FluentValidation;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Validators;

public class CreateAnswerTemplateRequestValidator : AbstractValidator<CreateAnswerTemplateRequest>
{
    public CreateAnswerTemplateRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Sablon adi gereklidir.")
            .MaximumLength(200).WithMessage("Sablon adi en fazla 200 karakter olabilir.");

        RuleFor(x => x.Options)
            .NotEmpty().WithMessage("En az bir secenek gereklidir.")
            .Must(o => o.Count >= 2 && o.Count <= 4)
            .WithMessage("Secenek sayisi 2 ile 4 arasinda olmalidir.");

        RuleForEach(x => x.Options).ChildRules(option =>
        {
            option.RuleFor(o => o.Text)
                .NotEmpty().WithMessage("Secenek metni gereklidir.")
                .MaximumLength(500).WithMessage("Secenek metni en fazla 500 karakter olabilir.");
        });
    }
}

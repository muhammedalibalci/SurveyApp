using FluentValidation;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Validators;

public class CreateQuestionRequestValidator : AbstractValidator<CreateQuestionRequest>
{
    public CreateQuestionRequestValidator()
    {
        RuleFor(x => x.Text)
            .NotEmpty().WithMessage("Soru metni gereklidir.")
            .MaximumLength(1000).WithMessage("Soru metni en fazla 1000 karakter olabilir.");

        RuleFor(x => x.AnswerTemplateId)
            .GreaterThan(0).WithMessage("Gecerli bir cevap sablonu secmelisiniz.");
    }
}

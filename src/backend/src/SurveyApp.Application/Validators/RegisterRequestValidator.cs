using FluentValidation;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Validators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email gereklidir.")
            .EmailAddress().WithMessage("Gecerli bir email adresi girin.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Sifre gereklidir.")
            .MinimumLength(6).WithMessage("Sifre en az 6 karakter olmalidir.");

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Ad soyad gereklidir.")
            .MaximumLength(200).WithMessage("Ad soyad en fazla 200 karakter olabilir.");
    }
}

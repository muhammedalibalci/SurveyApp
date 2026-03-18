using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Services.Interfaces;

public interface IAnswerTemplateService
{
    Task<List<AnswerTemplateDto>> GetAllAsync();
    Task<AnswerTemplateDto?> GetByIdAsync(int id);
    Task<AnswerTemplateDto> CreateAsync(CreateAnswerTemplateRequest request);
    Task UpdateAsync(int id, CreateAnswerTemplateRequest request);
    Task DeleteAsync(int id);
}

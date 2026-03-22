using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Services.Interfaces;

public interface IQuestionService
{
    Task<List<QuestionDto>> GetAllAsync();
    Task<QuestionDto?> GetByIdAsync(int id);
    Task<QuestionDto> CreateAsync(CreateQuestionRequest request);
    Task UpdateAsync(int id, CreateQuestionRequest request);
    Task DeleteAsync(int id);
}

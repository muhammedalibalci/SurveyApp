using SurveyApp.Core.Entities;

namespace SurveyApp.Core.Interfaces;

public interface IAnswerTemplateRepository
{
    Task<List<AnswerTemplate>> GetAllAsync();
    Task<AnswerTemplate?> GetByIdAsync(int id);
    Task<AnswerTemplate> CreateAsync(AnswerTemplate template);
    Task UpdateAsync(AnswerTemplate template);
    Task DeleteAsync(int id);
}

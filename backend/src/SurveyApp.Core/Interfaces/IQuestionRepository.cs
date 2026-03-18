using SurveyApp.Core.Entities;

namespace SurveyApp.Core.Interfaces;

public interface IQuestionRepository
{
    Task<List<Question>> GetAllAsync();
    Task<Question?> GetByIdAsync(int id);
    Task<Question> CreateAsync(Question question);
    Task UpdateAsync(Question question);
    Task DeleteAsync(int id);
}

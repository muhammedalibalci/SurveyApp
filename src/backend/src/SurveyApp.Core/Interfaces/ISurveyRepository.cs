using SurveyApp.Core.Entities;

namespace SurveyApp.Core.Interfaces;

public interface ISurveyRepository
{
    Task<List<Survey>> GetAllAsync();
    Task<(List<Survey> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, string? search = null);
    Task<Survey?> GetByIdAsync(int id);
    Task<Survey?> GetByIdWithDetailsAsync(int id);
    Task<Survey> CreateAsync(Survey survey);
    Task UpdateAsync(Survey survey);
    Task DeleteAsync(int id);
    Task<List<Survey>> GetActiveSurveysForUserAsync(int userId);
}

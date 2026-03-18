using SurveyApp.Core.Entities;

namespace SurveyApp.Core.Interfaces;

public interface ISurveyResponseRepository
{
    Task<SurveyResponse> CreateAsync(SurveyResponse response);
    Task<bool> HasUserRespondedAsync(int surveyId, int userId);
    Task<List<SurveyResponse>> GetBySurveyIdAsync(int surveyId);
    Task<SurveyResponse?> GetByIdWithDetailsAsync(int id);
}

using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Services.Interfaces;

public interface ISurveyService
{
    Task<List<SurveyListDto>> GetAllAsync();
    Task<SurveyDto?> GetByIdAsync(int id);
    Task<SurveyDto> CreateAsync(CreateSurveyRequest request);
    Task UpdateAsync(int id, CreateSurveyRequest request);
    Task DeleteAsync(int id);
    Task<List<UserSurveyDto>> GetUserSurveysAsync(int userId);
    Task<SurveyDto?> GetSurveyForAnsweringAsync(int surveyId, int userId);
}

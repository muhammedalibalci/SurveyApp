using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Services.Interfaces;

public interface ISurveyResponseService
{
    Task SubmitAsync(int userId, SubmitSurveyRequest request);
    Task<SurveyReportDto?> GetReportAsync(int surveyId);
}

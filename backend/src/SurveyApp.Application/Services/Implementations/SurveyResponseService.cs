using SurveyApp.Application.DTOs;
using SurveyApp.Application.Services.Interfaces;
using SurveyApp.Core.Entities;
using SurveyApp.Core.Interfaces;

namespace SurveyApp.Application.Services.Implementations;

public class SurveyResponseService : ISurveyResponseService
{
    private readonly ISurveyResponseRepository _responseRepository;
    private readonly ISurveyRepository _surveyRepository;

    public SurveyResponseService(
        ISurveyResponseRepository responseRepository,
        ISurveyRepository surveyRepository)
    {
        _responseRepository = responseRepository;
        _surveyRepository = surveyRepository;
    }

    public async Task SubmitAsync(int userId, SubmitSurveyRequest request)
    {
        var hasResponded = await _responseRepository.HasUserRespondedAsync(request.SurveyId, userId);
        if (hasResponded)
            throw new InvalidOperationException("You have already completed this survey.");

        var survey = await _surveyRepository.GetByIdAsync(request.SurveyId);
        if (survey == null)
            throw new ArgumentException("Survey not found.");

        var now = DateTime.UtcNow;
        if (!survey.IsActive || survey.StartDate > now || survey.EndDate < now)
            throw new InvalidOperationException("This survey is not currently active.");

        if (!survey.SurveyAssignments.Any(sa => sa.UserId == userId))
            throw new UnauthorizedAccessException("You are not assigned to this survey.");

        var response = new SurveyResponse
        {
            SurveyId = request.SurveyId,
            UserId = userId,
            Answers = request.Answers.Select(a => new SurveyAnswer
            {
                QuestionId = a.QuestionId,
                SelectedOptionId = a.SelectedOptionId
            }).ToList()
        };

        await _responseRepository.CreateAsync(response);
    }

    public async Task<SurveyReportDto?> GetReportAsync(int surveyId)
    {
        var survey = await _surveyRepository.GetByIdWithDetailsAsync(surveyId);
        if (survey == null) return null;

        var respondedUserIds = survey.SurveyResponses.Select(r => r.UserId).ToHashSet();

        return new SurveyReportDto
        {
            SurveyId = survey.Id,
            SurveyTitle = survey.Title,
            TotalAssigned = survey.SurveyAssignments.Count,
            TotalCompleted = survey.SurveyResponses.Count,
            CompletedResponses = survey.SurveyResponses.Select(r => new UserResponseDto
            {
                ResponseId = r.Id,
                User = new UserDto
                {
                    Id = r.User.Id,
                    Email = r.User.Email,
                    FullName = r.User.FullName,
                    Role = r.User.Role.ToString()
                },
                SubmittedAt = r.SubmittedAt,
                Answers = r.Answers.Select(a => new UserAnswerDto
                {
                    QuestionId = a.QuestionId,
                    QuestionText = a.Question?.Text ?? "",
                    SelectedOptionText = a.SelectedOption?.Text ?? "",
                    SelectedOptionId = a.SelectedOptionId
                }).ToList()
            }).ToList(),
            PendingUsers = survey.SurveyAssignments
                .Where(sa => !respondedUserIds.Contains(sa.UserId))
                .Select(sa => new UserDto
                {
                    Id = sa.User.Id,
                    Email = sa.User.Email,
                    FullName = sa.User.FullName,
                    Role = sa.User.Role.ToString()
                }).ToList()
        };
    }
}

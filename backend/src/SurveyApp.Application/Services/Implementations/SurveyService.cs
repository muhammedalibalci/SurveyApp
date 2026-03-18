using SurveyApp.Application.DTOs;
using SurveyApp.Application.Services.Interfaces;
using SurveyApp.Core.Entities;
using SurveyApp.Core.Interfaces;

namespace SurveyApp.Application.Services.Implementations;

public class SurveyService : ISurveyService
{
    private readonly ISurveyRepository _repository;

    public SurveyService(ISurveyRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<SurveyListDto>> GetAllAsync()
    {
        var surveys = await _repository.GetAllAsync();
        return surveys.Select(s => new SurveyListDto
        {
            Id = s.Id,
            Title = s.Title,
            Description = s.Description,
            StartDate = s.StartDate,
            EndDate = s.EndDate,
            IsActive = s.IsActive,
            QuestionCount = s.SurveyQuestions.Count,
            AssignedUserCount = s.SurveyAssignments.Count,
            CreatedAt = s.CreatedAt
        }).ToList();
    }

    public async Task<SurveyDto?> GetByIdAsync(int id)
    {
        var survey = await _repository.GetByIdAsync(id);
        return survey == null ? null : MapToDto(survey);
    }

    public async Task<SurveyDto> CreateAsync(CreateSurveyRequest request)
    {
        var survey = new Survey
        {
            Title = request.Title,
            Description = request.Description,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            IsActive = request.IsActive,
            SurveyQuestions = request.Questions.Select(q => new SurveyQuestion
            {
                QuestionId = q.QuestionId,
                Order = q.Order
            }).ToList(),
            SurveyAssignments = request.AssignedUserIds.Select(uid => new SurveyAssignment
            {
                UserId = uid
            }).ToList()
        };

        var created = await _repository.CreateAsync(survey);
        var full = await _repository.GetByIdAsync(created.Id);
        return MapToDto(full!);
    }

    public async Task UpdateAsync(int id, CreateSurveyRequest request)
    {
        var survey = new Survey
        {
            Id = id,
            Title = request.Title,
            Description = request.Description,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            IsActive = request.IsActive,
            SurveyQuestions = request.Questions.Select(q => new SurveyQuestion
            {
                SurveyId = id,
                QuestionId = q.QuestionId,
                Order = q.Order
            }).ToList(),
            SurveyAssignments = request.AssignedUserIds.Select(uid => new SurveyAssignment
            {
                SurveyId = id,
                UserId = uid
            }).ToList()
        };

        await _repository.UpdateAsync(survey);
    }

    public async Task DeleteAsync(int id)
    {
        await _repository.DeleteAsync(id);
    }

    public async Task<List<UserSurveyDto>> GetUserSurveysAsync(int userId)
    {
        var surveys = await _repository.GetActiveSurveysForUserAsync(userId);
        return surveys.Select(s => new UserSurveyDto
        {
            Id = s.Id,
            Title = s.Title,
            Description = s.Description,
            StartDate = s.StartDate,
            EndDate = s.EndDate,
            QuestionCount = s.SurveyQuestions.Count,
            IsCompleted = s.SurveyResponses.Any(r => r.UserId == userId)
        }).ToList();
    }

    public async Task<SurveyDto?> GetSurveyForAnsweringAsync(int surveyId, int userId)
    {
        var survey = await _repository.GetByIdAsync(surveyId);
        if (survey == null) return null;

        var now = DateTime.UtcNow;
        if (!survey.IsActive || survey.StartDate > now || survey.EndDate < now)
            return null;

        if (!survey.SurveyAssignments.Any(sa => sa.UserId == userId))
            return null;

        return MapToDto(survey);
    }

    private static SurveyDto MapToDto(Survey s) => new()
    {
        Id = s.Id,
        Title = s.Title,
        Description = s.Description,
        StartDate = s.StartDate,
        EndDate = s.EndDate,
        IsActive = s.IsActive,
        CreatedAt = s.CreatedAt,
        Questions = s.SurveyQuestions.OrderBy(sq => sq.Order).Select(sq => new SurveyQuestionDto
        {
            QuestionId = sq.QuestionId,
            Text = sq.Question?.Text ?? "",
            Order = sq.Order,
            AnswerTemplateId = sq.Question?.AnswerTemplateId ?? 0,
            AnswerTemplateName = sq.Question?.AnswerTemplate?.Name ?? "",
            Options = sq.Question?.AnswerTemplate?.Options.Select(o => new AnswerOptionDto
            {
                Id = o.Id,
                Text = o.Text,
                Order = o.Order
            }).ToList() ?? new()
        }).ToList(),
        AssignedUsers = s.SurveyAssignments.Select(sa => new UserDto
        {
            Id = sa.User?.Id ?? sa.UserId,
            Email = sa.User?.Email ?? "",
            FullName = sa.User?.FullName ?? "",
            Role = sa.User?.Role.ToString() ?? ""
        }).ToList()
    };
}

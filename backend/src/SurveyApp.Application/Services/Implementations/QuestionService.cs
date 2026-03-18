using SurveyApp.Application.DTOs;
using SurveyApp.Application.Services.Interfaces;
using SurveyApp.Core.Entities;
using SurveyApp.Core.Interfaces;

namespace SurveyApp.Application.Services.Implementations;

public class QuestionService : IQuestionService
{
    private readonly IQuestionRepository _repository;

    public QuestionService(IQuestionRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<QuestionDto>> GetAllAsync()
    {
        var questions = await _repository.GetAllAsync();
        return questions.Select(MapToDto).ToList();
    }

    public async Task<QuestionDto?> GetByIdAsync(int id)
    {
        var question = await _repository.GetByIdAsync(id);
        return question == null ? null : MapToDto(question);
    }

    public async Task<QuestionDto> CreateAsync(CreateQuestionRequest request)
    {
        var question = new Question
        {
            Text = request.Text,
            AnswerTemplateId = request.AnswerTemplateId
        };

        var created = await _repository.CreateAsync(question);
        var full = await _repository.GetByIdAsync(created.Id);
        return MapToDto(full!);
    }

    public async Task UpdateAsync(int id, CreateQuestionRequest request)
    {
        var question = new Question
        {
            Id = id,
            Text = request.Text,
            AnswerTemplateId = request.AnswerTemplateId
        };
        await _repository.UpdateAsync(question);
    }

    public async Task DeleteAsync(int id)
    {
        await _repository.DeleteAsync(id);
    }

    private static QuestionDto MapToDto(Question q) => new()
    {
        Id = q.Id,
        Text = q.Text,
        AnswerTemplateId = q.AnswerTemplateId,
        AnswerTemplateName = q.AnswerTemplate?.Name ?? "",
        Options = q.AnswerTemplate?.Options.Select(o => new AnswerOptionDto
        {
            Id = o.Id,
            Text = o.Text,
            Order = o.Order
        }).ToList() ?? new(),
        CreatedAt = q.CreatedAt
    };
}

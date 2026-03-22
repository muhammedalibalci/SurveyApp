using SurveyApp.Application.DTOs;
using SurveyApp.Application.Services.Interfaces;
using SurveyApp.Core.Entities;
using SurveyApp.Core.Interfaces;

namespace SurveyApp.Application.Services.Implementations;

public class AnswerTemplateService : IAnswerTemplateService
{
    private readonly IAnswerTemplateRepository _repository;

    public AnswerTemplateService(IAnswerTemplateRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<AnswerTemplateDto>> GetAllAsync()
    {
        var templates = await _repository.GetAllAsync();
        return templates.Select(MapToDto).ToList();
    }

    public async Task<AnswerTemplateDto?> GetByIdAsync(int id)
    {
        var template = await _repository.GetByIdAsync(id);
        return template == null ? null : MapToDto(template);
    }

    public async Task<AnswerTemplateDto> CreateAsync(CreateAnswerTemplateRequest request)
    {
        if (request.Options.Count < 2 || request.Options.Count > 4)
            throw new ArgumentException("Options count must be between 2 and 4.");

        var template = new AnswerTemplate
        {
            Name = request.Name,
            Options = request.Options.Select(o => new AnswerOption
            {
                Text = o.Text,
                Order = o.Order
            }).ToList()
        };

        var created = await _repository.CreateAsync(template);
        return MapToDto(created);
    }

    public async Task UpdateAsync(int id, CreateAnswerTemplateRequest request)
    {
        if (request.Options.Count < 2 || request.Options.Count > 4)
            throw new ArgumentException("Options count must be between 2 and 4.");

        var template = new AnswerTemplate
        {
            Id = id,
            Name = request.Name,
            Options = request.Options.Select(o => new AnswerOption
            {
                Text = o.Text,
                Order = o.Order
            }).ToList()
        };

        await _repository.UpdateAsync(template);
    }

    public async Task DeleteAsync(int id)
    {
        await _repository.DeleteAsync(id);
    }

    private static AnswerTemplateDto MapToDto(AnswerTemplate t) => new()
    {
        Id = t.Id,
        Name = t.Name,
        CreatedAt = t.CreatedAt,
        Options = t.Options.Select(o => new AnswerOptionDto
        {
            Id = o.Id,
            Text = o.Text,
            Order = o.Order
        }).ToList()
    };
}

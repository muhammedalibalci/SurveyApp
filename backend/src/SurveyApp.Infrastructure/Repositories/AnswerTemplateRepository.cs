using Microsoft.EntityFrameworkCore;
using SurveyApp.Core.Entities;
using SurveyApp.Core.Interfaces;
using SurveyApp.Infrastructure.Data;

namespace SurveyApp.Infrastructure.Repositories;

public class AnswerTemplateRepository : IAnswerTemplateRepository
{
    private readonly AppDbContext _context;

    public AnswerTemplateRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<AnswerTemplate>> GetAllAsync()
        => await _context.AnswerTemplates
            .Include(t => t.Options.OrderBy(o => o.Order))
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

    public async Task<AnswerTemplate?> GetByIdAsync(int id)
        => await _context.AnswerTemplates
            .Include(t => t.Options.OrderBy(o => o.Order))
            .FirstOrDefaultAsync(t => t.Id == id);

    public async Task<AnswerTemplate> CreateAsync(AnswerTemplate template)
    {
        _context.AnswerTemplates.Add(template);
        await _context.SaveChangesAsync();
        return template;
    }

    public async Task UpdateAsync(AnswerTemplate template)
    {
        var existing = await _context.AnswerTemplates
            .Include(t => t.Options)
            .FirstOrDefaultAsync(t => t.Id == template.Id);

        if (existing == null) return;

        existing.Name = template.Name;
        _context.AnswerOptions.RemoveRange(existing.Options);
        existing.Options = template.Options;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var template = await _context.AnswerTemplates.FindAsync(id);
        if (template != null)
        {
            _context.AnswerTemplates.Remove(template);
            await _context.SaveChangesAsync();
        }
    }
}

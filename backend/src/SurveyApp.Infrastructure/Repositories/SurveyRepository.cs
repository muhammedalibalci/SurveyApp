using Microsoft.EntityFrameworkCore;
using SurveyApp.Core.Entities;
using SurveyApp.Core.Interfaces;
using SurveyApp.Infrastructure.Data;

namespace SurveyApp.Infrastructure.Repositories;

public class SurveyRepository : ISurveyRepository
{
    private readonly AppDbContext _context;

    public SurveyRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Survey>> GetAllAsync()
        => await _context.Surveys
            .Include(s => s.SurveyQuestions).ThenInclude(sq => sq.Question)
            .Include(s => s.SurveyAssignments).ThenInclude(sa => sa.User)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

    public async Task<Survey?> GetByIdAsync(int id)
        => await _context.Surveys
            .Include(s => s.SurveyQuestions.OrderBy(sq => sq.Order))
                .ThenInclude(sq => sq.Question)
                    .ThenInclude(q => q.AnswerTemplate)
                        .ThenInclude(t => t.Options.OrderBy(o => o.Order))
            .Include(s => s.SurveyAssignments).ThenInclude(sa => sa.User)
            .FirstOrDefaultAsync(s => s.Id == id);

    public async Task<Survey?> GetByIdWithDetailsAsync(int id)
        => await _context.Surveys
            .Include(s => s.SurveyQuestions.OrderBy(sq => sq.Order))
                .ThenInclude(sq => sq.Question)
                    .ThenInclude(q => q.AnswerTemplate)
                        .ThenInclude(t => t.Options.OrderBy(o => o.Order))
            .Include(s => s.SurveyAssignments).ThenInclude(sa => sa.User)
            .Include(s => s.SurveyResponses).ThenInclude(r => r.User)
            .Include(s => s.SurveyResponses).ThenInclude(r => r.Answers)
                .ThenInclude(a => a.SelectedOption)
            .Include(s => s.SurveyResponses).ThenInclude(r => r.Answers)
                .ThenInclude(a => a.Question)
            .FirstOrDefaultAsync(s => s.Id == id);

    public async Task<Survey> CreateAsync(Survey survey)
    {
        _context.Surveys.Add(survey);
        await _context.SaveChangesAsync();
        return survey;
    }

    public async Task UpdateAsync(Survey survey)
    {
        var existing = await _context.Surveys
            .Include(s => s.SurveyQuestions)
            .Include(s => s.SurveyAssignments)
            .FirstOrDefaultAsync(s => s.Id == survey.Id);

        if (existing == null) return;

        existing.Title = survey.Title;
        existing.Description = survey.Description;
        existing.StartDate = survey.StartDate;
        existing.EndDate = survey.EndDate;
        existing.IsActive = survey.IsActive;

        _context.SurveyQuestions.RemoveRange(existing.SurveyQuestions);
        _context.SurveyAssignments.RemoveRange(existing.SurveyAssignments);

        existing.SurveyQuestions = survey.SurveyQuestions;
        existing.SurveyAssignments = survey.SurveyAssignments;

        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var survey = await _context.Surveys.FindAsync(id);
        if (survey != null)
        {
            _context.Surveys.Remove(survey);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<List<Survey>> GetActiveSurveysForUserAsync(int userId)
    {
        var now = DateTime.UtcNow;
        return await _context.Surveys
            .Include(s => s.SurveyQuestions.OrderBy(sq => sq.Order))
                .ThenInclude(sq => sq.Question)
                    .ThenInclude(q => q.AnswerTemplate)
                        .ThenInclude(t => t.Options.OrderBy(o => o.Order))
            .Include(s => s.SurveyResponses)
            .Where(s => s.IsActive
                && s.StartDate <= now
                && s.EndDate >= now
                && s.SurveyAssignments.Any(sa => sa.UserId == userId))
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
    }
}

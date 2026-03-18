using Microsoft.EntityFrameworkCore;
using SurveyApp.Core.Entities;
using SurveyApp.Core.Interfaces;
using SurveyApp.Infrastructure.Data;

namespace SurveyApp.Infrastructure.Repositories;

public class SurveyResponseRepository : ISurveyResponseRepository
{
    private readonly AppDbContext _context;

    public SurveyResponseRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<SurveyResponse> CreateAsync(SurveyResponse response)
    {
        _context.SurveyResponses.Add(response);
        await _context.SaveChangesAsync();
        return response;
    }

    public async Task<bool> HasUserRespondedAsync(int surveyId, int userId)
        => await _context.SurveyResponses
            .AnyAsync(r => r.SurveyId == surveyId && r.UserId == userId);

    public async Task<List<SurveyResponse>> GetBySurveyIdAsync(int surveyId)
        => await _context.SurveyResponses
            .Include(r => r.User)
            .Include(r => r.Answers).ThenInclude(a => a.Question)
            .Include(r => r.Answers).ThenInclude(a => a.SelectedOption)
            .Where(r => r.SurveyId == surveyId)
            .OrderByDescending(r => r.SubmittedAt)
            .ToListAsync();

    public async Task<SurveyResponse?> GetByIdWithDetailsAsync(int id)
        => await _context.SurveyResponses
            .Include(r => r.User)
            .Include(r => r.Survey)
            .Include(r => r.Answers).ThenInclude(a => a.Question)
            .Include(r => r.Answers).ThenInclude(a => a.SelectedOption)
            .FirstOrDefaultAsync(r => r.Id == id);
}

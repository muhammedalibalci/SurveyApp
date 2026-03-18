using Microsoft.EntityFrameworkCore;
using SurveyApp.Core.Entities;
using SurveyApp.Core.Interfaces;
using SurveyApp.Infrastructure.Data;

namespace SurveyApp.Infrastructure.Repositories;

public class QuestionRepository : IQuestionRepository
{
    private readonly AppDbContext _context;

    public QuestionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Question>> GetAllAsync()
        => await _context.Questions
            .Include(q => q.AnswerTemplate)
                .ThenInclude(t => t.Options.OrderBy(o => o.Order))
            .OrderByDescending(q => q.CreatedAt)
            .ToListAsync();

    public async Task<Question?> GetByIdAsync(int id)
        => await _context.Questions
            .Include(q => q.AnswerTemplate)
                .ThenInclude(t => t.Options.OrderBy(o => o.Order))
            .FirstOrDefaultAsync(q => q.Id == id);

    public async Task<Question> CreateAsync(Question question)
    {
        _context.Questions.Add(question);
        await _context.SaveChangesAsync();
        return question;
    }

    public async Task UpdateAsync(Question question)
    {
        var existing = await _context.Questions.FindAsync(question.Id);
        if (existing == null) return;

        existing.Text = question.Text;
        existing.AnswerTemplateId = question.AnswerTemplateId;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var question = await _context.Questions.FindAsync(id);
        if (question != null)
        {
            _context.Questions.Remove(question);
            await _context.SaveChangesAsync();
        }
    }
}

using Microsoft.EntityFrameworkCore;
using SurveyApp.Core.Entities;

namespace SurveyApp.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<AnswerTemplate> AnswerTemplates => Set<AnswerTemplate>();
    public DbSet<AnswerOption> AnswerOptions => Set<AnswerOption>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<Survey> Surveys => Set<Survey>();
    public DbSet<SurveyQuestion> SurveyQuestions => Set<SurveyQuestion>();
    public DbSet<SurveyAssignment> SurveyAssignments => Set<SurveyAssignment>();
    public DbSet<SurveyResponse> SurveyResponses => Set<SurveyResponse>();
    public DbSet<SurveyAnswer> SurveyAnswers => Set<SurveyAnswer>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).IsRequired().HasMaxLength(256);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Role).HasConversion<string>().HasMaxLength(20);
        });

        // AnswerTemplate
        modelBuilder.Entity<AnswerTemplate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.HasMany(e => e.Options)
                  .WithOne(o => o.AnswerTemplate)
                  .HasForeignKey(o => o.AnswerTemplateId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // AnswerOption
        modelBuilder.Entity<AnswerOption>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Text).IsRequired().HasMaxLength(500);
        });

        // Question
        modelBuilder.Entity<Question>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Text).IsRequired().HasMaxLength(1000);
            entity.HasOne(e => e.AnswerTemplate)
                  .WithMany(t => t.Questions)
                  .HasForeignKey(e => e.AnswerTemplateId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Survey
        modelBuilder.Entity<Survey>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(300);
            entity.Property(e => e.Description).HasMaxLength(2000);
        });

        // SurveyQuestion (composite key)
        modelBuilder.Entity<SurveyQuestion>(entity =>
        {
            entity.HasKey(e => new { e.SurveyId, e.QuestionId });
            entity.HasOne(e => e.Survey)
                  .WithMany(s => s.SurveyQuestions)
                  .HasForeignKey(e => e.SurveyId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Question)
                  .WithMany(q => q.SurveyQuestions)
                  .HasForeignKey(e => e.QuestionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // SurveyAssignment (composite key)
        modelBuilder.Entity<SurveyAssignment>(entity =>
        {
            entity.HasKey(e => new { e.SurveyId, e.UserId });
            entity.HasOne(e => e.Survey)
                  .WithMany(s => s.SurveyAssignments)
                  .HasForeignKey(e => e.SurveyId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.User)
                  .WithMany(u => u.SurveyAssignments)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // SurveyResponse
        modelBuilder.Entity<SurveyResponse>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.SurveyId, e.UserId }).IsUnique();
            entity.HasOne(e => e.Survey)
                  .WithMany(s => s.SurveyResponses)
                  .HasForeignKey(e => e.SurveyId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.User)
                  .WithMany(u => u.SurveyResponses)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // SurveyAnswer
        modelBuilder.Entity<SurveyAnswer>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.SurveyResponse)
                  .WithMany(r => r.Answers)
                  .HasForeignKey(e => e.SurveyResponseId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Question)
                  .WithMany()
                  .HasForeignKey(e => e.QuestionId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.SelectedOption)
                  .WithMany()
                  .HasForeignKey(e => e.SelectedOptionId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}

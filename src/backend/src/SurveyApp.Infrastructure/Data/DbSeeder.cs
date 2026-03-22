using Microsoft.EntityFrameworkCore;
using SurveyApp.Core.Entities;
using SurveyApp.Core.Enums;

namespace SurveyApp.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Users.AnyAsync()) return;

        // Create admin user
        var admin = new User
        {
            Email = "admin@survey.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            FullName = "System Admin",
            Role = UserRole.Admin
        };

        // Create sample user
        var user = new User
        {
            Email = "user@survey.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("User123!"),
            FullName = "Test User",
            Role = UserRole.User
        };

        context.Users.AddRange(admin, user);
        await context.SaveChangesAsync();

        // Create sample answer templates
        var yesNoTemplate = new AnswerTemplate
        {
            Name = "Yes/No",
            Options = new List<AnswerOption>
            {
                new() { Text = "Yes", Order = 1 },
                new() { Text = "No", Order = 2 }
            }
        };

        var satisfactionTemplate = new AnswerTemplate
        {
            Name = "Satisfaction Level",
            Options = new List<AnswerOption>
            {
                new() { Text = "Very Satisfied", Order = 1 },
                new() { Text = "Satisfied", Order = 2 },
                new() { Text = "Neutral", Order = 3 },
                new() { Text = "Dissatisfied", Order = 4 }
            }
        };

        var agreementTemplate = new AnswerTemplate
        {
            Name = "Agreement Scale",
            Options = new List<AnswerOption>
            {
                new() { Text = "Strongly Agree", Order = 1 },
                new() { Text = "Agree", Order = 2 },
                new() { Text = "Disagree", Order = 3 }
            }
        };

        context.AnswerTemplates.AddRange(yesNoTemplate, satisfactionTemplate, agreementTemplate);
        await context.SaveChangesAsync();
    }
}

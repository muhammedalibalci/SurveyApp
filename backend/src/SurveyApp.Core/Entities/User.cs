using SurveyApp.Core.Enums;

namespace SurveyApp.Core.Entities;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.User;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<SurveyAssignment> SurveyAssignments { get; set; } = new List<SurveyAssignment>();
    public ICollection<SurveyResponse> SurveyResponses { get; set; } = new List<SurveyResponse>();
}

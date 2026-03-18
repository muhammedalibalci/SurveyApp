namespace SurveyApp.Core.Entities;

public class SurveyAssignment
{
    public int SurveyId { get; set; }
    public int UserId { get; set; }

    public Survey Survey { get; set; } = null!;
    public User User { get; set; } = null!;
}

namespace SurveyApp.Core.Entities;

public class SurveyResponse
{
    public int Id { get; set; }
    public int SurveyId { get; set; }
    public int UserId { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    public Survey Survey { get; set; } = null!;
    public User User { get; set; } = null!;
    public ICollection<SurveyAnswer> Answers { get; set; } = new List<SurveyAnswer>();
}

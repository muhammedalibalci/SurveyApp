namespace SurveyApp.Core.Entities;

public class SurveyQuestion
{
    public int SurveyId { get; set; }
    public int QuestionId { get; set; }
    public int Order { get; set; }

    public Survey Survey { get; set; } = null!;
    public Question Question { get; set; } = null!;
}

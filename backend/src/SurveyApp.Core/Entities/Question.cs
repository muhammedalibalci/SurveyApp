namespace SurveyApp.Core.Entities;

public class Question
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public int AnswerTemplateId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public AnswerTemplate AnswerTemplate { get; set; } = null!;
    public ICollection<SurveyQuestion> SurveyQuestions { get; set; } = new List<SurveyQuestion>();
}

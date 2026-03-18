namespace SurveyApp.Core.Entities;

public class AnswerOption
{
    public int Id { get; set; }
    public int AnswerTemplateId { get; set; }
    public string Text { get; set; } = string.Empty;
    public int Order { get; set; }

    public AnswerTemplate AnswerTemplate { get; set; } = null!;
}

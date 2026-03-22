namespace SurveyApp.Application.DTOs;

public class QuestionDto
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public int AnswerTemplateId { get; set; }
    public string AnswerTemplateName { get; set; } = string.Empty;
    public List<AnswerOptionDto> Options { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class CreateQuestionRequest
{
    public string Text { get; set; } = string.Empty;
    public int AnswerTemplateId { get; set; }
}

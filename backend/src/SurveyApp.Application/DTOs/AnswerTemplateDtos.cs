namespace SurveyApp.Application.DTOs;

public class AnswerTemplateDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<AnswerOptionDto> Options { get; set; } = new();
}

public class AnswerOptionDto
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public int Order { get; set; }
}

public class CreateAnswerTemplateRequest
{
    public string Name { get; set; } = string.Empty;
    public List<CreateAnswerOptionRequest> Options { get; set; } = new();
}

public class CreateAnswerOptionRequest
{
    public string Text { get; set; } = string.Empty;
    public int Order { get; set; }
}

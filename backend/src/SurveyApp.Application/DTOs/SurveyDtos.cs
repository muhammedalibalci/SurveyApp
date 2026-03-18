namespace SurveyApp.Application.DTOs;

public class SurveyDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<SurveyQuestionDto> Questions { get; set; } = new();
    public List<UserDto> AssignedUsers { get; set; } = new();
}

public class SurveyQuestionDto
{
    public int QuestionId { get; set; }
    public string Text { get; set; } = string.Empty;
    public int Order { get; set; }
    public int AnswerTemplateId { get; set; }
    public string AnswerTemplateName { get; set; } = string.Empty;
    public List<AnswerOptionDto> Options { get; set; } = new();
}

public class CreateSurveyRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;
    public List<SurveyQuestionInput> Questions { get; set; } = new();
    public List<int> AssignedUserIds { get; set; } = new();
}

public class SurveyQuestionInput
{
    public int QuestionId { get; set; }
    public int Order { get; set; }
}

public class SurveyListDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
    public int QuestionCount { get; set; }
    public int AssignedUserCount { get; set; }
    public int ResponseCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UserSurveyDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int QuestionCount { get; set; }
    public bool IsCompleted { get; set; }
}

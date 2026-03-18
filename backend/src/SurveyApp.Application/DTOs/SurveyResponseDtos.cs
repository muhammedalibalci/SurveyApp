namespace SurveyApp.Application.DTOs;

public class SubmitSurveyRequest
{
    public int SurveyId { get; set; }
    public List<AnswerInput> Answers { get; set; } = new();
}

public class AnswerInput
{
    public int QuestionId { get; set; }
    public int SelectedOptionId { get; set; }
}

public class SurveyReportDto
{
    public int SurveyId { get; set; }
    public string SurveyTitle { get; set; } = string.Empty;
    public int TotalAssigned { get; set; }
    public int TotalCompleted { get; set; }
    public List<UserResponseDto> CompletedResponses { get; set; } = new();
    public List<UserDto> PendingUsers { get; set; } = new();
}

public class UserResponseDto
{
    public int ResponseId { get; set; }
    public UserDto User { get; set; } = null!;
    public DateTime SubmittedAt { get; set; }
    public List<UserAnswerDto> Answers { get; set; } = new();
}

public class UserAnswerDto
{
    public int QuestionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string SelectedOptionText { get; set; } = string.Empty;
    public int SelectedOptionId { get; set; }
}

using FluentAssertions;
using Moq;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Services.Implementations;
using SurveyApp.Core.Entities;
using SurveyApp.Core.Enums;
using SurveyApp.Core.Interfaces;

namespace SurveyApp.Tests.Services;

public class SurveyResponseServiceTests
{
    private readonly Mock<ISurveyResponseRepository> _responseRepoMock;
    private readonly Mock<ISurveyRepository> _surveyRepoMock;
    private readonly SurveyResponseService _sut;

    public SurveyResponseServiceTests()
    {
        _responseRepoMock = new Mock<ISurveyResponseRepository>();
        _surveyRepoMock = new Mock<ISurveyRepository>();
        _sut = new SurveyResponseService(_responseRepoMock.Object, _surveyRepoMock.Object);
    }

    #region SubmitAsync

    [Fact]
    public async Task SubmitAsync_ValidSubmission_CreatesResponse()
    {
        var userId = 1;
        var request = new SubmitSurveyRequest
        {
            SurveyId = 1,
            Answers = new List<AnswerInput>
            {
                new() { QuestionId = 1, SelectedOptionId = 1 }
            }
        };

        _responseRepoMock.Setup(r => r.HasUserRespondedAsync(1, userId)).ReturnsAsync(false);

        var survey = new Survey
        {
            Id = 1, IsActive = true,
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(7),
            SurveyAssignments = new List<SurveyAssignment> { new() { UserId = userId } },
            SurveyQuestions = new List<SurveyQuestion>()
        };

        _surveyRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(survey);
        _responseRepoMock.Setup(r => r.CreateAsync(It.IsAny<SurveyResponse>()))
            .ReturnsAsync((SurveyResponse sr) => sr);

        await _sut.SubmitAsync(userId, request);

        _responseRepoMock.Verify(r => r.CreateAsync(It.Is<SurveyResponse>(sr =>
            sr.SurveyId == 1 && sr.UserId == userId && sr.Answers.Count == 1
        )), Times.Once);
    }

    [Fact]
    public async Task SubmitAsync_AlreadyResponded_ThrowsInvalidOperationException()
    {
        _responseRepoMock.Setup(r => r.HasUserRespondedAsync(1, 1)).ReturnsAsync(true);

        var act = () => _sut.SubmitAsync(1, new SubmitSurveyRequest { SurveyId = 1 });

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("You have already completed this survey.");
    }

    [Fact]
    public async Task SubmitAsync_SurveyNotFound_ThrowsArgumentException()
    {
        _responseRepoMock.Setup(r => r.HasUserRespondedAsync(1, 1)).ReturnsAsync(false);
        _surveyRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync((Survey?)null);

        var act = () => _sut.SubmitAsync(1, new SubmitSurveyRequest { SurveyId = 1 });

        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("Survey not found.");
    }

    [Fact]
    public async Task SubmitAsync_InactiveSurvey_ThrowsInvalidOperationException()
    {
        _responseRepoMock.Setup(r => r.HasUserRespondedAsync(1, 1)).ReturnsAsync(false);
        _surveyRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(new Survey
        {
            Id = 1, IsActive = false,
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(7),
            SurveyAssignments = new List<SurveyAssignment> { new() { UserId = 1 } }
        });

        var act = () => _sut.SubmitAsync(1, new SubmitSurveyRequest { SurveyId = 1 });

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("This survey is not currently active.");
    }

    [Fact]
    public async Task SubmitAsync_ExpiredSurvey_ThrowsInvalidOperationException()
    {
        _responseRepoMock.Setup(r => r.HasUserRespondedAsync(1, 1)).ReturnsAsync(false);
        _surveyRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(new Survey
        {
            Id = 1, IsActive = true,
            StartDate = DateTime.UtcNow.AddDays(-30),
            EndDate = DateTime.UtcNow.AddDays(-1),
            SurveyAssignments = new List<SurveyAssignment> { new() { UserId = 1 } }
        });

        var act = () => _sut.SubmitAsync(1, new SubmitSurveyRequest { SurveyId = 1 });

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("This survey is not currently active.");
    }

    [Fact]
    public async Task SubmitAsync_NotAssigned_ThrowsUnauthorizedAccessException()
    {
        _responseRepoMock.Setup(r => r.HasUserRespondedAsync(1, 1)).ReturnsAsync(false);
        _surveyRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(new Survey
        {
            Id = 1, IsActive = true,
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(7),
            SurveyAssignments = new List<SurveyAssignment> { new() { UserId = 99 } }
        });

        var act = () => _sut.SubmitAsync(1, new SubmitSurveyRequest { SurveyId = 1 });

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("You are not assigned to this survey.");
    }

    #endregion

    #region GetReportAsync

    [Fact]
    public async Task GetReportAsync_ExistingSurvey_ReturnsReport()
    {
        var survey = new Survey
        {
            Id = 1, Title = "Test Survey",
            SurveyAssignments = new List<SurveyAssignment>
            {
                new() { UserId = 1, User = new User { Id = 1, Email = "a@a.com", FullName = "User A", Role = UserRole.User } },
                new() { UserId = 2, User = new User { Id = 2, Email = "b@b.com", FullName = "User B", Role = UserRole.User } }
            },
            SurveyResponses = new List<SurveyResponse>
            {
                new()
                {
                    Id = 1, UserId = 1, SubmittedAt = DateTime.UtcNow,
                    User = new User { Id = 1, Email = "a@a.com", FullName = "User A", Role = UserRole.User },
                    Answers = new List<SurveyAnswer>
                    {
                        new()
                        {
                            QuestionId = 1,
                            SelectedOptionId = 1,
                            Question = new Question { Id = 1, Text = "Q1" },
                            SelectedOption = new AnswerOption { Id = 1, Text = "Yes" }
                        }
                    }
                }
            }
        };

        _surveyRepoMock.Setup(r => r.GetByIdWithDetailsAsync(1)).ReturnsAsync(survey);

        var result = await _sut.GetReportAsync(1);

        result.Should().NotBeNull();
        result!.SurveyTitle.Should().Be("Test Survey");
        result.TotalAssigned.Should().Be(2);
        result.TotalCompleted.Should().Be(1);
        result.CompletedResponses.Should().HaveCount(1);
        result.PendingUsers.Should().HaveCount(1);
        result.PendingUsers[0].Email.Should().Be("b@b.com");
    }

    [Fact]
    public async Task GetReportAsync_NonExistingSurvey_ReturnsNull()
    {
        _surveyRepoMock.Setup(r => r.GetByIdWithDetailsAsync(999)).ReturnsAsync((Survey?)null);

        var result = await _sut.GetReportAsync(999);

        result.Should().BeNull();
    }

    #endregion
}

using FluentAssertions;
using Moq;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Services.Implementations;
using SurveyApp.Core.Entities;
using SurveyApp.Core.Interfaces;

namespace SurveyApp.Tests.Services;

public class SurveyServiceTests
{
    private readonly Mock<ISurveyRepository> _repositoryMock;
    private readonly SurveyService _sut;

    public SurveyServiceTests()
    {
        _repositoryMock = new Mock<ISurveyRepository>();
        _sut = new SurveyService(_repositoryMock.Object);
    }

    #region GetAllAsync

    [Fact]
    public async Task GetAllAsync_ReturnsMappedSurveyList()
    {
        var surveys = new List<Survey>
        {
            new()
            {
                Id = 1, Title = "Survey 1", Description = "Desc 1",
                StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddDays(7),
                IsActive = true, CreatedAt = DateTime.UtcNow,
                SurveyQuestions = new List<SurveyQuestion> { new() },
                SurveyAssignments = new List<SurveyAssignment> { new(), new() }
            },
            new()
            {
                Id = 2, Title = "Survey 2", Description = "Desc 2",
                StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddDays(14),
                IsActive = false, CreatedAt = DateTime.UtcNow,
                SurveyQuestions = new List<SurveyQuestion>(),
                SurveyAssignments = new List<SurveyAssignment>()
            }
        };

        _repositoryMock.Setup(r => r.GetAllAsync()).ReturnsAsync(surveys);

        var result = await _sut.GetAllAsync();

        result.Should().HaveCount(2);
        result[0].Title.Should().Be("Survey 1");
        result[0].QuestionCount.Should().Be(1);
        result[0].AssignedUserCount.Should().Be(2);
        result[1].Title.Should().Be("Survey 2");
        result[1].IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task GetAllAsync_EmptyList_ReturnsEmpty()
    {
        _repositoryMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Survey>());

        var result = await _sut.GetAllAsync();

        result.Should().BeEmpty();
    }

    #endregion

    #region GetPagedAsync

    [Fact]
    public async Task GetPagedAsync_ReturnsPagedResult()
    {
        var surveys = new List<Survey>
        {
            new()
            {
                Id = 1, Title = "Paged Survey", Description = "Desc",
                SurveyQuestions = new List<SurveyQuestion>(),
                SurveyAssignments = new List<SurveyAssignment>(),
                SurveyResponses = new List<SurveyResponse>()
            }
        };

        _repositoryMock.Setup(r => r.GetPagedAsync(1, 10, null))
            .ReturnsAsync((surveys, 1));

        var result = await _sut.GetPagedAsync(new PaginationParams { Page = 1, PageSize = 10 });

        result.Items.Should().HaveCount(1);
        result.TotalCount.Should().Be(1);
        result.Page.Should().Be(1);
        result.PageSize.Should().Be(10);
    }

    #endregion

    #region GetByIdAsync

    [Fact]
    public async Task GetByIdAsync_ExistingSurvey_ReturnsSurveyDto()
    {
        var survey = CreateSurveyWithDetails(1, "Test Survey");
        _repositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(survey);

        var result = await _sut.GetByIdAsync(1);

        result.Should().NotBeNull();
        result!.Id.Should().Be(1);
        result.Title.Should().Be("Test Survey");
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingSurvey_ReturnsNull()
    {
        _repositoryMock.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Survey?)null);

        var result = await _sut.GetByIdAsync(999);

        result.Should().BeNull();
    }

    #endregion

    #region CreateAsync

    [Fact]
    public async Task CreateAsync_ValidRequest_CreatesSurveyAndReturnsDto()
    {
        var request = new CreateSurveyRequest
        {
            Title = "New Survey",
            Description = "New Desc",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(7),
            IsActive = true,
            Questions = new List<SurveyQuestionInput>
            {
                new() { QuestionId = 1, Order = 1 },
                new() { QuestionId = 2, Order = 2 }
            },
            AssignedUserIds = new List<int> { 1, 2 }
        };

        _repositoryMock.Setup(r => r.CreateAsync(It.IsAny<Survey>()))
            .ReturnsAsync((Survey s) => { s.Id = 10; return s; });

        var fullSurvey = CreateSurveyWithDetails(10, "New Survey");
        _repositoryMock.Setup(r => r.GetByIdAsync(10)).ReturnsAsync(fullSurvey);

        var result = await _sut.CreateAsync(request);

        result.Should().NotBeNull();
        result.Id.Should().Be(10);
        _repositoryMock.Verify(r => r.CreateAsync(It.Is<Survey>(s =>
            s.Title == "New Survey" &&
            s.SurveyQuestions.Count == 2 &&
            s.SurveyAssignments.Count == 2
        )), Times.Once);
    }

    #endregion

    #region UpdateAsync

    [Fact]
    public async Task UpdateAsync_CallsRepositoryUpdate()
    {
        var request = new CreateSurveyRequest
        {
            Title = "Updated",
            Description = "Updated Desc",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(7),
            IsActive = true,
            Questions = new List<SurveyQuestionInput> { new() { QuestionId = 1, Order = 1 } },
            AssignedUserIds = new List<int> { 1 }
        };

        await _sut.UpdateAsync(5, request);

        _repositoryMock.Verify(r => r.UpdateAsync(It.Is<Survey>(s =>
            s.Id == 5 && s.Title == "Updated"
        )), Times.Once);
    }

    #endregion

    #region DeleteAsync

    [Fact]
    public async Task DeleteAsync_CallsRepositoryDelete()
    {
        await _sut.DeleteAsync(3);

        _repositoryMock.Verify(r => r.DeleteAsync(3), Times.Once);
    }

    #endregion

    #region GetUserSurveysAsync

    [Fact]
    public async Task GetUserSurveysAsync_ReturnsMappedUserSurveys()
    {
        var userId = 1;
        var surveys = new List<Survey>
        {
            new()
            {
                Id = 1, Title = "User Survey", Description = "Desc",
                StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddDays(7),
                SurveyQuestions = new List<SurveyQuestion> { new(), new() },
                SurveyResponses = new List<SurveyResponse>
                {
                    new() { UserId = userId }
                }
            }
        };

        _repositoryMock.Setup(r => r.GetActiveSurveysForUserAsync(userId))
            .ReturnsAsync(surveys);

        var result = await _sut.GetUserSurveysAsync(userId);

        result.Should().HaveCount(1);
        result[0].IsCompleted.Should().BeTrue();
        result[0].QuestionCount.Should().Be(2);
    }

    [Fact]
    public async Task GetUserSurveysAsync_NotCompleted_IsCompletedFalse()
    {
        var surveys = new List<Survey>
        {
            new()
            {
                Id = 1, Title = "Incomplete", Description = "Desc",
                StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddDays(7),
                SurveyQuestions = new List<SurveyQuestion>(),
                SurveyResponses = new List<SurveyResponse>()
            }
        };

        _repositoryMock.Setup(r => r.GetActiveSurveysForUserAsync(5))
            .ReturnsAsync(surveys);

        var result = await _sut.GetUserSurveysAsync(5);

        result[0].IsCompleted.Should().BeFalse();
    }

    #endregion

    #region GetSurveyForAnsweringAsync

    [Fact]
    public async Task GetSurveyForAnsweringAsync_ActiveAndAssigned_ReturnsSurvey()
    {
        var survey = new Survey
        {
            Id = 1, Title = "Active Survey",
            IsActive = true,
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(7),
            SurveyQuestions = new List<SurveyQuestion>(),
            SurveyAssignments = new List<SurveyAssignment>
            {
                new() { UserId = 1 }
            },
            SurveyResponses = new List<SurveyResponse>()
        };

        _repositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(survey);

        var result = await _sut.GetSurveyForAnsweringAsync(1, 1);

        result.Should().NotBeNull();
        result!.Title.Should().Be("Active Survey");
    }

    [Fact]
    public async Task GetSurveyForAnsweringAsync_InactiveSurvey_ReturnsNull()
    {
        var survey = new Survey
        {
            Id = 1, IsActive = false,
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(7),
            SurveyQuestions = new List<SurveyQuestion>(),
            SurveyAssignments = new List<SurveyAssignment> { new() { UserId = 1 } },
            SurveyResponses = new List<SurveyResponse>()
        };

        _repositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(survey);

        var result = await _sut.GetSurveyForAnsweringAsync(1, 1);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetSurveyForAnsweringAsync_NotAssigned_ReturnsNull()
    {
        var survey = new Survey
        {
            Id = 1, IsActive = true,
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(7),
            SurveyQuestions = new List<SurveyQuestion>(),
            SurveyAssignments = new List<SurveyAssignment> { new() { UserId = 99 } },
            SurveyResponses = new List<SurveyResponse>()
        };

        _repositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(survey);

        var result = await _sut.GetSurveyForAnsweringAsync(1, 1);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetSurveyForAnsweringAsync_Expired_ReturnsNull()
    {
        var survey = new Survey
        {
            Id = 1, IsActive = true,
            StartDate = DateTime.UtcNow.AddDays(-30),
            EndDate = DateTime.UtcNow.AddDays(-1),
            SurveyQuestions = new List<SurveyQuestion>(),
            SurveyAssignments = new List<SurveyAssignment> { new() { UserId = 1 } },
            SurveyResponses = new List<SurveyResponse>()
        };

        _repositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(survey);

        var result = await _sut.GetSurveyForAnsweringAsync(1, 1);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetSurveyForAnsweringAsync_NotStartedYet_ReturnsNull()
    {
        var survey = new Survey
        {
            Id = 1, IsActive = true,
            StartDate = DateTime.UtcNow.AddDays(5),
            EndDate = DateTime.UtcNow.AddDays(30),
            SurveyQuestions = new List<SurveyQuestion>(),
            SurveyAssignments = new List<SurveyAssignment> { new() { UserId = 1 } },
            SurveyResponses = new List<SurveyResponse>()
        };

        _repositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(survey);

        var result = await _sut.GetSurveyForAnsweringAsync(1, 1);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetSurveyForAnsweringAsync_NonExistingSurvey_ReturnsNull()
    {
        _repositoryMock.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Survey?)null);

        var result = await _sut.GetSurveyForAnsweringAsync(999, 1);

        result.Should().BeNull();
    }

    #endregion

    private static Survey CreateSurveyWithDetails(int id, string title) => new()
    {
        Id = id,
        Title = title,
        Description = "Description",
        StartDate = DateTime.UtcNow,
        EndDate = DateTime.UtcNow.AddDays(7),
        IsActive = true,
        CreatedAt = DateTime.UtcNow,
        SurveyQuestions = new List<SurveyQuestion>(),
        SurveyAssignments = new List<SurveyAssignment>(),
        SurveyResponses = new List<SurveyResponse>()
    };
}

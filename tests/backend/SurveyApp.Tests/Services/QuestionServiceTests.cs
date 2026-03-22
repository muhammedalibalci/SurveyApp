using FluentAssertions;
using Moq;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Services.Implementations;
using SurveyApp.Core.Entities;
using SurveyApp.Core.Interfaces;

namespace SurveyApp.Tests.Services;

public class QuestionServiceTests
{
    private readonly Mock<IQuestionRepository> _repositoryMock;
    private readonly QuestionService _sut;

    public QuestionServiceTests()
    {
        _repositoryMock = new Mock<IQuestionRepository>();
        _sut = new QuestionService(_repositoryMock.Object);
    }

    #region GetAllAsync

    [Fact]
    public async Task GetAllAsync_ReturnsMappedQuestions()
    {
        var questions = new List<Question>
        {
            new()
            {
                Id = 1, Text = "How are you?", AnswerTemplateId = 1,
                CreatedAt = DateTime.UtcNow,
                AnswerTemplate = new AnswerTemplate
                {
                    Id = 1, Name = "Rating",
                    Options = new List<AnswerOption>
                    {
                        new() { Id = 1, Text = "Good", Order = 1 },
                        new() { Id = 2, Text = "Bad", Order = 2 }
                    }
                }
            }
        };

        _repositoryMock.Setup(r => r.GetAllAsync()).ReturnsAsync(questions);

        var result = await _sut.GetAllAsync();

        result.Should().HaveCount(1);
        result[0].Text.Should().Be("How are you?");
        result[0].AnswerTemplateName.Should().Be("Rating");
        result[0].Options.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetAllAsync_EmptyList_ReturnsEmpty()
    {
        _repositoryMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Question>());

        var result = await _sut.GetAllAsync();

        result.Should().BeEmpty();
    }

    #endregion

    #region GetByIdAsync

    [Fact]
    public async Task GetByIdAsync_Existing_ReturnsDto()
    {
        var question = new Question
        {
            Id = 1, Text = "Test?", AnswerTemplateId = 1,
            AnswerTemplate = new AnswerTemplate
            {
                Id = 1, Name = "YesNo",
                Options = new List<AnswerOption>()
            }
        };

        _repositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(question);

        var result = await _sut.GetByIdAsync(1);

        result.Should().NotBeNull();
        result!.Text.Should().Be("Test?");
    }

    [Fact]
    public async Task GetByIdAsync_NotFound_ReturnsNull()
    {
        _repositoryMock.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Question?)null);

        var result = await _sut.GetByIdAsync(999);

        result.Should().BeNull();
    }

    #endregion

    #region CreateAsync

    [Fact]
    public async Task CreateAsync_CreatesAndReturnsFull()
    {
        var request = new CreateQuestionRequest { Text = "New Q?", AnswerTemplateId = 2 };

        _repositoryMock.Setup(r => r.CreateAsync(It.IsAny<Question>()))
            .ReturnsAsync((Question q) => { q.Id = 10; return q; });

        var fullQuestion = new Question
        {
            Id = 10, Text = "New Q?", AnswerTemplateId = 2,
            AnswerTemplate = new AnswerTemplate
            {
                Id = 2, Name = "Scale",
                Options = new List<AnswerOption>
                {
                    new() { Id = 1, Text = "1", Order = 1 },
                    new() { Id = 2, Text = "2", Order = 2 }
                }
            }
        };

        _repositoryMock.Setup(r => r.GetByIdAsync(10)).ReturnsAsync(fullQuestion);

        var result = await _sut.CreateAsync(request);

        result.Id.Should().Be(10);
        result.Text.Should().Be("New Q?");
        result.AnswerTemplateName.Should().Be("Scale");
    }

    #endregion

    #region UpdateAsync

    [Fact]
    public async Task UpdateAsync_CallsRepository()
    {
        var request = new CreateQuestionRequest { Text = "Updated?", AnswerTemplateId = 3 };

        await _sut.UpdateAsync(5, request);

        _repositoryMock.Verify(r => r.UpdateAsync(It.Is<Question>(q =>
            q.Id == 5 && q.Text == "Updated?" && q.AnswerTemplateId == 3
        )), Times.Once);
    }

    #endregion

    #region DeleteAsync

    [Fact]
    public async Task DeleteAsync_CallsRepository()
    {
        await _sut.DeleteAsync(7);

        _repositoryMock.Verify(r => r.DeleteAsync(7), Times.Once);
    }

    #endregion
}

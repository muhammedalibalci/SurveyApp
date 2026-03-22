using FluentAssertions;
using Moq;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Services.Implementations;
using SurveyApp.Core.Entities;
using SurveyApp.Core.Interfaces;

namespace SurveyApp.Tests.Services;

public class AnswerTemplateServiceTests
{
    private readonly Mock<IAnswerTemplateRepository> _repositoryMock;
    private readonly AnswerTemplateService _sut;

    public AnswerTemplateServiceTests()
    {
        _repositoryMock = new Mock<IAnswerTemplateRepository>();
        _sut = new AnswerTemplateService(_repositoryMock.Object);
    }

    #region GetAllAsync

    [Fact]
    public async Task GetAllAsync_ReturnsMappedTemplates()
    {
        var templates = new List<AnswerTemplate>
        {
            new()
            {
                Id = 1, Name = "Yes/No", CreatedAt = DateTime.UtcNow,
                Options = new List<AnswerOption>
                {
                    new() { Id = 1, Text = "Yes", Order = 1 },
                    new() { Id = 2, Text = "No", Order = 2 }
                }
            }
        };

        _repositoryMock.Setup(r => r.GetAllAsync()).ReturnsAsync(templates);

        var result = await _sut.GetAllAsync();

        result.Should().HaveCount(1);
        result[0].Name.Should().Be("Yes/No");
        result[0].Options.Should().HaveCount(2);
    }

    #endregion

    #region GetByIdAsync

    [Fact]
    public async Task GetByIdAsync_Existing_ReturnsDto()
    {
        var template = new AnswerTemplate
        {
            Id = 1, Name = "Rating",
            Options = new List<AnswerOption>
            {
                new() { Id = 1, Text = "Good", Order = 1 },
                new() { Id = 2, Text = "Bad", Order = 2 }
            }
        };

        _repositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(template);

        var result = await _sut.GetByIdAsync(1);

        result.Should().NotBeNull();
        result!.Name.Should().Be("Rating");
    }

    [Fact]
    public async Task GetByIdAsync_NotFound_ReturnsNull()
    {
        _repositoryMock.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((AnswerTemplate?)null);

        var result = await _sut.GetByIdAsync(999);

        result.Should().BeNull();
    }

    #endregion

    #region CreateAsync

    [Fact]
    public async Task CreateAsync_ValidOptions_CreatesTemplate()
    {
        var request = new CreateAnswerTemplateRequest
        {
            Name = "New Template",
            Options = new List<CreateAnswerOptionRequest>
            {
                new() { Text = "Option 1", Order = 1 },
                new() { Text = "Option 2", Order = 2 }
            }
        };

        _repositoryMock.Setup(r => r.CreateAsync(It.IsAny<AnswerTemplate>()))
            .ReturnsAsync((AnswerTemplate t) => { t.Id = 1; return t; });

        var result = await _sut.CreateAsync(request);

        result.Should().NotBeNull();
        result.Name.Should().Be("New Template");
        result.Options.Should().HaveCount(2);
    }

    [Fact]
    public async Task CreateAsync_TooFewOptions_ThrowsArgumentException()
    {
        var request = new CreateAnswerTemplateRequest
        {
            Name = "Bad Template",
            Options = new List<CreateAnswerOptionRequest>
            {
                new() { Text = "Only One", Order = 1 }
            }
        };

        var act = () => _sut.CreateAsync(request);

        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("Options count must be between 2 and 4.");
    }

    [Fact]
    public async Task CreateAsync_TooManyOptions_ThrowsArgumentException()
    {
        var request = new CreateAnswerTemplateRequest
        {
            Name = "Too Many",
            Options = new List<CreateAnswerOptionRequest>
            {
                new() { Text = "1", Order = 1 },
                new() { Text = "2", Order = 2 },
                new() { Text = "3", Order = 3 },
                new() { Text = "4", Order = 4 },
                new() { Text = "5", Order = 5 }
            }
        };

        var act = () => _sut.CreateAsync(request);

        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("Options count must be between 2 and 4.");
    }

    [Fact]
    public async Task CreateAsync_FourOptions_Succeeds()
    {
        var request = new CreateAnswerTemplateRequest
        {
            Name = "Four Options",
            Options = new List<CreateAnswerOptionRequest>
            {
                new() { Text = "A", Order = 1 },
                new() { Text = "B", Order = 2 },
                new() { Text = "C", Order = 3 },
                new() { Text = "D", Order = 4 }
            }
        };

        _repositoryMock.Setup(r => r.CreateAsync(It.IsAny<AnswerTemplate>()))
            .ReturnsAsync((AnswerTemplate t) => { t.Id = 1; return t; });

        var result = await _sut.CreateAsync(request);

        result.Options.Should().HaveCount(4);
    }

    #endregion

    #region UpdateAsync

    [Fact]
    public async Task UpdateAsync_ValidOptions_CallsRepository()
    {
        var request = new CreateAnswerTemplateRequest
        {
            Name = "Updated",
            Options = new List<CreateAnswerOptionRequest>
            {
                new() { Text = "A", Order = 1 },
                new() { Text = "B", Order = 2 }
            }
        };

        await _sut.UpdateAsync(1, request);

        _repositoryMock.Verify(r => r.UpdateAsync(It.Is<AnswerTemplate>(t =>
            t.Id == 1 && t.Name == "Updated"
        )), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_TooFewOptions_ThrowsArgumentException()
    {
        var request = new CreateAnswerTemplateRequest
        {
            Name = "Bad",
            Options = new List<CreateAnswerOptionRequest>
            {
                new() { Text = "Only One", Order = 1 }
            }
        };

        var act = () => _sut.UpdateAsync(1, request);

        await act.Should().ThrowAsync<ArgumentException>();
    }

    #endregion

    #region DeleteAsync

    [Fact]
    public async Task DeleteAsync_CallsRepository()
    {
        await _sut.DeleteAsync(1);

        _repositoryMock.Verify(r => r.DeleteAsync(1), Times.Once);
    }

    #endregion
}

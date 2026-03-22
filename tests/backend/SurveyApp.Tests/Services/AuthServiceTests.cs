using FluentAssertions;
using Moq;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Services.Implementations;
using SurveyApp.Core.Entities;
using SurveyApp.Core.Enums;
using SurveyApp.Core.Interfaces;

namespace SurveyApp.Tests.Services;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Func<User, string> _generateToken;
    private readonly AuthService _sut;

    public AuthServiceTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _generateToken = user => $"test-token-{user.Id}";
        _sut = new AuthService(_userRepositoryMock.Object, _generateToken);
    }

    #region LoginAsync

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsAuthResponse()
    {
        var password = "Test1234";
        var user = new User
        {
            Id = 1,
            Email = "test@test.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            FullName = "Test User",
            Role = UserRole.User
        };

        _userRepositoryMock.Setup(r => r.GetByEmailAsync("test@test.com"))
            .ReturnsAsync(user);

        var result = await _sut.LoginAsync(new LoginRequest
        {
            Email = "test@test.com",
            Password = password
        });

        result.Should().NotBeNull();
        result.Token.Should().Be("test-token-1");
        result.User.Email.Should().Be("test@test.com");
        result.User.FullName.Should().Be("Test User");
        result.User.Role.Should().Be("User");
    }

    [Fact]
    public async Task LoginAsync_InvalidEmail_ThrowsUnauthorizedAccessException()
    {
        _userRepositoryMock.Setup(r => r.GetByEmailAsync("wrong@test.com"))
            .ReturnsAsync((User?)null);

        var act = () => _sut.LoginAsync(new LoginRequest
        {
            Email = "wrong@test.com",
            Password = "Test1234"
        });

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Invalid email or password.");
    }

    [Fact]
    public async Task LoginAsync_WrongPassword_ThrowsUnauthorizedAccessException()
    {
        var user = new User
        {
            Id = 1,
            Email = "test@test.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("CorrectPassword"),
            FullName = "Test User",
            Role = UserRole.User
        };

        _userRepositoryMock.Setup(r => r.GetByEmailAsync("test@test.com"))
            .ReturnsAsync(user);

        var act = () => _sut.LoginAsync(new LoginRequest
        {
            Email = "test@test.com",
            Password = "WrongPassword"
        });

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Invalid email or password.");
    }

    #endregion

    #region RegisterAsync

    [Fact]
    public async Task RegisterAsync_NewUser_ReturnsAuthResponseWithUserRole()
    {
        _userRepositoryMock.Setup(r => r.GetByEmailAsync("new@test.com"))
            .ReturnsAsync((User?)null);

        _userRepositoryMock.Setup(r => r.CreateAsync(It.IsAny<User>()))
            .ReturnsAsync((User u) =>
            {
                u.Id = 5;
                return u;
            });

        var result = await _sut.RegisterAsync(new RegisterRequest
        {
            Email = "new@test.com",
            Password = "Test1234",
            FullName = "New User"
        });

        result.Should().NotBeNull();
        result.Token.Should().Be("test-token-5");
        result.User.Email.Should().Be("new@test.com");
        result.User.FullName.Should().Be("New User");
        result.User.Role.Should().Be("User");
    }

    [Fact]
    public async Task RegisterAsync_ExistingEmail_ThrowsInvalidOperationException()
    {
        _userRepositoryMock.Setup(r => r.GetByEmailAsync("existing@test.com"))
            .ReturnsAsync(new User { Id = 1, Email = "existing@test.com" });

        var act = () => _sut.RegisterAsync(new RegisterRequest
        {
            Email = "existing@test.com",
            Password = "Test1234",
            FullName = "Test"
        });

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Email is already registered.");
    }

    [Fact]
    public async Task RegisterAsync_PasswordIsHashed()
    {
        _userRepositoryMock.Setup(r => r.GetByEmailAsync(It.IsAny<string>()))
            .ReturnsAsync((User?)null);

        User? capturedUser = null;
        _userRepositoryMock.Setup(r => r.CreateAsync(It.IsAny<User>()))
            .Callback<User>(u => capturedUser = u)
            .ReturnsAsync((User u) => u);

        await _sut.RegisterAsync(new RegisterRequest
        {
            Email = "hash@test.com",
            Password = "MyPassword123",
            FullName = "Hash Test"
        });

        capturedUser.Should().NotBeNull();
        capturedUser!.PasswordHash.Should().NotBe("MyPassword123");
        BCrypt.Net.BCrypt.Verify("MyPassword123", capturedUser.PasswordHash).Should().BeTrue();
    }

    #endregion
}

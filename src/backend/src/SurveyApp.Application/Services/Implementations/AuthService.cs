using SurveyApp.Application.DTOs;
using SurveyApp.Application.Services.Interfaces;
using SurveyApp.Core.Entities;
using SurveyApp.Core.Enums;
using SurveyApp.Core.Interfaces;

namespace SurveyApp.Application.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly Func<User, string> _generateToken;

    public AuthService(IUserRepository userRepository, Func<User, string> generateToken)
    {
        _userRepository = userRepository;
        _generateToken = generateToken;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        return new AuthResponse
        {
            Token = _generateToken(user),
            User = MapToDto(user)
        };
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var existing = await _userRepository.GetByEmailAsync(request.Email);
        if (existing != null)
            throw new InvalidOperationException("Email is already registered.");

        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName,
            Role = UserRole.User
        };

        await _userRepository.CreateAsync(user);

        return new AuthResponse
        {
            Token = _generateToken(user),
            User = MapToDto(user)
        };
    }

    private static UserDto MapToDto(User user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        FullName = user.FullName,
        Role = user.Role.ToString()
    };
}

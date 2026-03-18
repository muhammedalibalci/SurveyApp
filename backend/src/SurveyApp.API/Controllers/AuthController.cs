using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Services.Interfaces;

namespace SurveyApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await _authService.LoginAsync(request);

            // JWT token'i HttpOnly cookie olarak set et
            SetTokenCookie(result.Token);

            // Response body'de token donme, sadece user bilgisi don
            return Ok(result.User);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var result = await _authService.RegisterAsync(request);

            SetTokenCookie(result.Token);

            return Ok(result.User);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        // Cookie'yi sil
        Response.Cookies.Append("access_token", "", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddDays(-1)
        });

        return Ok(new { message = "Logged out" });
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        // Cookie'deki token gecerliyse kullanici bilgisini don
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        var name = User.FindFirst(ClaimTypes.Name)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (userId == null) return Unauthorized();

        return Ok(new UserDto
        {
            Id = int.Parse(userId),
            Email = email ?? "",
            FullName = name ?? "",
            Role = role ?? ""
        });
    }

    private void SetTokenCookie(string token)
    {
        Response.Cookies.Append("access_token", token, new CookieOptions
        {
            HttpOnly = true,          // JS erisilemez
            Secure = false,            // Development icin false, production'da true
            SameSite = SameSiteMode.Lax, // CSRF korunmasi
            Expires = DateTimeOffset.UtcNow.AddHours(24),
            Path = "/"
        });
    }
}

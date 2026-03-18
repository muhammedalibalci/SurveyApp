using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.Application.DTOs;
using SurveyApp.Core.Interfaces;

namespace SurveyApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepository;

    public UsersController(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _userRepository.GetAllAsync();
        var result = users.Select(u => new UserDto
        {
            Id = u.Id,
            Email = u.Email,
            FullName = u.FullName,
            Role = u.Role.ToString()
        }).ToList();
        return Ok(result);
    }
}

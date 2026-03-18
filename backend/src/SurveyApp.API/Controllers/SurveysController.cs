using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Services.Interfaces;

namespace SurveyApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SurveysController : ControllerBase
{
    private readonly ISurveyService _service;
    private readonly ISurveyResponseService _responseService;

    public SurveysController(ISurveyService service, ISurveyResponseService responseService)
    {
        _service = service;
        _responseService = responseService;
    }

    // Admin endpoints
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateSurveyRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateSurveyRequest request)
    {
        await _service.UpdateAsync(id, request);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }

    [HttpGet("{id}/report")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetReport(int id)
    {
        var result = await _responseService.GetReportAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    // User endpoints
    [HttpGet("my")]
    [Authorize(Roles = "User")]
    public async Task<IActionResult> GetMySurveys()
    {
        var userId = GetUserId();
        var result = await _service.GetUserSurveysAsync(userId);
        return Ok(result);
    }

    [HttpGet("{id}/answer")]
    [Authorize(Roles = "User")]
    public async Task<IActionResult> GetSurveyForAnswering(int id)
    {
        var userId = GetUserId();
        var result = await _service.GetSurveyForAnsweringAsync(id, userId);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPost("submit")]
    [Authorize(Roles = "User")]
    public async Task<IActionResult> Submit([FromBody] SubmitSurveyRequest request)
    {
        try
        {
            var userId = GetUserId();
            await _responseService.SubmitAsync(userId, request);
            return Ok(new { message = "Survey submitted successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return int.Parse(claim!.Value);
    }
}

using System.Security.Claims;
using FluentValidation;
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
    private readonly IValidator<CreateSurveyRequest> _surveyValidator;
    private readonly IValidator<SubmitSurveyRequest> _submitValidator;

    public SurveysController(
        ISurveyService service,
        ISurveyResponseService responseService,
        IValidator<CreateSurveyRequest> surveyValidator,
        IValidator<SubmitSurveyRequest> submitValidator)
    {
        _service = service;
        _responseService = responseService;
        _surveyValidator = surveyValidator;
        _submitValidator = submitValidator;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("paged")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetPaged([FromQuery] PaginationParams paginationParams)
        => Ok(await _service.GetPagedAsync(paginationParams));

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
        var validation = await _surveyValidator.ValidateAsync(request);
        if (!validation.IsValid)
            return BadRequest(new { message = validation.Errors.First().ErrorMessage });

        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateSurveyRequest request)
    {
        var validation = await _surveyValidator.ValidateAsync(request);
        if (!validation.IsValid)
            return BadRequest(new { message = validation.Errors.First().ErrorMessage });

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

    [HttpGet("my")]
    [Authorize(Roles = "User")]
    public async Task<IActionResult> GetMySurveys()
        => Ok(await _service.GetUserSurveysAsync(GetUserId()));

    [HttpGet("{id}/answer")]
    [Authorize(Roles = "User")]
    public async Task<IActionResult> GetSurveyForAnswering(int id)
    {
        var result = await _service.GetSurveyForAnsweringAsync(id, GetUserId());
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPost("submit")]
    [Authorize(Roles = "User")]
    public async Task<IActionResult> Submit([FromBody] SubmitSurveyRequest request)
    {
        var validation = await _submitValidator.ValidateAsync(request);
        if (!validation.IsValid)
            return BadRequest(new { message = validation.Errors.First().ErrorMessage });

        await _responseService.SubmitAsync(GetUserId(), request);
        return Ok(new { message = "Anket basariyla gonderildi." });
    }

    private int GetUserId()
        => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}

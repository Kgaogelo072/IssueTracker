using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using IssueTracker.API.DTOs;
using IssueTracker.API.Services;

namespace IssueTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    [HttpGet]
    public async Task<IActionResult> GetProjects()
    {
        var userId = GetCurrentUserId();
        var projects = await _projectService.GetUserProjectsAsync(userId);
        return Ok(projects);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProject(int id)
    {
        var userId = GetCurrentUserId();
        var project = await _projectService.GetProjectByIdAsync(id, userId);
        
        if (project == null)
            return NotFound();

        return Ok(project);
    }

    [HttpPost]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        var project = await _projectService.CreateProjectAsync(request, userId);
        
        if (project == null)
            return BadRequest();

        return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProject(int id, [FromBody] UpdateProjectRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        var project = await _projectService.UpdateProjectAsync(id, request, userId);
        
        if (project == null)
            return NotFound();

        return Ok(project);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProject(int id)
    {
        var userId = GetCurrentUserId();
        var success = await _projectService.DeleteProjectAsync(id, userId);
        
        if (!success)
            return NotFound();

        return NoContent();
    }

    [HttpPost("{id}/members")]
    public async Task<IActionResult> AddMember(int id, [FromBody] AddMemberRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        var success = await _projectService.AddMemberAsync(id, request, userId);
        
        if (!success)
            return BadRequest(new { message = "Unable to add member. User may not exist or is already a member." });

        return Ok();
    }

    [HttpDelete("{id}/members/{memberId}")]
    public async Task<IActionResult> RemoveMember(int id, int memberId)
    {
        var userId = GetCurrentUserId();
        var success = await _projectService.RemoveMemberAsync(id, memberId, userId);
        
        if (!success)
            return BadRequest(new { message = "Unable to remove member." });

        return NoContent();
    }
}

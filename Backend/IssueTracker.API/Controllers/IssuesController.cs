using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using IssueTracker.API.DTOs;
using IssueTracker.API.Services;

namespace IssueTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class IssuesController : ControllerBase
{
    private readonly IIssueService _issueService;

    public IssuesController(IIssueService issueService)
    {
        _issueService = issueService;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    [HttpGet("project/{projectId}")]
    public async Task<IActionResult> GetProjectIssues(int projectId)
    {
        var userId = GetCurrentUserId();
        var issues = await _issueService.GetProjectIssuesAsync(projectId, userId);
        return Ok(issues);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetIssue(int id)
    {
        var userId = GetCurrentUserId();
        var issue = await _issueService.GetIssueByIdAsync(id, userId);
        
        if (issue == null)
            return NotFound();

        return Ok(issue);
    }

    [HttpPost]
    public async Task<IActionResult> CreateIssue([FromBody] CreateIssueRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        var issue = await _issueService.CreateIssueAsync(request, userId);
        
        if (issue == null)
            return BadRequest(new { message = "Unable to create issue. You may not have access to this project." });

        return CreatedAtAction(nameof(GetIssue), new { id = issue.Id }, issue);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateIssue(int id, [FromBody] UpdateIssueRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        var issue = await _issueService.UpdateIssueAsync(id, request, userId);
        
        if (issue == null)
            return NotFound();

        return Ok(issue);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteIssue(int id)
    {
        var userId = GetCurrentUserId();
        var success = await _issueService.DeleteIssueAsync(id, userId);
        
        if (!success)
            return NotFound();

        return NoContent();
    }

    [HttpPost("{id}/comments")]
    public async Task<IActionResult> AddComment(int id, [FromBody] CreateCommentRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        var comment = await _issueService.AddCommentAsync(id, request, userId);
        
        if (comment == null)
            return BadRequest(new { message = "Unable to add comment. Issue may not exist or you may not have access." });

        return Ok(comment);
    }

    [HttpDelete("comments/{commentId}")]
    public async Task<IActionResult> DeleteComment(int commentId)
    {
        var userId = GetCurrentUserId();
        var success = await _issueService.DeleteCommentAsync(commentId, userId);
        
        if (!success)
            return NotFound();

        return NoContent();
    }
}

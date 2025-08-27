using Microsoft.EntityFrameworkCore;
using IssueTracker.API.Data;
using IssueTracker.API.Models;
using IssueTracker.API.DTOs;

namespace IssueTracker.API.Services;

public interface IIssueService
{
    Task<List<IssueDto>> GetProjectIssuesAsync(int projectId, int userId);
    Task<IssueDto?> GetIssueByIdAsync(int issueId, int userId);
    Task<IssueDto?> CreateIssueAsync(CreateIssueRequest request, int userId);
    Task<IssueDto?> UpdateIssueAsync(int issueId, UpdateIssueRequest request, int userId);
    Task<bool> DeleteIssueAsync(int issueId, int userId);
    Task<CommentDto?> AddCommentAsync(int issueId, CreateCommentRequest request, int userId);
    Task<bool> DeleteCommentAsync(int commentId, int userId);
}

public class IssueService : IIssueService
{
    private readonly IssueTrackerDbContext _context;
    private readonly IProjectService _projectService;

    public IssueService(IssueTrackerDbContext context, IProjectService projectService)
    {
        _context = context;
        _projectService = projectService;
    }

    public async Task<List<IssueDto>> GetProjectIssuesAsync(int projectId, int userId)
    {
        if (!await _projectService.IsUserProjectMemberAsync(projectId, userId))
            return new List<IssueDto>();

        var issues = await _context.Issues
            .Include(i => i.Project)
            .Include(i => i.Creator)
            .Include(i => i.Assignments)
                .ThenInclude(a => a.User)
            .Include(i => i.Comments)
                .ThenInclude(c => c.Author)
            .Where(i => i.ProjectId == projectId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();

        return issues.Select(MapToDto).ToList();
    }

    public async Task<IssueDto?> GetIssueByIdAsync(int issueId, int userId)
    {
        var issue = await _context.Issues
            .Include(i => i.Project)
            .Include(i => i.Creator)
            .Include(i => i.Assignments)
                .ThenInclude(a => a.User)
            .Include(i => i.Comments)
                .ThenInclude(c => c.Author)
            .FirstOrDefaultAsync(i => i.Id == issueId);

        if (issue == null || !await _projectService.IsUserProjectMemberAsync(issue.ProjectId, userId))
            return null;

        return MapToDto(issue);
    }

    public async Task<IssueDto?> CreateIssueAsync(CreateIssueRequest request, int userId)
    {
        if (!await _projectService.IsUserProjectMemberAsync(request.ProjectId, userId))
            return null;

        var issue = new Issue
        {
            Title = request.Title,
            Description = request.Description,
            ProjectId = request.ProjectId,
            CreatorId = userId,
            Priority = request.Priority,
            Type = request.Type
        };

        _context.Issues.Add(issue);
        await _context.SaveChangesAsync();

        // Add assignments
        if (request.AssigneeIds.Any())
        {
            var assignments = request.AssigneeIds.Select(assigneeId => new IssueAssignment
            {
                IssueId = issue.Id,
                UserId = assigneeId
            }).ToList();

            _context.IssueAssignments.AddRange(assignments);
            await _context.SaveChangesAsync();
        }

        return await GetIssueByIdAsync(issue.Id, userId);
    }

    public async Task<IssueDto?> UpdateIssueAsync(int issueId, UpdateIssueRequest request, int userId)
    {
        var issue = await _context.Issues
            .Include(i => i.Assignments)
            .FirstOrDefaultAsync(i => i.Id == issueId);

        if (issue == null || !await _projectService.IsUserProjectMemberAsync(issue.ProjectId, userId))
            return null;

        issue.Title = request.Title;
        issue.Description = request.Description;
        issue.Status = request.Status;
        issue.Priority = request.Priority;
        issue.Type = request.Type;
        issue.UpdatedAt = DateTime.UtcNow;

        // Update assignments
        _context.IssueAssignments.RemoveRange(issue.Assignments);
        
        if (request.AssigneeIds.Any())
        {
            var assignments = request.AssigneeIds.Select(assigneeId => new IssueAssignment
            {
                IssueId = issue.Id,
                UserId = assigneeId
            }).ToList();

            _context.IssueAssignments.AddRange(assignments);
        }

        await _context.SaveChangesAsync();
        return await GetIssueByIdAsync(issueId, userId);
    }

    public async Task<bool> DeleteIssueAsync(int issueId, int userId)
    {
        var issue = await _context.Issues
            .FirstOrDefaultAsync(i => i.Id == issueId);

        if (issue == null || !await _projectService.IsUserProjectMemberAsync(issue.ProjectId, userId))
            return false;

        // Only creator or project owner can delete
        var project = await _context.Projects.FindAsync(issue.ProjectId);
        if (issue.CreatorId != userId && project?.OwnerId != userId)
            return false;

        _context.Issues.Remove(issue);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<CommentDto?> AddCommentAsync(int issueId, CreateCommentRequest request, int userId)
    {
        var issue = await _context.Issues.FindAsync(issueId);
        if (issue == null || !await _projectService.IsUserProjectMemberAsync(issue.ProjectId, userId))
            return null;

        var comment = new Comment
        {
            Content = request.Content,
            IssueId = issueId,
            AuthorId = userId
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        var savedComment = await _context.Comments
            .Include(c => c.Author)
            .FirstOrDefaultAsync(c => c.Id == comment.Id);

        return savedComment != null ? MapCommentToDto(savedComment) : null;
    }

    public async Task<bool> DeleteCommentAsync(int commentId, int userId)
    {
        var comment = await _context.Comments
            .Include(c => c.Issue)
            .FirstOrDefaultAsync(c => c.Id == commentId);

        if (comment == null || !await _projectService.IsUserProjectMemberAsync(comment.Issue.ProjectId, userId))
            return false;

        // Only author or project owner can delete
        var project = await _context.Projects.FindAsync(comment.Issue.ProjectId);
        if (comment.AuthorId != userId && project?.OwnerId != userId)
            return false;

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();
        return true;
    }

    private static IssueDto MapToDto(Issue issue)
    {
        return new IssueDto
        {
            Id = issue.Id,
            Title = issue.Title,
            Description = issue.Description,
            ProjectId = issue.ProjectId,
            ProjectName = issue.Project.Name,
            Creator = new UserDto
            {
                Id = issue.Creator.Id,
                Email = issue.Creator.Email,
                FirstName = issue.Creator.FirstName,
                LastName = issue.Creator.LastName
            },
            Status = issue.Status,
            Priority = issue.Priority,
            Type = issue.Type,
            CreatedAt = issue.CreatedAt,
            UpdatedAt = issue.UpdatedAt,
            Assignees = issue.Assignments.Select(a => new UserDto
            {
                Id = a.User.Id,
                Email = a.User.Email,
                FirstName = a.User.FirstName,
                LastName = a.User.LastName
            }).ToList(),
            Comments = issue.Comments
                .OrderBy(c => c.CreatedAt)
                .Select(MapCommentToDto)
                .ToList()
        };
    }

    private static CommentDto MapCommentToDto(Comment comment)
    {
        return new CommentDto
        {
            Id = comment.Id,
            Content = comment.Content,
            Author = new UserDto
            {
                Id = comment.Author.Id,
                Email = comment.Author.Email,
                FirstName = comment.Author.FirstName,
                LastName = comment.Author.LastName
            },
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt
        };
    }
}

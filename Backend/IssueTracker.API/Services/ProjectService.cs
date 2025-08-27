using Microsoft.EntityFrameworkCore;
using IssueTracker.API.Data;
using IssueTracker.API.Models;
using IssueTracker.API.DTOs;

namespace IssueTracker.API.Services;

public interface IProjectService
{
    Task<List<ProjectDto>> GetUserProjectsAsync(int userId);
    Task<ProjectDto?> GetProjectByIdAsync(int projectId, int userId);
    Task<ProjectDto?> CreateProjectAsync(CreateProjectRequest request, int userId);
    Task<ProjectDto?> UpdateProjectAsync(int projectId, UpdateProjectRequest request, int userId);
    Task<bool> DeleteProjectAsync(int projectId, int userId);
    Task<bool> AddMemberAsync(int projectId, AddMemberRequest request, int userId);
    Task<bool> RemoveMemberAsync(int projectId, int memberId, int userId);
    Task<bool> IsUserProjectMemberAsync(int projectId, int userId);
}

public class ProjectService : IProjectService
{
    private readonly IssueTrackerDbContext _context;

    public ProjectService(IssueTrackerDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProjectDto>> GetUserProjectsAsync(int userId)
    {
        var projects = await _context.Projects
            .Include(p => p.Owner)
            .Include(p => p.Members)
                .ThenInclude(m => m.User)
            .Include(p => p.Issues)
            .Where(p => p.OwnerId == userId || p.Members.Any(m => m.UserId == userId))
            .ToListAsync();

        return projects.Select(MapToDto).ToList();
    }

    public async Task<ProjectDto?> GetProjectByIdAsync(int projectId, int userId)
    {
        var project = await _context.Projects
            .Include(p => p.Owner)
            .Include(p => p.Members)
                .ThenInclude(m => m.User)
            .Include(p => p.Issues)
            .FirstOrDefaultAsync(p => p.Id == projectId && 
                (p.OwnerId == userId || p.Members.Any(m => m.UserId == userId)));

        return project != null ? MapToDto(project) : null;
    }

    public async Task<ProjectDto?> CreateProjectAsync(CreateProjectRequest request, int userId)
    {
        var project = new Project
        {
            Name = request.Name,
            Description = request.Description,
            OwnerId = userId
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        // Add owner as admin member
        var ownerMembership = new ProjectMember
        {
            ProjectId = project.Id,
            UserId = userId,
            Role = ProjectRole.Admin
        };

        _context.ProjectMembers.Add(ownerMembership);
        await _context.SaveChangesAsync();

        return await GetProjectByIdAsync(project.Id, userId);
    }

    public async Task<ProjectDto?> UpdateProjectAsync(int projectId, UpdateProjectRequest request, int userId)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId && p.OwnerId == userId);

        if (project == null) return null;

        project.Name = request.Name;
        project.Description = request.Description;
        project.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return await GetProjectByIdAsync(projectId, userId);
    }

    public async Task<bool> DeleteProjectAsync(int projectId, int userId)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId && p.OwnerId == userId);

        if (project == null) return false;

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AddMemberAsync(int projectId, AddMemberRequest request, int userId)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId && p.OwnerId == userId);

        if (project == null) return false;

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null) return false;

        // Check if user is already a member
        var existingMember = await _context.ProjectMembers
            .FirstOrDefaultAsync(m => m.ProjectId == projectId && m.UserId == user.Id);

        if (existingMember != null) return false;

        var member = new ProjectMember
        {
            ProjectId = projectId,
            UserId = user.Id,
            Role = request.Role
        };

        _context.ProjectMembers.Add(member);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveMemberAsync(int projectId, int memberId, int userId)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId && p.OwnerId == userId);

        if (project == null) return false;

        var member = await _context.ProjectMembers
            .FirstOrDefaultAsync(m => m.Id == memberId && m.ProjectId == projectId);

        if (member == null || member.UserId == userId) return false; // Can't remove owner

        _context.ProjectMembers.Remove(member);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> IsUserProjectMemberAsync(int projectId, int userId)
    {
        return await _context.Projects
            .AnyAsync(p => p.Id == projectId && 
                (p.OwnerId == userId || p.Members.Any(m => m.UserId == userId)));
    }

    private static ProjectDto MapToDto(Project project)
    {
        return new ProjectDto
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            Owner = new UserDto
            {
                Id = project.Owner.Id,
                Email = project.Owner.Email,
                FirstName = project.Owner.FirstName,
                LastName = project.Owner.LastName
            },
            CreatedAt = project.CreatedAt,
            UpdatedAt = project.UpdatedAt,
            Members = project.Members.Select(m => new ProjectMemberDto
            {
                Id = m.Id,
                User = new UserDto
                {
                    Id = m.User.Id,
                    Email = m.User.Email,
                    FirstName = m.User.FirstName,
                    LastName = m.User.LastName
                },
                Role = m.Role,
                JoinedAt = m.JoinedAt
            }).ToList(),
            IssueCount = project.Issues.Count
        };
    }
}

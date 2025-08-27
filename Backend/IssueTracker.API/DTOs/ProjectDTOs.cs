using System.ComponentModel.DataAnnotations;
using IssueTracker.API.Models;

namespace IssueTracker.API.DTOs;

public class CreateProjectRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;
}

public class UpdateProjectRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;
}

public class ProjectDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public UserDto Owner { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<ProjectMemberDto> Members { get; set; } = new();
    public int IssueCount { get; set; }
}

public class ProjectMemberDto
{
    public int Id { get; set; }
    public UserDto User { get; set; } = null!;
    public ProjectRole Role { get; set; }
    public DateTime JoinedAt { get; set; }
}

public class AddMemberRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    public ProjectRole Role { get; set; } = ProjectRole.Member;
}

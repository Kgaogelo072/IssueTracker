using System.ComponentModel.DataAnnotations;
using IssueTracker.API.Models;

namespace IssueTracker.API.DTOs;

public class CreateIssueRequest
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    public int ProjectId { get; set; }
    
    public IssuePriority Priority { get; set; } = IssuePriority.Medium;
    
    public IssueType Type { get; set; } = IssueType.Task;
    
    public List<int> AssigneeIds { get; set; } = new();
}

public class UpdateIssueRequest
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;
    
    public IssueStatus Status { get; set; }
    
    public IssuePriority Priority { get; set; }
    
    public IssueType Type { get; set; }
    
    public List<int> AssigneeIds { get; set; } = new();
}

public class IssueDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public UserDto Creator { get; set; } = null!;
    public IssueStatus Status { get; set; }
    public IssuePriority Priority { get; set; }
    public IssueType Type { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<UserDto> Assignees { get; set; } = new();
    public List<CommentDto> Comments { get; set; } = new();
}

public class CommentDto
{
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public UserDto Author { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateCommentRequest
{
    [Required]
    [MaxLength(1000)]
    public string Content { get; set; } = string.Empty;
}

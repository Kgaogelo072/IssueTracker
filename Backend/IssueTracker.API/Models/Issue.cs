using System.ComponentModel.DataAnnotations;

namespace IssueTracker.API.Models;

public class Issue
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    public int ProjectId { get; set; }
    
    [Required]
    public int CreatorId { get; set; }
    
    public IssueStatus Status { get; set; } = IssueStatus.Todo;
    
    public IssuePriority Priority { get; set; } = IssuePriority.Medium;
    
    public IssueType Type { get; set; } = IssueType.Task;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Project Project { get; set; } = null!;
    public User Creator { get; set; } = null!;
    public ICollection<IssueAssignment> Assignments { get; set; } = new List<IssueAssignment>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}

public class IssueAssignment
{
    public int Id { get; set; }
    
    [Required]
    public int IssueId { get; set; }
    
    [Required]
    public int UserId { get; set; }
    
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Issue Issue { get; set; } = null!;
    public User User { get; set; } = null!;
}

public enum IssueStatus
{
    Todo = 0,
    InProgress = 1,
    InReview = 2,
    Done = 3
}

public enum IssuePriority
{
    Low = 0,
    Medium = 1,
    High = 2,
    Critical = 3
}

public enum IssueType
{
    Task = 0,
    Bug = 1,
    Feature = 2,
    Epic = 3
}

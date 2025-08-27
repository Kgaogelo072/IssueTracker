using System.ComponentModel.DataAnnotations;

namespace IssueTracker.API.Models;

public class Project
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    public int OwnerId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public User Owner { get; set; } = null!;
    public ICollection<ProjectMember> Members { get; set; } = new List<ProjectMember>();
    public ICollection<Issue> Issues { get; set; } = new List<Issue>();
}

public class ProjectMember
{
    public int Id { get; set; }
    
    [Required]
    public int ProjectId { get; set; }
    
    [Required]
    public int UserId { get; set; }
    
    public ProjectRole Role { get; set; } = ProjectRole.Member;
    
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Project Project { get; set; } = null!;
    public User User { get; set; } = null!;
}

public enum ProjectRole
{
    Member = 0,
    Admin = 1
}

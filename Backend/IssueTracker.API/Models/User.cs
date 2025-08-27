using System.ComponentModel.DataAnnotations;

namespace IssueTracker.API.Models;

public class User
{
    public int Id { get; set; }
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    public string PasswordHash { get; set; } = string.Empty;
    
    [Required]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    public string LastName { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public ICollection<Project> OwnedProjects { get; set; } = new List<Project>();
    public ICollection<ProjectMember> ProjectMemberships { get; set; } = new List<ProjectMember>();
    public ICollection<Issue> CreatedIssues { get; set; } = new List<Issue>();
    public ICollection<IssueAssignment> AssignedIssues { get; set; } = new List<IssueAssignment>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}

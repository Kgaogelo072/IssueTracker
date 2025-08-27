using System.ComponentModel.DataAnnotations;

namespace IssueTracker.API.Models;

public class Comment
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(1000)]
    public string Content { get; set; } = string.Empty;
    
    [Required]
    public int IssueId { get; set; }
    
    [Required]
    public int AuthorId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Issue Issue { get; set; } = null!;
    public User Author { get; set; } = null!;
}

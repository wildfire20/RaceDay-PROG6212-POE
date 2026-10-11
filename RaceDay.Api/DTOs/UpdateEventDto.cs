using System.ComponentModel.DataAnnotations;

namespace RaceDay.Api.DTOs;

public class UpdateEventDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    public DateTime EventDate { get; set; }

    [Required]
    [MaxLength(200)]
    public string Location { get; set; } = string.Empty;

    [Range(0.1, double.MaxValue)]
    public decimal Distance { get; set; }

    [Required]
    public string EventType { get; set; } = string.Empty;
}
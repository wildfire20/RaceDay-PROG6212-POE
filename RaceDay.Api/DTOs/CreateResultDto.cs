using System.ComponentModel.DataAnnotations;

namespace RaceDay.Api.DTOs;

public class CreateResultDto
{
    [Required]
    public string FinishTime { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int FinishingPosition { get; set; }
}
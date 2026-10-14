using System.ComponentModel.DataAnnotations;

namespace RaceDay.Api.DTOs;

public class UpdateEnrolmentStatusDto
{
    [Required]
    public string Status { get; set; } = string.Empty;
}
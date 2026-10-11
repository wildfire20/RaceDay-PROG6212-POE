using System.ComponentModel.DataAnnotations;

namespace RaceDay.Api.DTOs;

public class AssignCategoryDto
{
    [Range(1, int.MaxValue)]
    public int CategoryId { get; set; }
}
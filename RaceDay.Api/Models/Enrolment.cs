using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace RaceDay.Api.Models;

public class Enrolment
{
    public int EnrolmentId { get; set; }

    public int ParticipantId { get; set; }

    public int EventCategoryId { get; set; }

    public DateTime EnrolmentDate { get; set; } = DateTime.UtcNow;

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Pending";

    [JsonIgnore]
    public User? Participant { get; set; }

    [JsonIgnore]
    public EventCategory? EventCategory { get; set; }

    [JsonIgnore]
    public Result? Result { get; set; }
}
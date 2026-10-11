using System.Text.Json.Serialization;

namespace RaceDay.Api.Models;

public class Result
{
    public int ResultId { get; set; }

    public int EnrolmentId { get; set; }

    public TimeSpan FinishTime { get; set; }

    public int FinishingPosition { get; set; }

    public bool IsPublished { get; set; }

    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;

    [JsonIgnore]
    public Enrolment? Enrolment { get; set; }
}
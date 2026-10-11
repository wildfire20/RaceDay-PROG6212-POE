using System.Text.Json.Serialization;

namespace RaceDay.Api.Models;

public class EventCategory
{
    public int EventCategoryId { get; set; }

    public int EventId { get; set; }

    public int CategoryId { get; set; }

    [JsonIgnore]
    public Event? Event { get; set; }

    [JsonIgnore]
    public Category? Category { get; set; }

    [JsonIgnore]
    public ICollection<Enrolment> Enrolments { get; set; }
        = new List<Enrolment>();
}
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RaceDay.Api.Data;
using RaceDay.Api.DTOs;
using RaceEvent = RaceDay.Api.Models.Event;

namespace RaceDay.Api.Controllers;

// References:
// Microsoft Learn - ASP.NET Core Web API controllers
// https://learn.microsoft.com/en-us/aspnet/core/web-api/
//
// Microsoft Learn - EF Core querying and saving data
// https://learn.microsoft.com/en-us/ef/core/

[ApiController]
[Route("api/events")]
public class EventsController : ControllerBase
{
    private readonly RaceDayDbContext _context;

    public EventsController(RaceDayDbContext context)
    {
        _context = context;
    }

    // Public: view all events
    [HttpGet]
    public async Task<IActionResult> GetEvents()
    {
        var events = await _context.Events
            .AsNoTracking()
            .Select(e => new
            {
                e.EventId,
                e.Name,
                e.Description,
                e.EventDate,
                e.Location,
                e.Distance,
                e.EventType,
                e.BannerImageUrl,
                e.OrganiserId
            })
            .ToListAsync();

        return Ok(events);
    }

    // Public: view one event
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetEvent(int id)
    {
        var raceEvent = await _context.Events
            .AsNoTracking()
            .Where(e => e.EventId == id)
            .Select(e => new
            {
                e.EventId,
                e.Name,
                e.Description,
                e.EventDate,
                e.Location,
                e.Distance,
                e.EventType,
                e.BannerImageUrl,
                e.OrganiserId
            })
            .FirstOrDefaultAsync();

        if (raceEvent == null)
        {
            return NotFound(new
            {
                message = "Event not found."
            });
        }

        return Ok(raceEvent);
    }

    // Organiser only: create event
    [HttpPost]
    public async Task<IActionResult> CreateEvent(CreateEventDto dto)
    {
        int? userId = HttpContext.Session.GetInt32("UserId");
        string? role = HttpContext.Session.GetString("Role");

        if (userId == null)
        {
            return Unauthorized(new
            {
                message = "You must log in first."
            });
        }

        if (role != "Organiser")
        {
            return StatusCode(403, new
            {
                message = "Only Organisers can create events."
            });
        }

        string eventType = dto.EventType.Trim();

        if (eventType != "Run" &&
            eventType != "Walk" &&
            eventType != "Cycle")
        {
            return BadRequest(new
            {
                message = "Event type must be Run, Walk or Cycle."
            });
        }

        var raceEvent = new RaceEvent
        {
            OrganiserId = userId.Value,
            Name = dto.Name.Trim(),
            Description = dto.Description.Trim(),
            EventDate = dto.EventDate,
            Location = dto.Location.Trim(),
            Distance = dto.Distance,
            EventType = eventType,
            CreatedAt = DateTime.UtcNow
        };

        _context.Events.Add(raceEvent);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetEvent),
            new { id = raceEvent.EventId },
            new
            {
                message = "Event created successfully.",
                raceEvent.EventId,
                raceEvent.Name,
                raceEvent.EventDate,
                raceEvent.Location,
                raceEvent.Distance,
                raceEvent.EventType
            });
    }

    // Organiser only: update own event
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateEvent(
        int id,
        UpdateEventDto dto)
    {
        int? userId = HttpContext.Session.GetInt32("UserId");
        string? role = HttpContext.Session.GetString("Role");

        if (userId == null)
        {
            return Unauthorized(new
            {
                message = "You must log in first."
            });
        }

        if (role != "Organiser")
        {
            return StatusCode(403, new
            {
                message = "Only Organisers can update events."
            });
        }

        var raceEvent = await _context.Events
            .FirstOrDefaultAsync(e => e.EventId == id);

        if (raceEvent == null)
        {
            return NotFound(new
            {
                message = "Event not found."
            });
        }

        if (raceEvent.OrganiserId != userId.Value)
        {
            return StatusCode(403, new
            {
                message = "You can only update your own events."
            });
        }

        string eventType = dto.EventType.Trim();

        if (eventType != "Run" &&
            eventType != "Walk" &&
            eventType != "Cycle")
        {
            return BadRequest(new
            {
                message = "Event type must be Run, Walk or Cycle."
            });
        }

        raceEvent.Name = dto.Name.Trim();
        raceEvent.Description = dto.Description.Trim();
        raceEvent.EventDate = dto.EventDate;
        raceEvent.Location = dto.Location.Trim();
        raceEvent.Distance = dto.Distance;
        raceEvent.EventType = eventType;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Event updated successfully."
        });
    }

    // Organiser only: delete own event
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteEvent(int id)
    {
        int? userId = HttpContext.Session.GetInt32("UserId");
        string? role = HttpContext.Session.GetString("Role");

        if (userId == null)
        {
            return Unauthorized(new
            {
                message = "You must log in first."
            });
        }

        if (role != "Organiser")
        {
            return StatusCode(403, new
            {
                message = "Only Organisers can delete events."
            });
        }

        var raceEvent = await _context.Events
            .FirstOrDefaultAsync(e => e.EventId == id);

        if (raceEvent == null)
        {
            return NotFound(new
            {
                message = "Event not found."
            });
        }

        if (raceEvent.OrganiserId != userId.Value)
        {
            return StatusCode(403, new
            {
                message = "You can only delete your own events."
            });
        }

        _context.Events.Remove(raceEvent);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
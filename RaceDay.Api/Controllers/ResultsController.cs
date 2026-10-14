using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RaceDay.Api.Data;
using RaceDay.Api.DTOs;
using RaceDay.Api.Models;

namespace RaceDay.Api.Controllers;

[ApiController]
[Route("api")]
public class ResultsController : ControllerBase
{
    private readonly RaceDayDbContext _context;

    public ResultsController(RaceDayDbContext context)
    {
        _context = context;
    }

    // Organiser only: capture result
    [HttpPost("enrolments/{enrolmentId:int}/result")]
    public async Task<IActionResult> CreateResult(
        int enrolmentId,
        CreateResultDto dto)
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
                message = "Only Organisers can capture results."
            });
        }

        var enrolment = await _context.Enrolments
            .Include(e => e.EventCategory)
            .FirstOrDefaultAsync(e => e.EnrolmentId == enrolmentId);

        if (enrolment == null)
        {
            return NotFound(new
            {
                message = "Enrolment not found."
            });
        }

        var raceEvent = await _context.Events
            .FirstOrDefaultAsync(e =>
                e.EventId == enrolment.EventCategory!.EventId);

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
                message = "You can only capture results for your own events."
            });
        }

        bool resultExists = await _context.Results
            .AnyAsync(r => r.EnrolmentId == enrolmentId);

        if (resultExists)
        {
            return Conflict(new
            {
                message = "A result already exists for this enrolment."
            });
        }

        if (!TimeSpan.TryParse(dto.FinishTime, out TimeSpan finishTime))
        {
            return BadRequest(new
            {
                message = "Finish time must use a valid format such as 00:52:18."
            });
        }

        var result = new Result
        {
            EnrolmentId = enrolmentId,
            FinishTime = finishTime,
            FinishingPosition = dto.FinishingPosition,
            IsPublished = false,
            RecordedAt = DateTime.UtcNow
        };

        _context.Results.Add(result);
        await _context.SaveChangesAsync();

        return Created("", new
        {
            message = "Result captured successfully.",
            result.ResultId,
            result.EnrolmentId,
            result.FinishTime,
            result.FinishingPosition,
            result.IsPublished
        });
    }

    // Organiser only: publish result
    [HttpPut("results/{id:int}/publish")]
    public async Task<IActionResult> PublishResult(int id)
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
                message = "Only Organisers can publish results."
            });
        }

        var result = await _context.Results
            .Include(r => r.Enrolment)
            .ThenInclude(e => e!.EventCategory)
            .FirstOrDefaultAsync(r => r.ResultId == id);

        if (result == null)
        {
            return NotFound(new
            {
                message = "Result not found."
            });
        }

        int eventId = result.Enrolment!.EventCategory!.EventId;

        var raceEvent = await _context.Events
            .FirstOrDefaultAsync(e => e.EventId == eventId);

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
                message = "You can only publish results for your own events."
            });
        }

        result.IsPublished = true;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Result published successfully.",
            result.ResultId,
            result.IsPublished
        });
    }

    // Participant only: view own published results
    [HttpGet("results/my")]
    public async Task<IActionResult> GetMyResults()
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

        if (role != "Participant")
        {
            return StatusCode(403, new
            {
                message = "Only Participants can view personal results."
            });
        }

        var results = await _context.Results
            .AsNoTracking()
            .Where(r =>
                r.Enrolment!.ParticipantId == userId.Value &&
                r.IsPublished)
            .Select(r => new
            {
                r.ResultId,
                r.FinishTime,
                r.FinishingPosition,
                r.RecordedAt,

                EventId =
                    r.Enrolment!.EventCategory!.EventId,

                EventName =
                    r.Enrolment.EventCategory.Event!.Name,

                CategoryName =
                    r.Enrolment.EventCategory.Category!.Name
            })
            .ToListAsync();

        return Ok(results);
    }
    // Organiser only: view results for own event
    [HttpGet("events/{eventId:int}/results")]
    public async Task<IActionResult> GetEventResults(int eventId)
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
                message = "Only Organisers can view event results."
            });
        }

        var raceEvent = await _context.Events
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.EventId == eventId);

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
                message = "You can only view results for your own events."
            });
        }

        var results = await _context.Results
            .AsNoTracking()
            .Where(r =>
                r.Enrolment!.EventCategory!.EventId == eventId)
            .Select(r => new
            {
                r.ResultId,
                r.EnrolmentId,
                r.FinishTime,
                r.FinishingPosition,
                r.IsPublished,
                r.RecordedAt,

                ParticipantId =
                    r.Enrolment!.ParticipantId,

                ParticipantFirstName =
                    r.Enrolment.Participant!.FirstName,

                ParticipantLastName =
                    r.Enrolment.Participant.LastName,

                CategoryName =
                    r.Enrolment.EventCategory!.Category!.Name
            })
            .ToListAsync();

        return Ok(results);
    }
}
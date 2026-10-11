using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RaceDay.Api.Data;
using RaceDay.Api.DTOs;
using RaceDay.Api.Models;

namespace RaceDay.Api.Controllers;

[ApiController]
[Route("api")]
public class EnrolmentsController : ControllerBase
{
    private readonly RaceDayDbContext _context;

    public EnrolmentsController(RaceDayDbContext context)
    {
        _context = context;
    }

    // Participant only: enrol in an event
    [HttpPost("events/{eventId:int}/enrolments")]
    public async Task<IActionResult> CreateEnrolment(
        int eventId,
        CreateEnrolmentDto dto)
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
                message = "Only Participants can enrol in events."
            });
        }

        bool eventExists = await _context.Events
            .AnyAsync(e => e.EventId == eventId);

        if (!eventExists)
        {
            return NotFound(new
            {
                message = "Event not found."
            });
        }

        var eventCategory = await _context.EventCategories
            .AsNoTracking()
            .FirstOrDefaultAsync(ec =>
                ec.EventCategoryId == dto.EventCategoryId &&
                ec.EventId == eventId);

        if (eventCategory == null)
        {
            return NotFound(new
            {
                message = "The selected category is not available for this event."
            });
        }

        var eventCategoryIds = _context.EventCategories
            .Where(ec => ec.EventId == eventId)
            .Select(ec => ec.EventCategoryId);

        bool alreadyEnrolled = await _context.Enrolments
            .AnyAsync(e =>
                e.ParticipantId == userId.Value &&
                eventCategoryIds.Contains(e.EventCategoryId));

        if (alreadyEnrolled)
        {
            return Conflict(new
            {
                message = "You are already enrolled in this event."
            });
        }

        var enrolment = new Enrolment
        {
            ParticipantId = userId.Value,
            EventCategoryId = dto.EventCategoryId,
            EnrolmentDate = DateTime.UtcNow,
            Status = "Confirmed"
        };

        _context.Enrolments.Add(enrolment);
        await _context.SaveChangesAsync();

        return Created("", new
        {
            message = "Event enrolment completed successfully.",
            enrolment.EnrolmentId,
            enrolment.ParticipantId,
            enrolment.EventCategoryId,
            enrolment.EnrolmentDate,
            enrolment.Status
        });
    }

    // Participant only: view own enrolments
    [HttpGet("enrolments/my")]
    public async Task<IActionResult> GetMyEnrolments()
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
                message = "Only Participants can view personal enrolments."
            });
        }

        var enrolments = await _context.Enrolments
            .AsNoTracking()
            .Where(e => e.ParticipantId == userId.Value)
            .Select(e => new
            {
                e.EnrolmentId,
                e.EnrolmentDate,
                e.Status,

                EventId = e.EventCategory!.EventId,
                EventName = e.EventCategory.Event!.Name,

                CategoryId = e.EventCategory.CategoryId,
                CategoryName = e.EventCategory.Category!.Name,
                CategoryType = e.EventCategory.Category.CategoryType
            })
            .ToListAsync();

        return Ok(enrolments);
    }

    // Organiser only: view enrolments for own event
    [HttpGet("events/{eventId:int}/enrolments")]
    public async Task<IActionResult> GetEventEnrolments(int eventId)
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
                message = "Only Organisers can view event enrolments."
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
                message = "You can only view enrolments for your own events."
            });
        }

        var enrolments = await _context.Enrolments
            .AsNoTracking()
            .Where(e => e.EventCategory!.EventId == eventId)
            .Select(e => new
            {
                e.EnrolmentId,
                e.EnrolmentDate,
                e.Status,

                ParticipantId = e.ParticipantId,
                ParticipantFirstName = e.Participant!.FirstName,
                ParticipantLastName = e.Participant.LastName,
                ParticipantEmail = e.Participant.Email,

                CategoryId = e.EventCategory!.CategoryId,
                CategoryName = e.EventCategory.Category!.Name,
                CategoryType = e.EventCategory.Category.CategoryType
            })
            .ToListAsync();

        return Ok(enrolments);
    }
}
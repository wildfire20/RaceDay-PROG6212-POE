using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RaceDay.Api.Data;
using RaceDay.Api.DTOs;
using RaceDay.Api.Models;

namespace RaceDay.Api.Controllers;

// References:
// Microsoft Learn - ASP.NET Core Web API
// https://learn.microsoft.com/en-us/aspnet/core/web-api/
//
// Microsoft Learn - EF Core
// https://learn.microsoft.com/en-us/ef/core/

[ApiController]
[Route("api")]
public class CategoriesController : ControllerBase
{
    private readonly RaceDayDbContext _context;

    public CategoriesController(RaceDayDbContext context)
    {
        _context = context;
    }

    // Public: view all categories
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.Categories
            .AsNoTracking()
            .Select(c => new
            {
                c.CategoryId,
                c.Name,
                c.CategoryType,
                c.Description
            })
            .ToListAsync();

        return Ok(categories);
    }

    // Organiser only: create category
    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory(
        CreateCategoryDto dto)
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
                message = "Only Organisers can create categories."
            });
        }

        string name = dto.Name.Trim();
        string categoryType = dto.CategoryType.Trim();

        bool exists = await _context.Categories
            .AnyAsync(c =>
                c.Name == name &&
                c.CategoryType == categoryType);

        if (exists)
        {
            return Conflict(new
            {
                message = "This category already exists."
            });
        }

        var category = new Category
        {
            Name = name,
            CategoryType = categoryType,
            Description = dto.Description.Trim()
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return Created("", new
        {
            message = "Category created successfully.",
            category.CategoryId,
            category.Name,
            category.CategoryType,
            category.Description
        });
    }

    // Public: view categories assigned to one event
    [HttpGet("events/{eventId:int}/categories")]
    public async Task<IActionResult> GetEventCategories(
        int eventId)
    {
        bool eventExists = await _context.Events
            .AnyAsync(e => e.EventId == eventId);

        if (!eventExists)
        {
            return NotFound(new
            {
                message = "Event not found."
            });
        }

        var categories = await _context.EventCategories
            .AsNoTracking()
            .Where(ec => ec.EventId == eventId)
            .Select(ec => new
            {
                ec.EventCategoryId,
                ec.EventId,
                ec.CategoryId,
                Name = ec.Category!.Name,
                CategoryType = ec.Category.CategoryType,
                Description = ec.Category.Description
            })
            .ToListAsync();

        return Ok(categories);
    }

    // Organiser only: assign category to own event
    [HttpPost("events/{eventId:int}/categories")]
    public async Task<IActionResult> AssignCategory(
        int eventId,
        AssignCategoryDto dto)
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
                message = "Only Organisers can manage event categories."
            });
        }

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
                message = "You can only manage categories for your own events."
            });
        }

        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.CategoryId == dto.CategoryId);

        if (category == null)
        {
            return NotFound(new
            {
                message = "Category not found."
            });
        }

        bool alreadyAssigned = await _context.EventCategories
            .AnyAsync(ec =>
                ec.EventId == eventId &&
                ec.CategoryId == dto.CategoryId);

        if (alreadyAssigned)
        {
            return Conflict(new
            {
                message = "This category is already assigned to the event."
            });
        }

        var eventCategory = new EventCategory
        {
            EventId = eventId,
            CategoryId = dto.CategoryId
        };

        _context.EventCategories.Add(eventCategory);
        await _context.SaveChangesAsync();

        return Created("", new
        {
            message = "Category assigned to event successfully.",
            eventCategory.EventCategoryId,
            eventCategory.EventId,
            eventCategory.CategoryId
        });
    }

    // Organiser only: remove category from own event
    [HttpDelete(
        "events/{eventId:int}/categories/{categoryId:int}")]
    public async Task<IActionResult> RemoveCategory(
        int eventId,
        int categoryId)
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
                message = "Only Organisers can manage event categories."
            });
        }

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
                message = "You can only manage categories for your own events."
            });
        }

        var eventCategory = await _context.EventCategories
            .FirstOrDefaultAsync(ec =>
                ec.EventId == eventId &&
                ec.CategoryId == categoryId);

        if (eventCategory == null)
        {
            return NotFound(new
            {
                message = "The category is not assigned to this event."
            });
        }

        _context.EventCategories.Remove(eventCategory);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RaceDay.Api.Controllers;
using RaceDay.Api.Data;
using RaceDay.Api.DTOs;
using RaceDay.Api.Models;
using Xunit;
using RaceEvent = RaceDay.Api.Models.Event;

namespace RaceDay.Api.Tests;

// References:
// Microsoft Learn - Unit testing controller logic in ASP.NET Core
// Microsoft Learn - EF Core testing with database test doubles
// xUnit documentation - Fact-based tests

public class RaceDayControllerTests
{
    private static RaceDayDbContext CreateContext()
    {
        var options =
            new DbContextOptionsBuilder<RaceDayDbContext>()
                .UseInMemoryDatabase(
                    Guid.NewGuid().ToString())
                .Options;

        return new RaceDayDbContext(options);
    }

    private static TestSession CreateSession(
        int? userId = null,
        string? role = null)
    {
        var session = new TestSession();

        if (userId.HasValue)
        {
            session.SetInt32(
                "UserId",
                userId.Value);
        }

        if (!string.IsNullOrWhiteSpace(role))
        {
            session.SetString(
                "Role",
                role);
        }

        return session;
    }

    private static void AttachSession(
        ControllerBase controller,
        ISession session)
    {
        var httpContext = new DefaultHttpContext
        {
            Session = session
        };

        controller.ControllerContext =
            new ControllerContext
            {
                HttpContext = httpContext
            };
    }

    private static async Task<User> AddUser(
        RaceDayDbContext context,
        string email,
        string role,
        string password = "RaceDay123!")
    {
        var user = new User
        {
            FirstName = role == "Organiser"
                ? "Wayne"
                : "Sipho",

            LastName = role == "Organiser"
                ? "Mundirwa"
                : "Nkosi",

            Email = email,
            Role = role,
            PhoneNumber = "0712345678",
            CreatedAt = DateTime.UtcNow
        };

        var hasher = new PasswordHasher<User>();

        user.PasswordHash =
            hasher.HashPassword(
                user,
                password);

        context.Users.Add(user);
        await context.SaveChangesAsync();

        return user;
    }

    [Fact]
    public async Task Register_ValidUser_ReturnsCreated()
    {
        using var context = CreateContext();

        var hasher = new PasswordHasher<User>();

        var controller =
            new AuthController(
                context,
                hasher);

        AttachSession(
            controller,
            CreateSession());

        var dto = new RegisterDto
        {
            FirstName = "Wayne",
            LastName = "Mundirwa",
            Email = "wayne@test.co.za",
            Password = "RaceDay123!",
            Role = "Organiser",
            PhoneNumber = "0712345678"
        };

        var result =
            await controller.Register(dto);

        Assert.IsType<CreatedResult>(result);

        Assert.Single(context.Users);

        var savedUser =
            await context.Users.SingleAsync();

        Assert.NotEqual(
            dto.Password,
            savedUser.PasswordHash);
    }

    [Fact]
    public async Task Login_CorrectCredentials_ReturnsOk()
    {
        using var context = CreateContext();

        await AddUser(
            context,
            "wayne@test.co.za",
            "Organiser");

        var session = CreateSession();

        var controller =
            new AuthController(
                context,
                new PasswordHasher<User>());

        AttachSession(
            controller,
            session);

        var dto = new LoginDto
        {
            Email = "wayne@test.co.za",
            Password = "RaceDay123!"
        };

        var result =
            await controller.Login(dto);

        Assert.IsType<OkObjectResult>(result);

        Assert.NotNull(
            session.GetInt32("UserId"));

        Assert.Equal(
            "Organiser",
            session.GetString("Role"));
    }

    [Fact]
    public async Task Login_WrongPassword_ReturnsUnauthorized()
    {
        using var context = CreateContext();

        await AddUser(
            context,
            "wayne@test.co.za",
            "Organiser");

        var controller =
            new AuthController(
                context,
                new PasswordHasher<User>());

        AttachSession(
            controller,
            CreateSession());

        var dto = new LoginDto
        {
            Email = "wayne@test.co.za",
            Password = "WrongPassword"
        };

        var result =
            await controller.Login(dto);

        Assert.IsType<UnauthorizedObjectResult>(
            result);
    }

    [Fact]
    public async Task Profile_NotLoggedIn_ReturnsUnauthorized()
    {
        using var context = CreateContext();

        var controller =
            new ProfileController(context);

        AttachSession(
            controller,
            CreateSession());

        var result =
            await controller.GetProfile();

        Assert.IsType<UnauthorizedObjectResult>(
            result);
    }

    [Fact]
    public async Task Organiser_CanCreateEvent()
    {
        using var context = CreateContext();

        var organiser =
            await AddUser(
                context,
                "organiser@test.co.za",
                "Organiser");

        var controller =
            new EventsController(context);

        AttachSession(
            controller,
            CreateSession(
                organiser.UserId,
                "Organiser"));

        var dto = new CreateEventDto
        {
            Name = "Pretoria City Run",
            Description = "10km running event",
            EventDate =
                DateTime.UtcNow.AddDays(30),
            Location = "Pretoria",
            Distance = 10,
            EventType = "Run"
        };

        var result =
            await controller.CreateEvent(dto);

        Assert.IsType<CreatedAtActionResult>(
            result);

        Assert.Single(context.Events);
    }

    [Fact]
    public async Task Participant_CannotCreateEvent()
    {
        using var context = CreateContext();

        var participant =
            await AddUser(
                context,
                "participant@test.co.za",
                "Participant");

        var controller =
            new EventsController(context);

        AttachSession(
            controller,
            CreateSession(
                participant.UserId,
                "Participant"));

        var dto = new CreateEventDto
        {
            Name = "Pretoria City Run",
            Description = "10km running event",
            EventDate =
                DateTime.UtcNow.AddDays(30),
            Location = "Pretoria",
            Distance = 10,
            EventType = "Run"
        };

        var result =
            await controller.CreateEvent(dto);

        var objectResult =
            Assert.IsType<ObjectResult>(result);

        Assert.Equal(
            StatusCodes.Status403Forbidden,
            objectResult.StatusCode);
    }

    [Fact]
    public async Task Participant_CanEnrolInEvent()
    {
        using var context = CreateContext();

        var organiser =
            await AddUser(
                context,
                "organiser@test.co.za",
                "Organiser");

        var participant =
            await AddUser(
                context,
                "participant@test.co.za",
                "Participant");

        var raceEvent = new RaceEvent
        {
            OrganiserId = organiser.UserId,
            Name = "Pretoria City Run",
            Description = "10km running event",
            EventDate =
                DateTime.UtcNow.AddDays(30),
            Location = "Pretoria",
            Distance = 10,
            EventType = "Run"
        };

        var category = new Category
        {
            Name = "10km",
            CategoryType = "Distance",
            Description = "Ten kilometre race"
        };

        context.Events.Add(raceEvent);
        context.Categories.Add(category);

        await context.SaveChangesAsync();

        var eventCategory =
            new EventCategory
            {
                EventId = raceEvent.EventId,
                CategoryId = category.CategoryId
            };

        context.EventCategories.Add(
            eventCategory);

        await context.SaveChangesAsync();

        var controller =
            new EnrolmentsController(context);

        AttachSession(
            controller,
            CreateSession(
                participant.UserId,
                "Participant"));

        var dto = new CreateEnrolmentDto
        {
            EventCategoryId =
                eventCategory.EventCategoryId
        };

        var result =
            await controller.CreateEnrolment(
                raceEvent.EventId,
                dto);

        Assert.IsType<CreatedResult>(result);

        Assert.Single(
            context.Enrolments);
    }

    [Fact]
    public async Task Organiser_CannotUseParticipantEnrolmentEndpoint()
    {
        using var context = CreateContext();

        var organiser =
            await AddUser(
                context,
                "organiser@test.co.za",
                "Organiser");

        var controller =
            new EnrolmentsController(context);

        AttachSession(
            controller,
            CreateSession(
                organiser.UserId,
                "Organiser"));

        var dto = new CreateEnrolmentDto
        {
            EventCategoryId = 1
        };

        var result =
            await controller.CreateEnrolment(
                1,
                dto);

        var objectResult =
            Assert.IsType<ObjectResult>(result);

        Assert.Equal(
            StatusCodes.Status403Forbidden,
            objectResult.StatusCode);
    }

    [Fact]
    public async Task Enrolment_IsSavedToDatabase()
    {
        using var context = CreateContext();

        var organiser =
            await AddUser(
                context,
                "organiser@test.co.za",
                "Organiser");

        var participant =
            await AddUser(
                context,
                "participant@test.co.za",
                "Participant");

        var raceEvent = new RaceEvent
        {
            OrganiserId = organiser.UserId,
            Name = "Joburg Community Run",
            Description = "Community race",
            EventDate =
                DateTime.UtcNow.AddDays(20),
            Location = "Johannesburg",
            Distance = 5,
            EventType = "Run"
        };

        var category = new Category
        {
            Name = "5km",
            CategoryType = "Distance",
            Description = "Five kilometre race"
        };

        context.Events.Add(raceEvent);
        context.Categories.Add(category);

        await context.SaveChangesAsync();

        var eventCategory =
            new EventCategory
            {
                EventId = raceEvent.EventId,
                CategoryId = category.CategoryId
            };

        context.EventCategories.Add(
            eventCategory);

        await context.SaveChangesAsync();

        var controller =
            new EnrolmentsController(context);

        AttachSession(
            controller,
            CreateSession(
                participant.UserId,
                "Participant"));

        await controller.CreateEnrolment(
            raceEvent.EventId,
            new CreateEnrolmentDto
            {
                EventCategoryId =
                    eventCategory.EventCategoryId
            });

        var enrolment =
            await context.Enrolments
                .FirstOrDefaultAsync(
                    e => e.ParticipantId ==
                        participant.UserId);

        Assert.NotNull(enrolment);

        Assert.Equal(
            eventCategory.EventCategoryId,
            enrolment.EventCategoryId);

        Assert.Equal(
            "Confirmed",
            enrolment.Status);
    }
}
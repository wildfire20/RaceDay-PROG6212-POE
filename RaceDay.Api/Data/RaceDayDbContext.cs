using Microsoft.EntityFrameworkCore;
using RaceDay.Api.Models;

namespace RaceDay.Api.Data;

public class RaceDayDbContext : DbContext
{
    public RaceDayDbContext(DbContextOptions<RaceDayDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<EventCategory> EventCategories => Set<EventCategory>();
    public DbSet<Enrolment> Enrolments => Set<Enrolment>();
    public DbSet<Result> Results => Set<Result>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .ToTable(t => t.HasCheckConstraint(
                "CK_Users_Role",
                "[Role] IN ('Organiser', 'Participant')"));

        modelBuilder.Entity<Event>()
            .ToTable(t =>
            {
                t.HasCheckConstraint(
                    "CK_Events_Distance",
                    "[Distance] > 0");

                t.HasCheckConstraint(
                    "CK_Events_EventType",
                    "[EventType] IN ('Run', 'Walk', 'Cycle')");
            });

        modelBuilder.Entity<Category>()
            .HasIndex(c => new { c.Name, c.CategoryType })
            .IsUnique();

        modelBuilder.Entity<EventCategory>()
            .HasIndex(ec => new { ec.EventId, ec.CategoryId })
            .IsUnique();

        modelBuilder.Entity<Enrolment>()
            .HasIndex(e => new
            {
                e.ParticipantId,
                e.EventCategoryId
            })
            .IsUnique();

        modelBuilder.Entity<Enrolment>()
            .ToTable(t => t.HasCheckConstraint(
                "CK_Enrolments_Status",
                "[Status] IN ('Pending', 'Confirmed', 'Cancelled')"));

        modelBuilder.Entity<Result>()
            .HasIndex(r => r.EnrolmentId)
            .IsUnique();

        modelBuilder.Entity<Result>()
            .ToTable(t => t.HasCheckConstraint(
                "CK_Results_FinishingPosition",
                "[FinishingPosition] > 0"));

        modelBuilder.Entity<User>()
            .HasMany(u => u.OrganisedEvents)
            .WithOne(e => e.Organiser)
            .HasForeignKey(e => e.OrganiserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<User>()
            .HasMany(u => u.Enrolments)
            .WithOne(e => e.Participant)
            .HasForeignKey(e => e.ParticipantId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Event>()
            .HasMany(e => e.EventCategories)
            .WithOne(ec => ec.Event)
            .HasForeignKey(ec => ec.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Category>()
            .HasMany(c => c.EventCategories)
            .WithOne(ec => ec.Category)
            .HasForeignKey(ec => ec.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<EventCategory>()
            .HasMany(ec => ec.Enrolments)
            .WithOne(e => e.EventCategory)
            .HasForeignKey(e => e.EventCategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Enrolment>()
            .HasOne(e => e.Result)
            .WithOne(r => r.Enrolment)
            .HasForeignKey<Result>(r => r.EnrolmentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RaceDay.Api.Data;
using RaceDay.Api.Models;

var builder = WebApplication.CreateBuilder(
    new WebApplicationOptions
    {
        Args = args,
        WebRootPath = "wwwroot"
    });

builder.Services.AddControllers();

builder.Services.AddDbContext<RaceDayDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("RaceDayConnection")));

builder.Services.AddDistributedMemoryCache();

builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.Name = ".RaceDay.Session";
});

builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseSession();

app.UseStaticFiles();

app.MapControllers();

app.MapGet("/", async context =>
{
    string indexPath = Path.Combine(
        app.Environment.WebRootPath!,
        "index.html");

    if (!File.Exists(indexPath))
    {
        context.Response.StatusCode = 500;

        await context.Response.WriteAsync(
            $"RaceDay frontend file was not found at: {indexPath}");

        return;
    }

    context.Response.ContentType = "text/html";

    await context.Response.SendFileAsync(indexPath);
});

app.Run();

public partial class Program
{
}
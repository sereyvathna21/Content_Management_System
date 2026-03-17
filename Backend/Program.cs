using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Services;
using Backend.Models;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add controllers (API endpoints) so the app has routes to serve
builder.Services.AddControllers();

// builder.Services.AddApplicationServices(builder.Configuration); // if you have an extension
// Register EmailService
builder.Services.AddScoped<EmailService>();

// Register BCrypt for password hashing
builder.Services.AddScoped<BCrypt.Net.BCrypt>();

var app = builder.Build();

// Configure minimal request pipeline and map controllers
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.MapControllers();

// Seed admin user
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    if (!context.Users.Any(u => u.Email == "admin21@gmail.com"))
    {
        context.Users.Add(new User
        {
            Email = "admin21@gmail.com",
            Password = BCrypt.Net.BCrypt.HashPassword("Admin@21"),
            IsEmailVerified = true
        });
        context.SaveChanges();
    }
}

app.Run();
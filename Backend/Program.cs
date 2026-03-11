using Npgsql;
using Microsoft.EntityFrameworkCore;
using Backend.Data;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add controllers (API endpoints) so the app has routes to serve
builder.Services.AddControllers();

// builder.Services.AddApplicationServices(builder.Configuration); // if you have an extension
var app = builder.Build();

// Configure minimal request pipeline and map controllers
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.MapControllers();

app.Run();
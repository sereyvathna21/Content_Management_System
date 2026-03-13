using System.Text;
using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// ── Database ──────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── Identity ──────────────────────────────────────────────────────────────────
builder.Services.AddIdentity<AppUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 8;
    options.User.RequireUniqueEmail = true;
    options.SignIn.RequireConfirmedEmail = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// ── JWT Authentication ────────────────────────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero,
    };
});

builder.Services.AddAuthorization();

// ── CORS ──────────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        var allowedOrigins = builder.Configuration
            .GetSection("Frontend:AllowedOrigins")
            .Get<string[]>();

        if (allowedOrigins == null || allowedOrigins.Length == 0)
        {
            allowedOrigins =
            [
                builder.Configuration["Frontend:BaseUrl"] ?? "http://localhost:3000",
                "http://localhost:3001",
            ];
        }

        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ── Application Services ──────────────────────────────────────────────────────
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<EmailService>();

// ── Controllers + Swagger ─────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ── Seed Roles ────────────────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    foreach (var role in new[] { "Admin", "User" })
    {
        if (!await roleManager.RoleExistsAsync(role))
            await roleManager.CreateAsync(new IdentityRole(role));
    }
}

// ── Seed Admin Account ────────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
    var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();

    var adminEmail = config["Seed:AdminEmail"] ?? "admin@nspc.gov.kh";
    var adminPassword = config["Seed:AdminPassword"] ?? "Admin@123456";
    var adminName = config["Seed:AdminName"] ?? "System Administrator";

    var existingAdmin = await userManager.FindByEmailAsync(adminEmail);
    if (existingAdmin == null)
    {
        var admin = new AppUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            DisplayName = adminName,
            EmailConfirmed = true,
        };

        var result = await userManager.CreateAsync(admin, adminPassword);
        if (result.Succeeded)
            await userManager.AddToRoleAsync(admin, "Admin");
    }
    else
    {
        // Ensure seeded admin remains usable in local/dev even if account existed earlier.
        if (!existingAdmin.EmailConfirmed)
        {
            existingAdmin.EmailConfirmed = true;
            await userManager.UpdateAsync(existingAdmin);
        }

        if (!await userManager.IsInRoleAsync(existingAdmin, "Admin"))
            await userManager.AddToRoleAsync(existingAdmin, "Admin");

        if (app.Environment.IsDevelopment())
        {
            var removePasswordResult = await userManager.RemovePasswordAsync(existingAdmin);
            if (removePasswordResult.Succeeded)
                await userManager.AddPasswordAsync(existingAdmin, adminPassword);
        }
    }
}

// Always return JSON for unhandled exceptions — never plain text
app.UseExceptionHandler(errApp => errApp.Run(async ctx =>
{
    ctx.Response.StatusCode = 500;
    ctx.Response.ContentType = "application/json";
    await ctx.Response.WriteAsJsonAsync(new { message = "An internal server error occurred." });
}));

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
using System.Text;
using System.Threading.Tasks;
using Backend.Data;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using Backend.Hubs;
using System.Threading.RateLimiting;
using System.IO;
using Microsoft.Extensions.FileProviders;
using Microsoft.Net.Http.Headers;
using Microsoft.AspNetCore.StaticFiles;


AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

var webRoot = builder.Environment.WebRootPath;
if (string.IsNullOrWhiteSpace(webRoot) || !Directory.Exists(webRoot))
{
    var fallbackWebRoot = Path.Combine(builder.Environment.ContentRootPath, "Backend", "wwwroot");
    if (Directory.Exists(fallbackWebRoot))
    {
        builder.WebHost.UseWebRoot(fallbackWebRoot);
    }
}

// ---------- Database ----------
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ---------- Services ----------
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddAutoMapper(typeof(Program));

// ---------- Rate Limiting ----------
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter("Global",
            partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            }));

    // Applying auth limiter for sensitive endpoints
    options.AddFixedWindowLimiter("Auth", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 10;
        opt.QueueLimit = 0;
    });
});

// ---------- JWT Authentication ----------
var jwtSecret = builder.Configuration["Jwt:Secret"]!;
var jwtIssuer = builder.Configuration["Jwt:Issuer"]!;
var jwtAudience = builder.Configuration["Jwt:Audience"]!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            RoleClaimType = ClaimTypes.Role,
            NameClaimType = ClaimTypes.Name
        };
        // Explicitly unconfigured Custom cookie extraction to enforce Authorization: Bearer header to prevent CSRF.
    });

builder.Services.AddAuthorization();

// SignalR
builder.Services.AddSignalR();

// ---------- CORS ----------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        // Allow common dev frontend origins (explicit list to support credentials)
        policy.WithOrigins(
                builder.Configuration["App:FrontendUrl"] ?? "http://localhost:3000",
                "http://localhost:3001",
                "https://localhost:3001",
                "https://localhost:7177"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ---------- Controllers & OpenAPI ----------
builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// ---------- Middleware pipeline ----------
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/openapi/v1.json", "NSPC CMS API v1"));
}

static void PreparePdfResponse(StaticFileResponseContext context)
{
    var extension = Path.GetExtension(context.File.Name);
    if (!string.Equals(extension, ".pdf", StringComparison.OrdinalIgnoreCase))
    {
        return;
    }

    context.Context.Response.ContentType = "application/pdf";
    context.Context.Response.Headers[HeaderNames.ContentDisposition] = "inline";
    context.Context.Response.Headers[HeaderNames.XContentTypeOptions] = "nosniff";
}

app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = PreparePdfResponse
});

var publicRoot = Path.Combine(app.Environment.ContentRootPath, "public");
if (!Directory.Exists(publicRoot))
{
    var fallbackPublicRoot = Path.Combine(app.Environment.ContentRootPath, "Backend", "public");
    if (Directory.Exists(fallbackPublicRoot))
    {
        publicRoot = fallbackPublicRoot;
    }
}

if (Directory.Exists(publicRoot))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(publicRoot),
        OnPrepareResponse = PreparePdfResponse
    });
}

app.UseCors("AllowFrontend");

app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
// map SignalR hubs
app.MapHub<ContactHub>("/hubs/contact");
app.Run();

using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Backend.Data;
using Backend.Services;
using Backend.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using Backend.Hubs;
using System.Threading.RateLimiting;
using System.IO;
using Microsoft.Extensions.FileProviders;
using Microsoft.Net.Http.Headers;
using Microsoft.AspNetCore.StaticFiles;
using System.Linq;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Http;


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
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<ISecurityAuditService, SecurityAuditService>();
builder.Services.AddHostedService<NotificationRetentionService>();
builder.Services.AddAutoMapper((System.Action<AutoMapper.IMapperConfigurationExpression>?)null, System.AppDomain.CurrentDomain.GetAssemblies());
builder.Services.AddMemoryCache();
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("RedisConnection");
    options.InstanceName = "NspcCms_";
});
builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();

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

    options.OnRejected = (context, token) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        return ValueTask.CompletedTask;
    };

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

var configuredOrigins = builder.Configuration.GetSection("App:FrontendUrls").Get<string[]>();
var singleOrigin = builder.Configuration["App:FrontendUrl"];
var allowedOrigins = (configuredOrigins ?? Array.Empty<string>())
    .Concat(string.IsNullOrWhiteSpace(singleOrigin) ? Array.Empty<string>() : new[] { singleOrigin })
    .Concat(new[]
    {
        "http://localhost:3000",
        "http://localhost:3001",
        "https://localhost:3001",
        "https://localhost:7177"
    })
    .Where(origin => !string.IsNullOrWhiteSpace(origin))
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray();

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
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var cache = context.HttpContext.RequestServices.GetRequiredService<IDistributedCache>();
                var userIdClaim = context.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var iatClaim = context.Principal?.FindFirst("iat")?.Value ??
                               context.Principal?.FindFirst(Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames.Iat)?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(iatClaim))
                {
                    return;
                }

                if (!long.TryParse(iatClaim, out var iatSeconds))
                {
                    return;
                }

                var tokenIssuedAt = DateTimeOffset.FromUnixTimeSeconds(iatSeconds).UtcDateTime;
                var cacheKey = $"user_revocation_time_{userIdClaim}";

                DateTime? revocationTime = null;
                var cachedTimeStr = await cache.GetStringAsync(cacheKey);

                if (!string.IsNullOrEmpty(cachedTimeStr))
                {
                    revocationTime = JsonSerializer.Deserialize<DateTime>(cachedTimeStr);
                }
                else if (int.TryParse(userIdClaim, out var userId))
                {
                    var db = context.HttpContext.RequestServices.GetRequiredService<ApplicationDbContext>();
                    var user = await db.Users.FindAsync(userId);
                    if (user != null)
                    {
                        revocationTime = user.TokenValidAfter ?? DateTime.MinValue;
                        await cache.SetStringAsync(
                            cacheKey,
                            JsonSerializer.Serialize(revocationTime),
                            new DistributedCacheEntryOptions
                            {
                                AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(1)
                            });
                    }
                }

                if (revocationTime.HasValue && tokenIssuedAt < revocationTime.Value)
                {
                    context.Fail("Token has been revoked because user profile or role was modified.");
                }
            }
        };
        // Explicitly unconfigured Custom cookie extraction to enforce Authorization: Bearer header to prevent CSRF.
    });

builder.Services.AddAuthorization();

// SignalR
builder.Services.AddSignalR();

// ---------- CORS ----------
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ---------- Controllers & OpenAPI ----------
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddOpenApi();

var app = builder.Build();

// ---------- Middleware pipeline ----------
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/openapi/v1.json", "NSPC CMS API v1"));
}

app.UseCors();

void PreparePdfResponse(StaticFileResponseContext context)
{
    var extension = Path.GetExtension(context.File.Name);
    if (!string.Equals(extension, ".pdf", StringComparison.OrdinalIgnoreCase))
    {
        return;
    }

    var origin = context.Context.Request.Headers[HeaderNames.Origin].ToString();
    if (!string.IsNullOrWhiteSpace(origin) &&
        allowedOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase))
    {
        context.Context.Response.Headers[HeaderNames.AccessControlAllowOrigin] = origin;
        context.Context.Response.Headers[HeaderNames.AccessControlAllowCredentials] = "true";
        context.Context.Response.Headers[HeaderNames.Vary] = "Origin";
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

app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<NotificationHub>("/notificationHub");
app.MapHub<ContactHub>("/hubs/contact");

// Development-only seeding: create Roles and a dev admin if missing
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    if (app.Environment.IsDevelopment())
    {
        try
        {
            // Ensure database schema is up-to-date in development so local
            // containers get the expected tables (permissions, role permissions, etc.).
            var db = services.GetRequiredService<ApplicationDbContext>();
            await db.Database.MigrateAsync();

            await Backend.Services.DevSeeder.SeedAsync(services);
        }
        catch (Exception ex)
        {
            var logger = services.GetService<ILoggerFactory>()?.CreateLogger("DevSeeder");
            logger?.LogError(ex, "Dev seeding failed");
        }
    }
}

await app.RunAsync();

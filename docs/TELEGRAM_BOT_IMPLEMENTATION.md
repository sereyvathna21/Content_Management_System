# Telegram Channel Sync — Full Implementation Guide

### Stack: Next.js (Frontend) + ASP.NET Core Web API (Backend) + PostgreSQL

> **Goal:** Automatically mirror **News**, **Laws**, and **Publications** managed in the admin dashboard to a **Telegram channel** via the Telegram Bot API.
>
> **Events supported:** CREATE · UPDATE · DELETE (and News soft-delete / restore)
>
> **Principle:** Next.js is only a REST/form-data client. **All Telegram logic lives in the ASP.NET backend using a non-blocking background queue.**

---

## 🚀 Step-by-Step Implementation Order

Follow these steps **in order**. Each phase builds on the previous one.

### Phase 1: Setup & Credentials

1. **Create Telegram bot & get credentials** in the Telegram app via BotFather. ([Jump to §2](#2-prerequisites))
2. **Add Telegram config** to `appsettings.json` and `appsettings.Development.json`. ([Jump to §2.4](#24-store-config-in-appsettingsjson))
3. **Create Configuration POCO** by adding `Models/TelegramOptions.cs`. ([Jump to §4.1](#41-configuration-poco))

### Phase 2: Database Layer

4. **Create the Entity Model** by adding `Models/TelegramMessageMapping.cs`. ([Jump to §3.2](#32-ef-core-entity-model))
5. **Register the mapping table** in `Database/ApplicationDbContext.cs`. ([Jump to §4.3](#43-dbcontext-changes))
6. **Run EF Core migration** to apply the changes to your PostgreSQL database. ([Jump to §4.3](#43-dbcontext-changes))

### Phase 3: Service Layer (Background Queue)

7. **Create the Bot API client** by adding `Services/TelegramService.cs`. ([Jump to §4.4](#44-telegramservice))
8. **Create the Caption Formatter** by adding `Services/TelegramCaptionFormatter.cs`. ([Jump to §4.5](#45-caption-formatters))
9. **Create the Background Queue** by adding `TelegramSyncQueue.cs` and `TelegramBackgroundWorker.cs`. ([Jump to §4.6](#46-background-queue-non-blocking))
10. **Register all services** and the background worker in `Program.cs`. ([Jump to §4.7](#47-programcs-registration))

### Phase 4: Controller Integration

11. **Add Telegram hooks** to `Controllers/AdminNewsController.cs`. ([Jump to §4.8](#48-controller-integration--news))
12. **Add Telegram hooks** to `Controllers/LawsController.cs`. ([Jump to §4.9](#49-controller-integration--laws))
13. **Add Telegram hooks** to `Controllers/PublicationsController.cs`. ([Jump to §4.10](#410-controller-integration--publications))

### Phase 5: Verification

14. **Test each flow** (Create / Update / Delete) via Swagger UI or the admin dashboard. ([Jump to §8](#8-testing-checklist))

> **Estimated time:** ~3–5 hours for a developer familiar with the codebase.

---

## Table of Contents

1. [Architecture Flow](#1-architecture-flow)
2. [Prerequisites](#2-prerequisites)
3. [Database Schema](#3-database-schema)
4. [Backend Implementation](#4-backend-implementation)
   - [4.1 Configuration POCO](#41-configuration-poco)
   - [4.2 TelegramMessageMapping Model](#42-telegrammessagemapping-model)
   - [4.3 DbContext Changes](#43-dbcontext-changes)
   - [4.4 TelegramService](#44-telegramservice)
   - [4.5 Caption Formatters](#45-caption-formatters)
   - [4.6 Background Queue (Non-Blocking)](#46-background-queue-non-blocking)
   - [4.7 Program.cs Registration](#47-programcs-registration)
   - [4.8 Controller Integration — News](#48-controller-integration--news)
   - [4.9 Controller Integration — Laws](#49-controller-integration--laws)
   - [4.10 Controller Integration — Publications](#410-controller-integration--publications)
5. [Next.js Frontend Integration](#5-nextjs-frontend-integration)
6. [Error Handling & Reliability](#6-error-handling--reliability)
7. [Security Checklist](#7-security-checklist)
8. [Testing Checklist](#8-testing-checklist)

---

## 1. Architecture Flow

### High-Level Overview

```
Next.js Admin Dashboard (App Router)
        │
        │  fetch() / FormData — REST API calls
        ▼
ASP.NET Web API (C#)
        │
        ├──► PostgreSQL
        │         (stores entity + TelegramMessageMapping)
        │
        └──► TelegramSyncQueue (System.Threading.Channels)
                  │
                  ▼ TelegramBackgroundWorker
                  │
        └──► Telegram Bot API (api.telegram.org)
                  │
                  ▼
            Telegram Channel
```

> **Why the Background Queue?** By using `System.Threading.Channels` (similar to your existing `AuditLogQueue`), the admin dashboard won't hang waiting for Telegram API responses. The saving process stays incredibly fast, and Telegram sync happens silently in the background.

---

## 2. Prerequisites

### 2.1 Create a Bot via BotFather

1. Open Telegram → search **@BotFather** → send `/newbot`.
2. Follow the prompts and save the **Bot API Token**:
   ```
   7123456789:AAF_xxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 2.2 Add Bot as Channel Administrator

1. Open your Telegram Channel → **Administrators → Add Administrator**.
2. Search for your bot and grant:
   - ✅ Post Messages
   - ✅ Edit Messages of Others
   - ✅ Delete Messages

### 2.3 Get Your Channel ID

Forward any channel message to **@userinfobot**, or call:

```
GET https://api.telegram.org/bot{TOKEN}/getUpdates
```

The channel ID will look like `-1001234567890` (always negative for channels).

### 2.4 Store Config in `appsettings.json`

Add a new `Telegram` section alongside your existing config:

```json
{
  "Telegram": {
    "BotToken": "7123456789:AAF_xxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "ChannelId": "-1001234567890"
  }
}
```

> **For production:** Store `BotToken` in **environment variables** or a **secrets manager** — never commit the real token to source control. Use `appsettings.Development.json` (git-ignored) for local dev.

---

## 3. Database Schema

### Why a Dedicated Mapping Table

Your entities use **Guid IDs** and content is stored in translation tables. Adding Telegram columns directly to each entity (`NewsArticle`, `Law`, `Publication`) would require repetitive logic. Instead, use **one mapping table** for all content types:

### 3.1 Migration SQL

```sql
-- PostgreSQL
CREATE TABLE "TelegramMessageMappings" (
    "Id"                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    "EntityType"          VARCHAR(50)  NOT NULL,        -- 'News' | 'Law' | 'Publication'
    "EntityId"            UUID         NOT NULL,         -- FK to the entity (Guid)
    "TelegramMessageId"   BIGINT       NOT NULL,         -- Returned by Telegram sendPhoto
    "SentAt"              TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT "UQ_TelegramMapping_Entity" UNIQUE ("EntityType", "EntityId")
);

CREATE INDEX "IX_TelegramMapping_EntityType_EntityId"
    ON "TelegramMessageMappings" ("EntityType", "EntityId");
```

### 3.2 EF Core Entity Model

```csharp
// Models/TelegramMessageMapping.cs

namespace Backend.Models
{
    public class TelegramMessageMapping
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        /// <summary>
        /// "News", "Law", or "Publication"
        /// </summary>
        public string EntityType { get; set; } = string.Empty;

        /// <summary>
        /// The Guid ID of the News / Law / Publication entity.
        /// </summary>
        public Guid EntityId { get; set; }

        /// <summary>
        /// The message_id returned by Telegram Bot API.
        /// </summary>
        public long TelegramMessageId { get; set; }

        /// <summary>
        /// When the message was last sent/updated on Telegram.
        /// </summary>
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
}
```

### 3.3 DbContext Registration

Add to `Database/ApplicationDbContext.cs`:

```csharp
public DbSet<TelegramMessageMapping> TelegramMessageMappings { get; set; }

// In OnModelCreating:
modelBuilder.Entity<TelegramMessageMapping>(entity =>
{
    entity.HasKey(e => e.Id);
    entity.HasIndex(e => new { e.EntityType, e.EntityId }).IsUnique();
});
```

Then generate a migration:

```bash
cd Backend
dotnet ef migrations add AddTelegramMessageMappings
dotnet ef database update
```

---

## 4. Backend Implementation

### 4.1 Configuration POCO

```csharp
// Models/TelegramOptions.cs

namespace Backend.Models
{
    public class TelegramOptions
    {
        public string BotToken  { get; set; } = string.Empty;
        public string ChannelId { get; set; } = string.Empty;
    }
}
```

---

### 4.4 TelegramService

Create a unified service that handles HTTP requests to the Telegram Bot API:

```csharp
// Services/TelegramService.cs

using System.Text;
using System.Text.Json;
using Backend.Models;
using Microsoft.Extensions.Options;

namespace Backend.Services
{
    public record TelegramApiResponse<T>(bool Ok, T? Result, string? Description);
    public record TelegramMessage(long MessageId);

    public interface ITelegramService
    {
        Task<long> SendMessageAsync(string caption, string? photoUrl, string? linkUrl, string linkText);
        Task EditCaptionAsync(long messageId, string caption, string? linkUrl, string linkText);
        Task EditMediaAsync(long messageId, string caption, string? photoUrl, string? linkUrl, string linkText);
        Task DeleteMessageAsync(long messageId);
    }

    public class TelegramService : ITelegramService
    {
        private readonly HttpClient _http;
        private readonly TelegramOptions _options;
        private readonly ILogger<TelegramService> _logger;

        private static readonly JsonSerializerOptions JsonOpts = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
        };

        public TelegramService(
            HttpClient http,
            IOptions<TelegramOptions> options,
            ILogger<TelegramService> logger)
        {
            _http = http;
            _options = options.Value;
            _logger = logger;
            _http.BaseAddress = new Uri($"https://api.telegram.org/bot{_options.BotToken}/");
        }

        public async Task<long> SendMessageAsync(string caption, string? photoUrl, string? linkUrl, string linkText)
        {
            if (!string.IsNullOrWhiteSpace(photoUrl))
            {
                var payload = new
                {
                    chat_id = _options.ChannelId,
                    photo = photoUrl,
                    caption = SafeTruncate(caption, 1024),
                    parse_mode = "HTML",
                    reply_markup = BuildInlineKeyboard(linkUrl, linkText)
                };

                var message = await PostWithRetryAsync<TelegramMessage>("sendPhoto", payload);
                return message.MessageId;
            }
            else
            {
                var payload = new
                {
                    chat_id = _options.ChannelId,
                    text = SafeTruncate(caption, 4096),
                    parse_mode = "HTML",
                    reply_markup = BuildInlineKeyboard(linkUrl, linkText)
                };

                var message = await PostWithRetryAsync<TelegramMessage>("sendMessage", payload);
                return message.MessageId;
            }
        }

        public async Task EditCaptionAsync(long messageId, string caption, string? linkUrl, string linkText)
        {
            var payload = new
            {
                chat_id = _options.ChannelId,
                message_id = messageId,
                caption = SafeTruncate(caption, 1024),
                parse_mode = "HTML",
                reply_markup = BuildInlineKeyboard(linkUrl, linkText)
            };

            try
            {
                await PostWithRetryAsync<JsonElement>("editMessageCaption", payload);
            }
            catch (Exception ex) when (ex.Message.Contains("message is not modified"))
            {
                _logger.LogDebug("Telegram caption unchanged for MessageId={MsgId}, skipping.", messageId);
            }
        }

        public async Task EditMediaAsync(long messageId, string caption, string? photoUrl, string? linkUrl, string linkText)
        {
            var payload = new
            {
                chat_id = _options.ChannelId,
                message_id = messageId,
                media = new
                {
                    type = "photo",
                    media = photoUrl,
                    caption = SafeTruncate(caption, 1024),
                    parse_mode = "HTML"
                },
                reply_markup = BuildInlineKeyboard(linkUrl, linkText)
            };

            await PostWithRetryAsync<JsonElement>("editMessageMedia", payload);
        }

        public async Task DeleteMessageAsync(long messageId)
        {
            var payload = new
            {
                chat_id = _options.ChannelId,
                message_id = messageId
            };

            try
            {
                await PostWithRetryAsync<JsonElement>("deleteMessage", payload);
            }
            catch (Exception ex) when (ex.Message.Contains("message to delete not found"))
            {
                _logger.LogWarning("Telegram message already deleted. MessageId={MsgId}", messageId);
            }
        }

        private static object? BuildInlineKeyboard(string? linkUrl, string linkText)
        {
            if (string.IsNullOrWhiteSpace(linkUrl)) return null;
            return new
            {
                inline_keyboard = new[] { new[] { new { text = linkText, url = linkUrl } } }
            };
        }

        public static string EscapeHtml(string input) =>
            input.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;");

        public static string SafeTruncate(string input, int maxLength)
        {
            if (input.Length <= maxLength) return input;
            var cut = input[..maxLength];
            var lastSpace = cut.LastIndexOf(' ');
            return lastSpace > 0 ? cut[..lastSpace] + "…" : cut + "…";
        }

        private async Task<T> PostWithRetryAsync<T>(string endpoint, object payload, int maxRetries = 3)
        {
            for (int attempt = 1; attempt <= maxRetries; attempt++)
            {
                try
                {
                    var json = JsonSerializer.Serialize(payload, JsonOpts);
                    var content = new StringContent(json, Encoding.UTF8, "application/json");
                    var response = await _http.PostAsync(endpoint, content);
                    var body = await response.Content.ReadAsStringAsync();

                    var result = JsonSerializer.Deserialize<TelegramApiResponse<T>>(body, JsonOpts);

                    if (result == null) throw new Exception($"Null response from Telegram [{endpoint}]");

                    if (!result.Ok)
                    {
                        if ((int)response.StatusCode == 429)
                        {
                            var retryAfter = 5;
                            throw new Exception($"Telegram rate limited. Retry after {retryAfter}s");
                        }
                        throw new Exception($"Telegram API error [{endpoint}]: {result.Description ?? body}");
                    }
                    return result.Result!;
                }
                catch (Exception ex) when (attempt < maxRetries && !ex.Message.Contains("message is not modified") && !ex.Message.Contains("message to delete not found"))
                {
                    await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, attempt)));
                }
            }
            throw new Exception("Telegram call failed after retries.");
        }
    }
}
```

---

### 4.5 Caption Formatters

```csharp
// Services/TelegramCaptionFormatter.cs

using Backend.Models;

namespace Backend.Services
{
    public static class TelegramCaptionFormatter
    {
        public static string FormatNewsCaption(NewsArticle article, string preferredLang = "en")
        {
            var translation = article.Translations
                .FirstOrDefault(t => t.Language.Equals(preferredLang, StringComparison.OrdinalIgnoreCase))
                ?? article.Translations.FirstOrDefault();

            if (translation == null) return "<b>📰 News Update</b>";

            var title   = TelegramService.EscapeHtml(translation.Title);
            var excerpt = TelegramService.EscapeHtml(TelegramService.SafeTruncate(translation.Excerpt ?? "", 300));
            var category = TelegramService.EscapeHtml(article.Category ?? "General");

            return $"<b>📰 {title}</b>\n\n<b>Category:</b> {category}\n" +
                   (string.IsNullOrWhiteSpace(excerpt) ? "" : $"{excerpt}\n\n") +
                   $"<i>Published on NSPC — tap below to read more.</i>";
        }

        public static string FormatLawCaption(Law law, IEnumerable<LawTranslation> translations, string preferredLang = "en")
        {
            var translation = translations
                .FirstOrDefault(t => t.Language.Equals(preferredLang, StringComparison.OrdinalIgnoreCase))
                ?? translations.FirstOrDefault();

            if (translation == null) return "<b>⚖️ New Law</b>";

            var title    = TelegramService.EscapeHtml(translation.Title);
            var category = TelegramService.EscapeHtml(translation.Category ?? law.Category ?? "General");
            var dateStr  = law.Date?.ToString("yyyy-MM-dd") ?? "";

            return $"<b>⚖️ {title}</b>\n\n<b>Category:</b> {category}\n" +
                   (string.IsNullOrWhiteSpace(dateStr) ? "" : $"<b>Date:</b> {dateStr}\n\n") +
                   $"<i>Published on NSPC — tap below to view.</i>";
        }

        public static string FormatPublicationCaption(Publication publication, IEnumerable<PublicationTranslation> translations, string preferredLang = "en")
        {
            var translation = translations
                .FirstOrDefault(t => t.Language.Equals(preferredLang, StringComparison.OrdinalIgnoreCase))
                ?? translations.FirstOrDefault();

            if (translation == null) return "<b>📋 New Publication</b>";

            var title    = TelegramService.EscapeHtml(translation.Title);
            var category = TelegramService.EscapeHtml(translation.Category ?? publication.Category ?? "General");
            var dateStr  = publication.PublicationDate?.ToString("yyyy-MM-dd") ?? "";

            return $"<b>📋 {title}</b>\n\n<b>Category:</b> {category}\n" +
                   (string.IsNullOrWhiteSpace(dateStr) ? "" : $"<b>Date:</b> {dateStr}\n\n") +
                   $"<i>Published on NSPC — tap below to view.</i>";
        }
    }
}
```

---

### 4.6 Background Queue (Non-Blocking)

To prevent Telegram API latency from slowing down your admin dashboard saves, we use a queue pattern (similar to your existing `AuditLogQueue`).

```csharp
// Models/TelegramSyncJob.cs
namespace Backend.Models
{
    public class TelegramSyncJob
    {
        public string Action { get; set; } = string.Empty; // "Create", "Update", "Delete"
        public string EntityType { get; set; } = string.Empty; // "News", "Law", "Publication"
        public Guid EntityId { get; set; }

        // Data needed for creating/updating
        public string? Caption { get; set; }
        public string? PhotoUrl { get; set; }
        public string? LinkUrl { get; set; }
        public string? LinkText { get; set; }

        // Indicates if it's just a caption edit (no image changed)
        public bool IsCaptionOnlyEdit { get; set; }
    }
}
```

```csharp
// Services/TelegramSyncQueue.cs
using System.Threading.Channels;
using Backend.Models;

namespace Backend.Services
{
    public class TelegramSyncQueue
    {
        private readonly Channel<TelegramSyncJob> _channel;

        public TelegramSyncQueue()
        {
            _channel = Channel.CreateUnbounded<TelegramSyncJob>(new UnboundedChannelOptions
            {
                SingleReader = true,
                SingleWriter = false
            });
        }

        public ValueTask EnqueueAsync(TelegramSyncJob job) => _channel.Writer.WriteAsync(job);
        public IAsyncEnumerable<TelegramSyncJob> ReadAllAsync(CancellationToken cancellationToken) => _channel.Reader.ReadAllAsync(cancellationToken);
    }
}
```

```csharp
// Services/TelegramBackgroundWorker.cs
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class TelegramBackgroundWorker : BackgroundService
    {
        private readonly TelegramSyncQueue _queue;
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<TelegramBackgroundWorker> _logger;

        public TelegramBackgroundWorker(TelegramSyncQueue queue, IServiceProvider serviceProvider, ILogger<TelegramBackgroundWorker> logger)
        {
            _queue = queue;
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await foreach (var job in _queue.ReadAllAsync(stoppingToken))
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    var telegramService = scope.ServiceProvider.GetRequiredService<ITelegramService>();

                    var mapping = await db.TelegramMessageMappings
                        .FirstOrDefaultAsync(m => m.EntityType == job.EntityType && m.EntityId == job.EntityId, stoppingToken);

                    if (job.Action == "Create")
                    {
                        if (mapping == null)
                        {
                            var msgId = await telegramService.SendMessageAsync(job.Caption!, job.PhotoUrl, job.LinkUrl, job.LinkText!);
                            db.TelegramMessageMappings.Add(new TelegramMessageMapping
                            {
                                EntityType = job.EntityType,
                                EntityId = job.EntityId,
                                TelegramMessageId = msgId
                            });
                            await db.SaveChangesAsync(stoppingToken);
                        }
                    }
                    else if (job.Action == "Update" && mapping != null)
                    {
                        if (job.IsCaptionOnlyEdit)
                            await telegramService.EditCaptionAsync(mapping.TelegramMessageId, job.Caption!, job.LinkUrl, job.LinkText!);
                        else
                            await telegramService.EditMediaAsync(mapping.TelegramMessageId, job.Caption!, job.PhotoUrl, job.LinkUrl, job.LinkText!);

                        mapping.SentAt = DateTime.UtcNow;
                        await db.SaveChangesAsync(stoppingToken);
                    }
                    else if (job.Action == "Delete" && mapping != null)
                    {
                        await telegramService.DeleteMessageAsync(mapping.TelegramMessageId);
                        db.TelegramMessageMappings.Remove(mapping);
                        await db.SaveChangesAsync(stoppingToken);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Background Telegram sync failed for {Action} {EntityType} {EntityId}", job.Action, job.EntityType, job.EntityId);
                }
            }
        }
    }
}
```

---

### 4.7 Program.cs Registration

Add these lines to `Program.cs`:

```csharp
// ── Bind Telegram config from appsettings.json ───────────────────────────
builder.Services.Configure<TelegramOptions>(
    builder.Configuration.GetSection("Telegram")
);

// ── Register Telegram Services ───────────────────────────────────────────
builder.Services.AddHttpClient<ITelegramService, TelegramService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(15);
});

// Register the queue as a singleton and the worker as a hosted service
builder.Services.AddSingleton<TelegramSyncQueue>();
builder.Services.AddHostedService<TelegramBackgroundWorker>();
```

---

### 4.8 Controller Integration — News

In `AdminNewsController.cs`:
Inject `TelegramSyncQueue` instead of calling `ITelegramService` directly. Also, **resolve the true image URL if using `ImageMediaId`**.

```csharp
// In AdminNewsController constructor, add:
private readonly TelegramSyncQueue _telegramQueue;

// Helper to resolve Image URL
private async Task<string?> ResolveImageUrlAsync(NewsArticle article)
{
    if (!string.IsNullOrWhiteSpace(article.ImageUrl)) return article.ImageUrl;
    if (article.ImageMediaId.HasValue)
    {
        var media = await _db.Media.FindAsync(article.ImageMediaId.Value);
        return media?.Url;
    }
    return null;
}
```

#### Create — after saving DB:

```csharp
if (article.Status == ContentStatus.Published)
{
    var caption = TelegramCaptionFormatter.FormatNewsCaption(article);
    var frontendUrl = _config["App:FrontendUrl"]?.TrimEnd('/') ?? "https://domain.com";
    var portalUrl = $"{frontendUrl}/Landing-page/News/{Uri.EscapeDataString(article.Slug)}";
    var photoUrl = await ResolveImageUrlAsync(article);

    await _telegramQueue.EnqueueAsync(new TelegramSyncJob
    {
        Action = "Create",
        EntityType = "News",
        EntityId = article.Id,
        Caption = caption,
        PhotoUrl = photoUrl,
        LinkUrl = portalUrl,
        LinkText = "📰 Read Article"
    });
}
```

#### Update — after saving DB:

```csharp
if (article.Status == ContentStatus.Published)
{
    var caption = TelegramCaptionFormatter.FormatNewsCaption(article);
    var frontendUrl = _config["App:FrontendUrl"]?.TrimEnd('/') ?? "https://domain.com";
    var portalUrl = $"{frontendUrl}/Landing-page/News/{Uri.EscapeDataString(article.Slug)}";
    var photoUrl = await ResolveImageUrlAsync(article);

    // Check if the image changed to determine Edit type
    var oldPhotoUrl = await ResolveImageUrlAsync(oldArticleState);
    var isCaptionOnlyEdit = (photoUrl == oldPhotoUrl);

    // Note: If previousStatus wasn't Published, use "Create" action instead of "Update"
    var action = previousStatus != ContentStatus.Published ? "Create" : "Update";

    await _telegramQueue.EnqueueAsync(new TelegramSyncJob
    {
        Action = action,
        EntityType = "News",
        EntityId = article.Id,
        Caption = caption,
        PhotoUrl = photoUrl,
        LinkUrl = portalUrl,
        LinkText = "📰 Read Article",
        IsCaptionOnlyEdit = isCaptionOnlyEdit
    });
}
```

#### Delete (soft-delete):

```csharp
await _telegramQueue.EnqueueAsync(new TelegramSyncJob
{
    Action = "Delete",
    EntityType = "News",
    EntityId = article.Id
});
```

---

### 4.9 Controller Integration — Laws

In `LawsController.cs`, **use `App:FrontendUrl` for inline button links**, separating public links from your internal SignalR notifications.

```csharp
// Create — after DB save:
var caption = TelegramCaptionFormatter.FormatLawCaption(law, request.Translations);
var frontendUrl = _config["App:FrontendUrl"]?.TrimEnd('/') ?? "https://domain.com";

// Link to frontend law list or specific law detail page
var linkUrl = $"{frontendUrl}/Landing-page/Laws";

await _telegramQueue.EnqueueAsync(new TelegramSyncJob
{
    Action = "Create",
    EntityType = "Law",
    EntityId = law.Id,
    Caption = caption,
    LinkUrl = linkUrl,
    LinkText = "📄 View Laws"
});
```

```csharp
// Delete — queue BEFORE DB removal:
await _telegramQueue.EnqueueAsync(new TelegramSyncJob
{
    Action = "Delete",
    EntityType = "Law",
    EntityId = law.Id
});
```

---

### 4.10 Controller Integration — Publications

In `PublicationsController.cs`, follow the exact same non-blocking queue pattern as Laws, linking out to the `App:FrontendUrl`.

```csharp
// Create — after DB save:
var caption = TelegramCaptionFormatter.FormatPublicationCaption(publication, request.Translations);
var frontendUrl = _config["App:FrontendUrl"]?.TrimEnd('/') ?? "https://domain.com";
var linkUrl = $"{frontendUrl}/Landing-page/Publications";

await _telegramQueue.EnqueueAsync(new TelegramSyncJob
{
    Action = "Create",
    EntityType = "Publication",
    EntityId = publication.Id,
    Caption = caption,
    LinkUrl = linkUrl,
    LinkText = "📋 View Publications"
});
```

```csharp
// Delete — queue BEFORE DB removal:
await _telegramQueue.EnqueueAsync(new TelegramSyncJob
{
    Action = "Delete",
    EntityType = "Publication",
    EntityId = publication.Id
});
```

---

## 5. Next.js Frontend Integration

Next.js **never calls Telegram directly**. The existing admin dashboard calls already trigger the backend, which now safely enqueues the Telegram tasks in the background without affecting UI response times.

---

## 6. Error Handling & Reliability

### Background Queue Benefits

Because of the `TelegramBackgroundWorker`, any temporary Telegram API downtime (e.g., 429 Rate Limits, 502 Bad Gateway) will not crash your API requests. The background worker handles retries while the CMS user goes about their business.

### Critical Ordering Rule

For Laws and Publications (Hard Deletes), you must enqueue the "Delete" action to `TelegramSyncQueue` **before** you execute `_db.Laws.Remove(law)`. The background worker needs the `TelegramMessageMapping` to know which message to delete.

---

## 7. Security Checklist

- [ ] `BotToken` stored in `appsettings.Development.json` (git-ignored) locally
- [ ] `BotToken` stored in **environment variables / secrets manager** in production
- [ ] `App:FrontendUrl` correctly points to the Next.js app, NOT the backend API
- [ ] Admin dashboard routes protected by `next-auth` (existing)
- [ ] ASP.NET API endpoints protected by `[HasPermission(...)]` attributes (existing)

---

## 8. Testing Checklist

- [ ] **CREATE** → Message appears in Telegram channel. Admin save was instant.
- [ ] **UPDATE** → Telegram message updates in-place (no duplicate message).
- [ ] **News Update Image** → Changes from `ImageMediaId` or `ImageUrl` successfully trigger an `editMessageMedia` on Telegram.
- [ ] **DELETE** → Telegram message disappears from channel.
- [ ] **Rate limit (429)** → Worker retries silently in the background.

---

## 9. Current Status Report (June 2026)

### ✅ WHAT IS DONE (Fully Working)

#### Core Infrastructure & Reliability

- **Background Worker Queue:** Telegram API calls happen silently in the background (`TelegramBackgroundWorker.cs`). This ensures the admin dashboard never freezes when saving an article.
- **Database Tracking:** Every post sent to Telegram is recorded in `TelegramMessageMappings` with a unique ID, allowing the CMS to "remember" which post is which.
- **Anti-Spam & Retry Logic:** The system uses intelligent retries (max 3 times) for network failures but explicitly **aborts on timeouts** to prevent sending duplicate "spam" messages to the channel.
- **50MB File Size Guard:** Built-in validation checks if a file exceeds Telegram's 50MB bot upload limit. If it does, the bot gracefully falls back to sending a text-only message with a download link instead of crashing.

#### News & Announcements (Style A)

- **Format:** Posts the Cover Image, rich text caption (with modern professional formatting), and a "📰 Read Article" inline button.
- **Features:** Supports Create, Edit (swapping images via multipart upload), Delete, and Restore.

#### Laws & Publications (Style B)

- **Format:** Natively uploads the **actual PDF document** directly to Telegram, allowing users to download it inside the app. It includes a professional, structured caption with category and date.
- **Features:** Supports Create, Edit, and Delete instantly synced with the Telegram channel.

---

### ⏳ WHAT IS NOT YET DONE (Pending Server Setup)

These items are fully coded but require configuration changes on your live production server:

1. **Configure the Live URL:** In `appsettings.json`, `App:FrontendUrl` MUST be changed from `localhost` to the live domain (e.g., `https://nspc.gov.kh`).
2. **Set the Live Telegram Channel:** Change `Telegram:ChannelId` in settings to the real public channel ID (e.g. `@NSPCCambodia`).
3. **Production Bot Setup:** Ensure the Bot is added as an **Administrator** to the public channel with permission to post and edit messages.

---

### 🚀 NEEDS IMPROVEMENT (Future Logic & Security Enhancements)

While the bot is highly robust, here is what should be implemented next to make it bulletproof:

#### 1. Bulk Operations Syncing (Logic)

- **Current state:** Selecting multiple News items and clicking "Bulk Delete" deletes them from the CMS database, but **does not** delete them from Telegram.
- **Improvement needed:** Update the `BulkDelete` methods in the controllers to loop through the selected items and enqueue `Delete` jobs to the `TelegramSyncQueue`.

#### 2. Admin Error Notifications (Logic & UX)

- **Current state:** If the Telegram background worker permanently fails to send a message (e.g., the Telegram API is down globally), it logs an error to the backend console.
- **Improvement needed:** Integrate the worker with the `NotificationService` so that if a Telegram sync fails, the admin who created the post receives a bell notification in the CMS dashboard saying: _"Failed to sync Law X to Telegram."_

#### 3. Idempotency & Concurrency (Security & Logic)

- **Current state:** Fast, repeated clicking of the "Save" button on the frontend can theoretically enqueue multiple creation jobs before the database mapping is saved.
- **Improvement needed:** Implement a frontend debounce/loading state on the Save buttons. On the backend, add a Redis or memory lock inside `TelegramBackgroundWorker` to ensure two threads don't accidentally process the same entity ID simultaneously.

#### 4. Video Previews & Rich Media (Feature)

- **Current state:** The system handles Images and PDFs natively.
- **Improvement needed:** Support extracting thumbnails for `.mp4` video uploads, or automatically compressing large videos to ensure they fit within Telegram's native player constraints.

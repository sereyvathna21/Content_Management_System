using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/admin/news")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public partial class AdminNewsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _config;

        public AdminNewsController(ApplicationDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        private int GetCurrentUserId()
        {
            var userIdStr = User.Claims.FirstOrDefault(c => c.Type == "Id")?.Value;
            if (int.TryParse(userIdStr, out var userId)) return userId;
            return 1;
        }

        [HttpGet]
        public async Task<IActionResult> List(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? q = null,
            [FromQuery] string? category = null,
            [FromQuery] string? status = null,
            [FromQuery] bool includeDeleted = false)
        {
            page = Math.Max(1, page);
            pageSize = Math.Max(1, pageSize);

            var query = _db.NewsArticles
                .Include(a => a.Translations)
                .AsQueryable();

            if (!includeDeleted)
            {
                query = query.Where(a => a.DeletedAt == null);
            }

            if (!string.IsNullOrWhiteSpace(category))
            {
                query = query.Where(a => a.Category == category);
            }

            if (!string.IsNullOrWhiteSpace(status) && TryParseStatus(status, out var parsed))
            {
                query = query.Where(a => a.Status == parsed);
            }

            if (!string.IsNullOrWhiteSpace(q))
            {
                var qLower = q.Trim().ToLowerInvariant();
                query = query.Where(a =>
                    (a.Slug ?? string.Empty).ToLower().Contains(qLower) ||
                    (a.Category ?? string.Empty).ToLower().Contains(qLower) ||
                    a.Translations.Any(t =>
                        (t.Title ?? string.Empty).ToLower().Contains(qLower) ||
                        (t.Excerpt ?? string.Empty).ToLower().Contains(qLower)
                    ));
            }

            var total = await query.CountAsync();

            var articles = await query
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var items = articles.Select(MapAdminDto).ToList();
            return Ok(new { total, page, pageSize, items });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var article = await _db.NewsArticles
                .Include(a => a.Translations)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (article == null) return NotFound();
            return Ok(MapAdminDto(article));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] NewsArticleCreateDto request)
        {
            if (request == null) return BadRequest();

            if (!TryValidateNewsRequest(
                    request.Slug,
                    request.Category,
                    request.Status,
                    request.PublishAt,
                    request.ImageUrl,
                    request.ImageMediaId,
                    request.ImageAltKh,
                    request.Translations,
                    out var error))
            {
                return BadRequest(new { message = error });
            }

            var normalizedSlug = NormalizeSlug(request.Slug);
            if (await _db.NewsArticles.AnyAsync(a => a.Slug.ToLower() == normalizedSlug))
            {
                return BadRequest(new { message = "Slug already exists." });
            }

            var userId = GetCurrentUserId();

            var article = new NewsArticle
            {
                Slug = normalizedSlug,
                Category = request.Category.Trim(),
                Status = request.Status,
                PublishAt = request.PublishAt,
                ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : request.ImageUrl.Trim(),
                ImageMediaId = request.ImageMediaId,
                ImageAltKh = string.IsNullOrWhiteSpace(request.ImageAltKh) ? null : request.ImageAltKh.Trim(),
                ImageAltEn = string.IsNullOrWhiteSpace(request.ImageAltEn) ? null : request.ImageAltEn.Trim(),
                Featured = request.Featured,
                SortOrder = request.SortOrder,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = userId,
                UpdatedAt = DateTime.UtcNow,
                UpdatedByUserId = userId
            };

            _db.NewsArticles.Add(article);
            await _db.SaveChangesAsync();

            foreach (var translation in request.Translations)
            {
                var normalizedLang = NormalizeLang(translation.Language);
                var entity = new NewsArticleTranslation
                {
                    ArticleId = article.Id,
                    Language = normalizedLang,
                    Title = translation.Title.Trim(),
                    Excerpt = translation.Excerpt.Trim(),
                    Subtitle = string.IsNullOrWhiteSpace(translation.Subtitle) ? null : translation.Subtitle.Trim(),
                    ContentHtml = string.IsNullOrWhiteSpace(translation.ContentHtml) ? null : translation.ContentHtml.Trim(),
                    ContentMd = string.IsNullOrWhiteSpace(translation.ContentMd) ? null : translation.ContentMd.Trim(),
                    MetaTitle = string.IsNullOrWhiteSpace(translation.MetaTitle) ? null : translation.MetaTitle.Trim(),
                    MetaDescription = string.IsNullOrWhiteSpace(translation.MetaDescription) ? null : translation.MetaDescription.Trim(),
                    CanonicalUrl = string.IsNullOrWhiteSpace(translation.CanonicalUrl) ? null : translation.CanonicalUrl.Trim(),
                    CreatedAt = DateTime.UtcNow
                };

                _db.NewsArticleTranslations.Add(entity);
            }

            await _db.SaveChangesAsync();

            if (article.Status == ContentStatus.Published)
            {
                await TriggerFrontendRevalidationAsync(new[]
                {
                    "/Landing-page/News",
                    $"/Landing-page/News/{Uri.EscapeDataString(article.Slug)}"
                });
            }

            return CreatedAtAction(nameof(Get), new { id = article.Id }, new { id = article.Id });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] NewsArticleUpdateDto request)
        {
            if (request == null) return BadRequest();

            if (!TryValidateNewsRequest(
                    request.Slug,
                    request.Category,
                    request.Status,
                    request.PublishAt,
                    request.ImageUrl,
                    request.ImageMediaId,
                    request.ImageAltKh,
                    request.Translations,
                    out var error))
            {
                return BadRequest(new { message = error });
            }

            var article = await _db.NewsArticles
                .Include(a => a.Translations)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (article == null) return NotFound();

            var previousSlug = article.Slug;
            var previousStatus = article.Status;

            var normalizedSlug = NormalizeSlug(request.Slug);
            if (await _db.NewsArticles.AnyAsync(a => a.Id != id && a.Slug.ToLower() == normalizedSlug))
            {
                return BadRequest(new { message = "Slug already exists." });
            }

            var userId = GetCurrentUserId();

            article.Slug = normalizedSlug;
            article.Category = request.Category.Trim();
            article.Status = request.Status;
            article.PublishAt = request.PublishAt;
            article.ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : request.ImageUrl.Trim();
            article.ImageMediaId = request.ImageMediaId;
            article.ImageAltKh = string.IsNullOrWhiteSpace(request.ImageAltKh) ? null : request.ImageAltKh.Trim();
            article.ImageAltEn = string.IsNullOrWhiteSpace(request.ImageAltEn) ? null : request.ImageAltEn.Trim();
            article.Featured = request.Featured;
            article.SortOrder = request.SortOrder;
            article.UpdatedAt = DateTime.UtcNow;
            article.UpdatedByUserId = userId;

            // Delete all existing translations to prevent concurrency tracking issues
            var existingTranslations = article.Translations.ToList();
            if (existingTranslations.Count > 0)
            {
                _db.NewsArticleTranslations.RemoveRange(existingTranslations);
                await _db.SaveChangesAsync();
            }

            // Add the new translations
            foreach (var translation in request.Translations)
            {
                var normalizedLang = NormalizeLang(translation.Language);
                _db.NewsArticleTranslations.Add(new NewsArticleTranslation
                {
                    ArticleId = article.Id,
                    Language = normalizedLang,
                    Title = translation.Title.Trim(),
                    Excerpt = translation.Excerpt.Trim(),
                    Subtitle = string.IsNullOrWhiteSpace(translation.Subtitle) ? null : translation.Subtitle.Trim(),
                    ContentHtml = string.IsNullOrWhiteSpace(translation.ContentHtml) ? null : translation.ContentHtml.Trim(),
                    ContentMd = string.IsNullOrWhiteSpace(translation.ContentMd) ? null : translation.ContentMd.Trim(),
                    MetaTitle = string.IsNullOrWhiteSpace(translation.MetaTitle) ? null : translation.MetaTitle.Trim(),
                    MetaDescription = string.IsNullOrWhiteSpace(translation.MetaDescription) ? null : translation.MetaDescription.Trim(),
                    CanonicalUrl = string.IsNullOrWhiteSpace(translation.CanonicalUrl) ? null : translation.CanonicalUrl.Trim(),
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _db.SaveChangesAsync();

            if (previousStatus == ContentStatus.Published || article.Status == ContentStatus.Published)
            {
                var paths = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
                {
                    "/Landing-page/News",
                    $"/Landing-page/News/{Uri.EscapeDataString(article.Slug)}",
                    $"/Landing-page/News/{Uri.EscapeDataString(previousSlug)}"
                };
                await TriggerFrontendRevalidationAsync(paths);
            }
            return Ok(MapAdminDto(article));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var article = await _db.NewsArticles.FirstOrDefaultAsync(a => a.Id == id);
            if (article == null) return NotFound();

            if (article.DeletedAt != null)
            {
                return BadRequest(new { message = "Article is already deleted." });
            }

            article.DeletedAt = DateTime.UtcNow;
            article.DeletedByUserId = GetCurrentUserId();
            article.UpdatedAt = DateTime.UtcNow;
            article.UpdatedByUserId = article.DeletedByUserId;

            await _db.SaveChangesAsync();

            if (article.Status == ContentStatus.Published)
            {
                await TriggerFrontendRevalidationAsync(new[]
                {
                    "/Landing-page/News",
                    $"/Landing-page/News/{Uri.EscapeDataString(article.Slug)}"
                });
            }
            return NoContent();
        }

        [HttpPost("{id}/restore")]
        public async Task<IActionResult> Restore(Guid id)
        {
            var article = await _db.NewsArticles.FirstOrDefaultAsync(a => a.Id == id);
            if (article == null) return NotFound();

            if (article.DeletedAt == null)
            {
                return BadRequest(new { message = "Article is not deleted." });
            }

            article.DeletedAt = null;
            article.DeletedByUserId = null;
            article.UpdatedAt = DateTime.UtcNow;
            article.UpdatedByUserId = GetCurrentUserId();

            await _db.SaveChangesAsync();

            if (article.Status == ContentStatus.Published)
            {
                await TriggerFrontendRevalidationAsync(new[]
                {
                    "/Landing-page/News",
                    $"/Landing-page/News/{Uri.EscapeDataString(article.Slug)}"
                });
            }
            return Ok();
        }

        [HttpPost("bulk")]
        public async Task<IActionResult> Bulk([FromBody] BulkActionRequest request)
        {
            if (request == null || request.Ids == null || request.Ids.Count == 0)
            {
                return BadRequest(new { message = "Ids are required." });
            }

            var action = (request.Action ?? string.Empty).Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(action))
            {
                return BadRequest(new { message = "Action is required." });
            }

            var ids = request.Ids.Distinct().ToList();
            var articles = await _db.NewsArticles
                .Include(a => a.Translations)
                .Where(a => ids.Contains(a.Id))
                .ToListAsync();

            var missing = ids.Except(articles.Select(a => a.Id)).ToList();
            if (missing.Count > 0)
            {
                return NotFound(new { message = "Some items were not found.", missingIds = missing });
            }

            var userId = GetCurrentUserId();
            var now = DateTime.UtcNow;

            if (action == "publish")
            {
                var publishAt = request.PublishAt ?? now;
                foreach (var article in articles)
                {
                    if (article.DeletedAt != null)
                    {
                        return BadRequest(new { message = "Cannot publish deleted articles." });
                    }

                    article.Status = ContentStatus.Published;
                    article.PublishAt = publishAt;

                    if (!TryValidateNewsForPublish(article, out var error))
                    {
                        return BadRequest(new { message = error, id = article.Id });
                    }

                    article.UpdatedAt = now;
                    article.UpdatedByUserId = userId;
                }
            }
            else if (action == "unpublish")
            {
                foreach (var article in articles)
                {
                    article.Status = ContentStatus.Draft;
                    article.UpdatedAt = now;
                    article.UpdatedByUserId = userId;
                }
            }
            else if (action == "delete")
            {
                foreach (var article in articles)
                {
                    article.DeletedAt = now;
                    article.DeletedByUserId = userId;
                    article.UpdatedAt = now;
                    article.UpdatedByUserId = userId;
                }
            }
            else if (action == "restore")
            {
                foreach (var article in articles)
                {
                    article.DeletedAt = null;
                    article.DeletedByUserId = null;
                    article.UpdatedAt = now;
                    article.UpdatedByUserId = userId;
                }
            }
            else
            {
                return BadRequest(new { message = "Unsupported action." });
            }

            await _db.SaveChangesAsync();

            var paths = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "/Landing-page/News"
            };

            foreach (var article in articles)
            {
                if (!string.IsNullOrWhiteSpace(article.Slug))
                {
                    paths.Add($"/Landing-page/News/{Uri.EscapeDataString(article.Slug)}");
                }
            }

            await TriggerFrontendRevalidationAsync(paths);
            return Ok(new { count = articles.Count });
        }

        public class BulkActionRequest
        {
            public string Action { get; set; } = string.Empty;
            public List<Guid> Ids { get; set; } = new();
            public DateTime? PublishAt { get; set; }
        }
    }
}

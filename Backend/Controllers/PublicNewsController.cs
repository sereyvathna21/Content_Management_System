using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/public/news")]
    public class PublicNewsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public PublicNewsController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> List(
            [FromQuery] string lang = "km",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12)
        {
            var requestedLang = NormalizeLang(lang);
            page = Math.Max(1, page);
            pageSize = Math.Max(1, pageSize);

            var now = DateTime.UtcNow;
            var baseQuery = _db.NewsArticles
                .Include(a => a.Translations)
                .Include(a => a.ImageMedia)
                .Where(a => a.DeletedAt == null)
                .Where(a => a.Status == ContentStatus.Published)
                .Where(a => a.PublishAt != null && a.PublishAt <= now)
                .Where(a => a.Translations.Any(t => NormalizeLang(t.Language) == requestedLang));

            var total = await baseQuery.CountAsync();

            var articles = await baseQuery
                .OrderByDescending(a => a.PublishAt)
                .ThenByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var items = new List<PublicNewsListItemDto>();
            foreach (var article in articles)
            {
                var translation = PickTranslation(article.Translations, requestedLang);
                if (translation == null) continue;

                items.Add(new PublicNewsListItemDto
                {
                    Id = article.Id,
                    Slug = article.Slug,
                    Category = article.Category ?? string.Empty,
                    PublishAt = article.PublishAt,
                    Language = requestedLang,
                    Title = translation.Title ?? string.Empty,
                    Excerpt = translation.Excerpt ?? string.Empty,
                    ImageUrl = BuildPublicUrl(ResolveImageUrl(article)),
                    ImageAlt = PickImageAlt(article, requestedLang)
                });
            }

            return Ok(new { total, page, pageSize, items });
        }

        [HttpGet("{slug}")]
        [AllowAnonymous]
        public async Task<IActionResult> Get(string slug, [FromQuery] string lang = "km")
        {
            var requestedLang = NormalizeLang(lang);
            var now = DateTime.UtcNow;

            var article = await _db.NewsArticles
                .Include(a => a.Translations)
                .Include(a => a.ImageMedia)
                .FirstOrDefaultAsync(a => a.Slug == slug &&
                                          a.DeletedAt == null &&
                                          a.Status == ContentStatus.Published &&
                                          a.PublishAt != null &&
                                          a.PublishAt <= now);

            if (article == null) return NotFound();

            var translation = PickTranslation(article.Translations, requestedLang);
            if (translation == null) return NotFound();

            var dto = new PublicNewsDetailDto
            {
                Id = article.Id,
                Slug = article.Slug,
                Category = article.Category ?? string.Empty,
                PublishAt = article.PublishAt,
                Language = requestedLang,
                Title = translation.Title ?? string.Empty,
                Excerpt = translation.Excerpt ?? string.Empty,
                Subtitle = translation.Subtitle,
                ContentHtml = translation.ContentHtml,
                ContentMd = translation.ContentMd,
                MetaTitle = translation.MetaTitle,
                MetaDescription = translation.MetaDescription,
                CanonicalUrl = translation.CanonicalUrl,
                ImageUrl = BuildPublicUrl(ResolveImageUrl(article)),
                ImageAlt = PickImageAlt(article, requestedLang)
            };

            return Ok(dto);
        }

        private static NewsArticleTranslation? PickTranslation(IEnumerable<NewsArticleTranslation> translations, string lang)
        {
            var list = translations?.ToList() ?? new List<NewsArticleTranslation>();
            if (list.Count == 0) return null;

            return list.FirstOrDefault(t =>
                string.Equals(NormalizeLang(t.Language), lang, StringComparison.OrdinalIgnoreCase));
        }

        private static string NormalizeLang(string? lang)
        {
            var normalized = (lang ?? string.Empty).Trim().ToLowerInvariant();
            if (normalized == "kh") return "km";
            return normalized;
        }

        private static string? ResolveImageUrl(NewsArticle article)
        {
            if (!string.IsNullOrWhiteSpace(article.ImageUrl))
            {
                return article.ImageUrl;
            }

            return article.ImageMedia?.PublicUrl;
        }

        private static string? PickImageAlt(NewsArticle article, string lang)
        {
            if (string.Equals(lang, "km", StringComparison.OrdinalIgnoreCase))
            {
                return string.IsNullOrWhiteSpace(article.ImageAltKh) ? article.ImageAltEn : article.ImageAltKh;
            }

            if (string.Equals(lang, "en", StringComparison.OrdinalIgnoreCase))
            {
                return string.IsNullOrWhiteSpace(article.ImageAltEn) ? article.ImageAltKh : article.ImageAltEn;
            }

            return string.IsNullOrWhiteSpace(article.ImageAltKh) ? article.ImageAltEn : article.ImageAltKh;
        }

        private string? BuildPublicUrl(string? url)
        {
            if (string.IsNullOrWhiteSpace(url)) return null;
            if (Uri.TryCreate(url, UriKind.Absolute, out var absolute) &&
                (absolute.Scheme == Uri.UriSchemeHttp || absolute.Scheme == Uri.UriSchemeHttps))
            {
                return url;
            }

            var baseUrl = $"{Request.Scheme}://{Request.Host.Value}";
            return url.StartsWith("/") ? baseUrl + url : $"{baseUrl}/{url}";
        }
    }
}

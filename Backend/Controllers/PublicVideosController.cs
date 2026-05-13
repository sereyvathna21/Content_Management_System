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
    [Route("api/public/videos")]
    public class PublicVideosController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public PublicVideosController(ApplicationDbContext db)
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
            page = Math.Max(1, page);
            pageSize = Math.Max(1, pageSize);

            var now = DateTime.UtcNow;

            var query = _db.Videos
                .Where(v => v.DeletedAt == null)
                .Where(v => v.Status == ContentStatus.Published)
                .Where(v => v.PublishAt != null && v.PublishAt <= now);

            var total = await query.CountAsync();

            var videos = await query
                .OrderByDescending(v => v.PublishAt)
                .ThenByDescending(v => v.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var items = videos.Select(video => new PublicVideoListItemDto
            {
                Id = video.Id,
                Title = video.Title,
                Description = video.Description,
                EmbedUrl = video.EmbedUrl,
                Category = video.Category ?? string.Empty,
                PublishAt = video.PublishAt,
                ThumbnailUrl = BuildPublicUrl(ResolveThumbnailUrl(video)),
                ThumbnailAlt = PickThumbnailAlt(video, lang)
            }).ToList();

            return Ok(new { total, page, pageSize, items });
        }

        private static string? ResolveThumbnailUrl(Video video)
        {
            if (!string.IsNullOrWhiteSpace(video.ThumbnailUrl))
            {
                return video.ThumbnailUrl;
            }

            return video.ThumbnailMedia?.PublicUrl;
        }

        private static string? PickThumbnailAlt(Video video, string? lang)
        {
            var normalized = (lang ?? string.Empty).Trim().ToLowerInvariant();
            if (normalized == "kh") normalized = "km";

            if (string.Equals(normalized, "km", StringComparison.OrdinalIgnoreCase))
            {
                return string.IsNullOrWhiteSpace(video.ThumbnailAltKh) ? video.ThumbnailAltEn : video.ThumbnailAltKh;
            }

            if (string.Equals(normalized, "en", StringComparison.OrdinalIgnoreCase))
            {
                return string.IsNullOrWhiteSpace(video.ThumbnailAltEn) ? video.ThumbnailAltKh : video.ThumbnailAltEn;
            }

            return string.IsNullOrWhiteSpace(video.ThumbnailAltKh) ? video.ThumbnailAltEn : video.ThumbnailAltKh;
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

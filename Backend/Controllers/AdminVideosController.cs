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
    [Route("api/admin/videos")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public partial class AdminVideosController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _config;

        public AdminVideosController(ApplicationDbContext db, IConfiguration config)
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

            var query = _db.Videos.AsQueryable();

            if (!includeDeleted)
            {
                query = query.Where(v => v.DeletedAt == null);
            }

            if (!string.IsNullOrWhiteSpace(category))
            {
                query = query.Where(v => v.Category == category);
            }

            if (!string.IsNullOrWhiteSpace(status) && TryParseStatus(status, out var parsed))
            {
                query = query.Where(v => v.Status == parsed);
            }

            if (!string.IsNullOrWhiteSpace(q))
            {
                var qLower = q.Trim().ToLowerInvariant();
                query = query.Where(v =>
                    (v.Title ?? string.Empty).ToLower().Contains(qLower) ||
                    (v.Description ?? string.Empty).ToLower().Contains(qLower) ||
                    (v.Category ?? string.Empty).ToLower().Contains(qLower));
            }

            var total = await query.CountAsync();

            var videos = await query
                .OrderByDescending(v => v.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var items = videos.Select(MapAdminDto).ToList();
            return Ok(new { total, page, pageSize, items });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var video = await _db.Videos.FirstOrDefaultAsync(v => v.Id == id);
            if (video == null) return NotFound();
            return Ok(MapAdminDto(video));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] VideoCreateDto request)
        {
            if (request == null) return BadRequest();

            if (!TryNormalizeEmbedUrl(request.EmbedUrl, out var normalizedEmbedUrl))
            {
                return BadRequest(new { message = "EmbedUrl is required." });
            }

            if (!TryValidateVideoRequest(
                    request.Title,
                    request.Description,
                    normalizedEmbedUrl,
                    request.Category,
                    request.Status,
                    request.PublishAt,
                    out var error))
            {
                return BadRequest(new { message = error });
            }

            var userId = GetCurrentUserId();

            var video = new Video
            {
                Title = request.Title.Trim(),
                Description = request.Description.Trim(),
                EmbedUrl = normalizedEmbedUrl,
                Category = request.Category.Trim(),
                Status = request.Status,
                PublishAt = request.PublishAt,
                Featured = request.Featured,
                SortOrder = request.SortOrder,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedByUserId = userId,
                UpdatedByUserId = userId
            };

            _db.Videos.Add(video);
            await _db.SaveChangesAsync();

            if (video.Status == ContentStatus.Published)
            {
                await TriggerFrontendRevalidationAsync(new[]
                {
                    "/Landing-page/News",
                    $"/Landing-page/News/videos/{video.Id}"
                });
            }

            return CreatedAtAction(nameof(Get), new { id = video.Id }, new { id = video.Id });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] VideoUpdateDto request)
        {
            if (request == null) return BadRequest();

            if (!TryNormalizeEmbedUrl(request.EmbedUrl, out var normalizedEmbedUrl))
            {
                return BadRequest(new { message = "EmbedUrl is required." });
            }

            if (!TryValidateVideoRequest(
                    request.Title,
                    request.Description,
                    normalizedEmbedUrl,
                    request.Category,
                    request.Status,
                    request.PublishAt,
                    out var error))
            {
                return BadRequest(new { message = error });
            }

            var video = await _db.Videos.FirstOrDefaultAsync(v => v.Id == id);
            if (video == null) return NotFound();

            var previousStatus = video.Status;

            var userId = GetCurrentUserId();

            video.Title = request.Title.Trim();
            video.Description = request.Description.Trim();
            video.EmbedUrl = normalizedEmbedUrl;
            video.Category = request.Category.Trim();
            video.Status = request.Status;
            video.PublishAt = request.PublishAt;
            video.Featured = request.Featured;
            video.SortOrder = request.SortOrder;
            video.UpdatedAt = DateTime.UtcNow;
            video.UpdatedByUserId = userId;

            await _db.SaveChangesAsync();

            if (previousStatus == ContentStatus.Published || video.Status == ContentStatus.Published)
            {
                await TriggerFrontendRevalidationAsync(new[]
                {
                    "/Landing-page/News",
                    $"/Landing-page/News/videos/{video.Id}"
                });
            }
            return Ok(MapAdminDto(video));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var video = await _db.Videos.FirstOrDefaultAsync(v => v.Id == id);
            if (video == null) return NotFound();

            if (video.DeletedAt != null)
            {
                return BadRequest(new { message = "Video is already deleted." });
            }

            var userId = GetCurrentUserId();
            video.DeletedAt = DateTime.UtcNow;
            video.DeletedByUserId = userId;
            video.UpdatedAt = DateTime.UtcNow;
            video.UpdatedByUserId = userId;

            await _db.SaveChangesAsync();

            if (video.Status == ContentStatus.Published)
            {
                await TriggerFrontendRevalidationAsync(new[]
                {
                    "/Landing-page/News",
                    $"/Landing-page/News/videos/{video.Id}"
                });
            }
            return NoContent();
        }

        [HttpPost("{id}/restore")]
        public async Task<IActionResult> Restore(Guid id)
        {
            var video = await _db.Videos.FirstOrDefaultAsync(v => v.Id == id);
            if (video == null) return NotFound();

            if (video.DeletedAt == null)
            {
                return BadRequest(new { message = "Video is not deleted." });
            }

            video.DeletedAt = null;
            video.DeletedByUserId = null;
            video.UpdatedAt = DateTime.UtcNow;
            video.UpdatedByUserId = GetCurrentUserId();

            await _db.SaveChangesAsync();

            if (video.Status == ContentStatus.Published)
            {
                await TriggerFrontendRevalidationAsync(new[]
                {
                    "/Landing-page/News",
                    $"/Landing-page/News/videos/{video.Id}"
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
            var videos = await _db.Videos
                .Where(v => ids.Contains(v.Id))
                .ToListAsync();

            var missing = ids.Except(videos.Select(v => v.Id)).ToList();
            if (missing.Count > 0)
            {
                return NotFound(new { message = "Some items were not found.", missingIds = missing });
            }

            var userId = GetCurrentUserId();
            var now = DateTime.UtcNow;

            if (action == "publish")
            {
                var publishAt = request.PublishAt ?? now;
                foreach (var video in videos)
                {
                    if (video.DeletedAt != null)
                    {
                        return BadRequest(new { message = "Cannot publish deleted videos." });
                    }

                    video.Status = ContentStatus.Published;
                    video.PublishAt = publishAt;

                    if (!TryValidateVideoForPublish(video, out var error))
                    {
                        return BadRequest(new { message = error, id = video.Id });
                    }

                    video.UpdatedAt = now;
                    video.UpdatedByUserId = userId;
                }
            }
            else if (action == "unpublish")
            {
                foreach (var video in videos)
                {
                    video.Status = ContentStatus.Draft;
                    video.UpdatedAt = now;
                    video.UpdatedByUserId = userId;
                }
            }
            else if (action == "delete")
            {
                foreach (var video in videos)
                {
                    video.DeletedAt = now;
                    video.DeletedByUserId = userId;
                    video.UpdatedAt = now;
                    video.UpdatedByUserId = userId;
                }
            }
            else if (action == "restore")
            {
                foreach (var video in videos)
                {
                    video.DeletedAt = null;
                    video.DeletedByUserId = null;
                    video.UpdatedAt = now;
                    video.UpdatedByUserId = userId;
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

            foreach (var video in videos)
            {
                paths.Add($"/Landing-page/News/videos/{video.Id}");
            }

            await TriggerFrontendRevalidationAsync(paths);
            return Ok(new { count = videos.Count });
        }

        public class BulkActionRequest
        {
            public string Action { get; set; } = string.Empty;
            public List<Guid> Ids { get; set; } = new();
            public DateTime? PublishAt { get; set; }
        }
    }
}

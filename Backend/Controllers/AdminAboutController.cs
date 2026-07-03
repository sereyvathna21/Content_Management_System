using AutoMapper;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Backend.Security;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/admin/about")]
    public class AdminAboutController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _config;
        private readonly IAuditLogService _audit;
        private readonly INotificationService _notificationService;

        public AdminAboutController(ApplicationDbContext db, IMapper mapper, IWebHostEnvironment env, IConfiguration config, IAuditLogService audit, INotificationService notificationService)
        {
            _db = db;
            _mapper = mapper;
            _env = env;
            _config = config;
            _audit = audit;
            _notificationService = notificationService;
        }

        private int GetCurrentUserId()
        {
            // In a real app, extract from HttpContext.User
            // For now, returning 1 as a fallback or a dummy if auth doesn't populate int IDs identically
            var userIdStr = User.Claims.FirstOrDefault(c => c.Type == "Id")?.Value;
            if (int.TryParse(userIdStr, out var userId)) return userId;
            return 1;
        }

        private void AddAudit(string action, string entityType, Guid? entityId, Guid? topicId = null, Guid? sectionId = null, object? metadata = null)
        {
            _db.AboutAuditLogs.Add(new AboutAuditLog
            {
                Action = action,
                EntityType = entityType,
                EntityId = entityId?.ToString(),
                TopicId = topicId,
                SectionId = sectionId,
                UserId = GetCurrentUserId(),
                MetadataJson = metadata == null ? null : JsonSerializer.Serialize(metadata),
                CreatedAt = DateTime.UtcNow
            });
        }

        private Task WriteAuditAsync(string action, string entityType, Guid? entityId, string summary, object? metadata = null)
        {
            return _audit.WriteAsync(new AuditLogEntry
            {
                Action = action,
                EntityType = entityType,
                EntityId = entityId?.ToString(),
                Summary = summary,
                Status = AuditLogStatus.Success,
                Metadata = metadata
            }, HttpContext);
        }

        private async Task TriggerFrontendRevalidationAsync(string path)
        {
            try
            {
                var frontendUrl = _config["FrontendUrl"] ?? "http://localhost:3000";
                var secret = _config["RevalidateSecret"] ?? "fallback-secret-123";
                using var client = new System.Net.Http.HttpClient();
                client.Timeout = TimeSpan.FromSeconds(5);

                var payload = new { secret = secret, path = path };
                var content = new System.Net.Http.StringContent(JsonSerializer.Serialize(payload), System.Text.Encoding.UTF8, "application/json");

                await client.PostAsync($"{frontendUrl.TrimEnd('/')}/api/revalidate", content);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to trigger frontend revalidation: {ex.Message}");
            }
        }

        #region Topics CRUD

        [HttpGet("topics")]
        [HasPermission(PermissionConstants.AboutRead)]
        public async Task<IActionResult> GetTopics(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? q = null)
        {
            page = Math.Max(1, page);
            pageSize = Math.Max(1, pageSize);

            var query = _db.AboutTopics.AsQueryable();

            if (!string.IsNullOrWhiteSpace(q))
            {
                var qLower = q.Trim().ToLower();
                query = query.Where(topic =>
                    (topic.Slug ?? string.Empty).ToLower().Contains(qLower) ||
                    (topic.TitleKm ?? string.Empty).ToLower().Contains(qLower) ||
                    (topic.TitleEn ?? string.Empty).ToLower().Contains(qLower));
            }

            var total = await query.CountAsync();

            var topics = await query
                .OrderBy(t => t.SortOrder)
                .ThenByDescending(t => t.UpdatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                total,
                page,
                pageSize,
                items = _mapper.Map<List<AboutTopicDto>>(topics)
            });
        }

        [HttpGet("topics/{topicId}")]
        [HasPermission(PermissionConstants.AboutRead)]
        public async Task<IActionResult> GetTopic(Guid topicId)
        {
            var topic = await _db.AboutTopics.FindAsync(topicId);
            if (topic == null) return NotFound();
            return Ok(_mapper.Map<AboutTopicDto>(topic));
        }

        [HttpPost("topics")]
        [HasPermission(PermissionConstants.AboutCreate)]
        public async Task<IActionResult> CreateTopic([FromBody] AboutTopicCreateDto dto)
        {
            if (await _db.AboutTopics.AnyAsync(t => t.Slug == dto.Slug))
                return BadRequest(new { message = "Slug already exists." });

            var topic = _mapper.Map<AboutTopic>(dto);
            topic.Status = TopicStatus.Draft;
            topic.UpdatedAt = DateTime.UtcNow;
            topic.UpdatedByUserId = GetCurrentUserId();

            _db.AboutTopics.Add(topic);
            AddAudit("CreateTopic", "AboutTopic", topic.Id, topic.Id, null, new { topic.Slug, topic.TitleKm, topic.TitleEn });
            await _db.SaveChangesAsync();

            await WriteAuditAsync("about:topic:create", "AboutTopic", topic.Id, "Created about topic", new { topic.Slug, topic.TitleKm, topic.TitleEn });

            var effectiveTitle = !string.IsNullOrWhiteSpace(topic.TitleKm) ? topic.TitleKm : topic.TitleEn;
            await _notificationService.SendGeneralNotificationAsync(topic.TitleKm ?? "", topic.TitleEn ?? "", $"About Topic \"{effectiveTitle}\" was created.", "created");

            return CreatedAtAction(nameof(GetTopic), new { topicId = topic.Id }, _mapper.Map<AboutTopicDto>(topic));
        }

        [HttpPut("topics/{topicId}")]
        [HasPermission(PermissionConstants.AboutUpdate)]
        public async Task<IActionResult> UpdateTopic(Guid topicId, [FromBody] AboutTopicUpdateDto dto)
        {
            var topic = await _db.AboutTopics.FindAsync(topicId);
            if (topic == null) return NotFound();

            _mapper.Map(dto, topic);
            topic.UpdatedAt = DateTime.UtcNow;
            topic.UpdatedByUserId = GetCurrentUserId();

            AddAudit("UpdateTopic", "AboutTopic", topic.Id, topic.Id, null, new { dto.TitleKm, dto.TitleEn, dto.SubtitleKm, dto.SubtitleEn, dto.ReferenceKm, dto.ReferenceEn, dto.SortOrder, dto.Status });
            await _db.SaveChangesAsync();

            await WriteAuditAsync("about:topic:update", "AboutTopic", topic.Id, "Updated about topic", new { dto.TitleKm, dto.TitleEn, dto.SortOrder, dto.Status });
            // If this topic is published, trigger frontend revalidation so updates appear on the landing page
            if (topic.Status == TopicStatus.Published)
            {
                await TriggerFrontendRevalidationAsync("/Landing-page/About-us");
            }
            return Ok(_mapper.Map<AboutTopicDto>(topic));
        }

        [HttpDelete("topics/{topicId}")]
        [HasPermission(PermissionConstants.AboutDelete)]
        public async Task<IActionResult> DeleteTopic(Guid topicId)
        {
            var topic = await _db.AboutTopics
                .Include(t => t.Sections)
                .FirstOrDefaultAsync(t => t.Id == topicId);

            if (topic == null) return NotFound();

            // Optional: Prevent deletion if there are sections, or rely on cascade.
            // Given the ApplicationDbContext has cascade delete for sections, it should work.
            // But we might want to log it.

            AddAudit("DeleteTopic", "AboutTopic", topic.Id, topic.Id, null, new { topic.Slug, topic.TitleKm });

            _db.AboutTopics.Remove(topic);
            await _db.SaveChangesAsync();

            await WriteAuditAsync("about:topic:delete", "AboutTopic", topic.Id, "Deleted about topic", new { topic.Slug, topic.TitleKm });

            var effectiveTitle = !string.IsNullOrWhiteSpace(topic.TitleKm) ? topic.TitleKm : topic.TitleEn;
            await _notificationService.SendGeneralNotificationAsync(topic.TitleKm ?? "", topic.TitleEn ?? "", $"About Topic \"{effectiveTitle}\" was deleted.", "deleted");

            return NoContent();
        }

        #endregion

        #region Sections CRUD

        [HttpGet("topics/{topicId}/sections")]
        [HasPermission(PermissionConstants.AboutRead)]
        public async Task<IActionResult> GetSections(Guid topicId)
        {
            var sections = await _db.AboutSections
                .Include(s => s.Media)
                .ThenInclude(sm => sm.Media)
                .Where(s => s.TopicId == topicId)
                .OrderBy(s => s.SortOrder)
                .ToListAsync();

            // Typically frontend reconstructs the tree or backend sends nested.
            // Returning flat list sorted by order is usually fine if ParentSectionId is present.
            return Ok(_mapper.Map<List<AboutSectionDto>>(sections));
        }

        [HttpPost("topics/{topicId}/sections")]
        [HasPermission(PermissionConstants.AboutCreate)]
        public async Task<IActionResult> CreateSection(Guid topicId, [FromBody] AboutSectionCreateDto dto)
        {
            var topic = await _db.AboutTopics.FindAsync(topicId);
            if (topic == null) return NotFound("Topic not found.");

            var section = _mapper.Map<AboutSection>(dto);
            section.TopicId = topicId;
            // Inherit the Topic's status so new sections are instantly live if the Topic is already live
            section.Status = topic.Status;
            section.UpdatedAt = DateTime.UtcNow;
            section.UpdatedByUserId = GetCurrentUserId();

            if (dto.ParentSectionId.HasValue)
            {
                var parent = await _db.AboutSections.FindAsync(dto.ParentSectionId.Value);
                if (parent == null || parent.TopicId != topicId)
                    return BadRequest("Invalid parent section.");
                section.Depth = parent.Depth + 1;
            }
            else
            {
                section.Depth = 0;
            }

            _db.AboutSections.Add(section);
            AddAudit("CreateSection", "AboutSection", section.Id, topicId, section.Id, new { section.SectionKey, section.TitleKm, section.TitleEn, section.SortOrder, section.ParentSectionId });
            await _db.SaveChangesAsync();

            await WriteAuditAsync("about:section:create", "AboutSection", section.Id, "Created about section", new { section.SectionKey, section.TitleKm, section.TitleEn, section.SortOrder, section.ParentSectionId });

            return Ok(_mapper.Map<AboutSectionDto>(section));
        }

        [HttpPut("sections/{sectionId}")]
        [HasPermission(PermissionConstants.AboutUpdate)]
        public async Task<IActionResult> UpdateSection(Guid sectionId, [FromBody] AboutSectionUpdateDto dto)
        {
            var section = await _db.AboutSections.FindAsync(sectionId);
            if (section == null) return NotFound();

            var existingStatus = section.Status;
            _mapper.Map(dto, section);
            section.Status = dto.Status ?? existingStatus;
            section.UpdatedAt = DateTime.UtcNow;
            section.UpdatedByUserId = GetCurrentUserId();

            if (dto.ParentSectionId.HasValue)
            {
                var parent = await _db.AboutSections.FindAsync(dto.ParentSectionId.Value);
                if (parent == null || parent.TopicId != section.TopicId)
                    return BadRequest("Invalid parent section.");
                section.Depth = parent.Depth + 1;
            }
            else
            {
                section.Depth = 0;
            }

            AddAudit("UpdateSection", "AboutSection", section.Id, section.TopicId, section.Id, new { dto.SectionKey, dto.TitleKm, dto.TitleEn, dto.SortOrder, dto.ParentSectionId, dto.Status });
            await _db.SaveChangesAsync();

            await WriteAuditAsync("about:section:update", "AboutSection", section.Id, "Updated about section", new { dto.SectionKey, dto.TitleKm, dto.TitleEn, dto.SortOrder, dto.ParentSectionId, dto.Status });
            // If the parent topic is published, trigger frontend revalidation so section changes appear immediately
            var parentTopic = await _db.AboutTopics.FindAsync(section.TopicId);
            if (parentTopic != null && parentTopic.Status == TopicStatus.Published)
            {
                await TriggerFrontendRevalidationAsync("/Landing-page/About-us");
            }
            return Ok(_mapper.Map<AboutSectionDto>(section));
        }

        [HttpDelete("sections/{sectionId}")]
        [HasPermission(PermissionConstants.AboutDelete)]
        public async Task<IActionResult> DeleteSection(Guid sectionId)
        {
            var section = await _db.AboutSections
                .Include(s => s.ChildSections)
                .FirstOrDefaultAsync(s => s.Id == sectionId);

            if (section == null) return NotFound();
            if (section.ChildSections.Any()) return BadRequest(new { message = "Cannot delete a section with children. Delete children first." });

            AddAudit("DeleteSection", "AboutSection", section.Id, section.TopicId, section.Id, new { section.SectionKey, section.TitleKm, section.SortOrder, section.ParentSectionId });
            _db.AboutSections.Remove(section);
            await _db.SaveChangesAsync();

            await WriteAuditAsync("about:section:delete", "AboutSection", section.Id, "Deleted about section", new { section.SectionKey, section.TitleKm, section.SortOrder, section.ParentSectionId });
            return NoContent();
        }

        [HttpPost("topics/{topicId}/sections/reorder")]
        [HasPermission(PermissionConstants.AboutUpdate)]
        public async Task<IActionResult> ReorderSections(Guid topicId, [FromBody] List<SectionReorderDto> reorders)
        {
            var sectionIds = reorders.Select(r => r.SectionId).ToList();
            var sections = await _db.AboutSections
                .Where(s => s.TopicId == topicId && sectionIds.Contains(s.Id))
                .ToListAsync();

            foreach (var section in sections)
            {
                var reorder = reorders.First(r => r.SectionId == section.Id);
                section.SortOrder = reorder.SortOrder;
                section.UpdatedAt = DateTime.UtcNow;
                section.UpdatedByUserId = GetCurrentUserId();
            }

            AddAudit("ReorderSections", "AboutSection", null, topicId, null, reorders);
            await _db.SaveChangesAsync();

            await WriteAuditAsync("about:section:reorder", "AboutSection", null, "Reordered about sections", new { topicId, affectedCount = reorders.Count });
            return Ok();
        }

        #endregion

        #region Media Actions

        [HttpPost("media/upload")]
        [HasPermission(PermissionConstants.AboutCreate)]
        public async Task<IActionResult> UploadMedia([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("No file uploaded.");

            const long maxBytes = 5 * 1024 * 1024;
            if (file.Length > maxBytes) return BadRequest("File too large. Max 5 MB.");

            var isImage = file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase);
            var isPdf = file.ContentType.Equals("application/pdf", StringComparison.OrdinalIgnoreCase);

            if (!isImage && !isPdf)
                return BadRequest("Invalid file type. Only images and PDFs are allowed.");

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf" };
            if (!allowedExtensions.Contains(ext)) return BadRequest("Invalid file extension.");

            var uploadsRoot = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "about");
            Directory.CreateDirectory(uploadsRoot);

            var fileName = $"{Guid.NewGuid():N}{ext}";
            var filePath = Path.Combine(uploadsRoot, fileName);

            await using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var media = new Media
            {
                StoragePath = filePath,
                PublicUrl = $"/uploads/about/{fileName}",
                MimeType = file.ContentType,
                FileSize = file.Length,
                UploadedByUserId = GetCurrentUserId(),
                CreatedAt = DateTime.UtcNow
            };

            _db.Media.Add(media);
            AddAudit("UploadMedia", "Media", media.Id, null, null, new { media.PublicUrl, media.MimeType, media.FileSize });
            await _db.SaveChangesAsync();

            await WriteAuditAsync("about:media:upload", "Media", media.Id, "Uploaded about media", new { media.PublicUrl, media.MimeType, media.FileSize });

            return Ok(_mapper.Map<MediaDto>(media));
        }

        [HttpPost("sections/{sectionId}/media")]
        [HasPermission(PermissionConstants.AboutCreate)]
        public async Task<IActionResult> AttachMedia(Guid sectionId, [FromBody] AboutSectionMediaCreateDto dto)
        {
            var section = await _db.AboutSections.FindAsync(sectionId);
            if (section == null) return NotFound("Section not found.");

            var mediaItem = await _db.Media.FindAsync(dto.MediaId);
            if (mediaItem == null) return NotFound("Media not found.");

            if (string.IsNullOrWhiteSpace(dto.AltKm)) return BadRequest("Alt text (Khmer) is required.");

            var sectionMedia = _mapper.Map<AboutSectionMedia>(dto);
            sectionMedia.SectionId = sectionId;

            _db.AboutSectionMedia.Add(sectionMedia);
            AddAudit("AttachMedia", "AboutSectionMedia", sectionMedia.Id, section.TopicId, sectionId, new { sectionMedia.MediaId, sectionMedia.Position, sectionMedia.SortOrder });
            await _db.SaveChangesAsync();

            await WriteAuditAsync("about:media:attach", "AboutSectionMedia", sectionMedia.Id, "Attached media to about section", new { sectionMedia.MediaId, sectionMedia.Position, sectionMedia.SortOrder });

            return Ok(_mapper.Map<AboutSectionMediaDto>(sectionMedia));
        }

        [HttpPut("sections/{sectionId}/media/{sectionMediaId}")]
        [HasPermission(PermissionConstants.AboutUpdate)]
        public async Task<IActionResult> UpdateMedia(Guid sectionId, Guid sectionMediaId, [FromBody] AboutSectionMediaUpdateDto dto)
        {
            var sectionMedia = await _db.AboutSectionMedia
                .FirstOrDefaultAsync(sm => sm.Id == sectionMediaId && sm.SectionId == sectionId);

            if (sectionMedia == null) return NotFound("Section media not found.");

            if (string.IsNullOrWhiteSpace(dto.AltKm)) return BadRequest("Alt text (Khmer) is required.");

            _mapper.Map(dto, sectionMedia);
            AddAudit("UpdateMedia", "AboutSectionMedia", sectionMedia.Id, null, sectionId, new { dto.Position, dto.SortOrder });
            await _db.SaveChangesAsync();

            await WriteAuditAsync("about:media:update", "AboutSectionMedia", sectionMedia.Id, "Updated about section media", new { dto.Position, dto.SortOrder });

            return Ok(_mapper.Map<AboutSectionMediaDto>(sectionMedia));
        }

        [HttpDelete("sections/{sectionId}/media/{sectionMediaId}")]
        [HasPermission(PermissionConstants.AboutDelete)]
        public async Task<IActionResult> DetachMedia(Guid sectionId, Guid sectionMediaId)
        {
            var sectionMedia = await _db.AboutSectionMedia
                .FirstOrDefaultAsync(sm => sm.Id == sectionMediaId && sm.SectionId == sectionId);

            if (sectionMedia == null) return NotFound();

            AddAudit("DetachMedia", "AboutSectionMedia", sectionMedia.Id, null, sectionId, new { sectionMedia.MediaId, sectionMedia.SortOrder });
            _db.AboutSectionMedia.Remove(sectionMedia);
            await _db.SaveChangesAsync();

            await WriteAuditAsync("about:media:detach", "AboutSectionMedia", sectionMedia.Id, "Detached media from about section", new { sectionMedia.MediaId, sectionMedia.SortOrder });
            return NoContent();
        }

        #endregion

        #region Reference Files

        [HttpGet("topics/{topicId}/references")]
        [HasPermission(PermissionConstants.AboutRead)]
        public async Task<IActionResult> GetReferences(Guid topicId)
        {
            var references = await _db.AboutReferences
                .Where(r => r.TopicId == topicId)
                .OrderBy(r => r.SortOrder)
                .ToListAsync();

            return Ok(_mapper.Map<List<AboutReferenceDto>>(references));
        }

        [HttpPost("topics/{topicId}/references/upload")]
        [HasPermission(PermissionConstants.AboutCreate)]
        public async Task<IActionResult> UploadReference(Guid topicId, [FromForm] IFormFile file, [FromForm] string? titleKm, [FromForm] string? titleEn, [FromForm] string? language)
        {
            var topic = await _db.AboutTopics.FindAsync(topicId);
            if (topic == null) return NotFound("Topic not found.");

            if (file == null || file.Length == 0) return BadRequest("No file uploaded.");

            const long maxBytes = 10 * 1024 * 1024;
            if (file.Length > maxBytes) return BadRequest("File too large. Max 10 MB.");

            if (!file.ContentType.Equals("application/pdf", StringComparison.OrdinalIgnoreCase))
                return BadRequest("Invalid file type. Only PDFs are allowed.");

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (ext != ".pdf") return BadRequest("Invalid file extension.");

            var normalizedLang = (language ?? "km").Trim().ToLowerInvariant();
            if (normalizedLang != "km" && normalizedLang != "en")
                return BadRequest("Invalid language. Use 'km' or 'en'.");

            var uploadsRoot = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "about", "references");
            Directory.CreateDirectory(uploadsRoot);

            var fileName = $"{Guid.NewGuid():N}{ext}";
            var filePath = Path.Combine(uploadsRoot, fileName);

            await using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var sortOrder = (await _db.AboutReferences
                .Where(r => r.TopicId == topicId)
                .MaxAsync(r => (int?)r.SortOrder) ?? -1) + 1;

            var safeName = Path.GetFileName(file.FileName);

            var reference = new AboutReference
            {
                TopicId = topicId,
                Language = normalizedLang,
                TitleKm = normalizedLang == "km" ? (string.IsNullOrWhiteSpace(titleKm) ? safeName : titleKm) : null,
                TitleEn = normalizedLang == "en" ? (string.IsNullOrWhiteSpace(titleEn) ? safeName : titleEn) : null,
                FileName = safeName,
                StoragePath = filePath,
                PublicUrl = $"/uploads/about/references/{fileName}",
                MimeType = file.ContentType,
                FileSizeBytes = file.Length,
                SortOrder = sortOrder,
                UploadedByUserId = GetCurrentUserId(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.AboutReferences.Add(reference);
            AddAudit("UploadReference", "AboutReference", reference.Id, topicId, null, new { reference.PublicUrl, reference.FileSizeBytes, reference.SortOrder, reference.Language });
            await _db.SaveChangesAsync();

            await WriteAuditAsync("about:reference:upload", "AboutReference", reference.Id, "Uploaded about reference", new { reference.PublicUrl, reference.FileSizeBytes, reference.SortOrder, reference.Language });

            return Ok(_mapper.Map<AboutReferenceDto>(reference));
        }

        [HttpPut("references/{referenceId}")]
        [HasPermission(PermissionConstants.AboutUpdate)]
        public async Task<IActionResult> UpdateReference(Guid referenceId, [FromBody] AboutReferenceUpdateDto dto)
        {
            var reference = await _db.AboutReferences.FindAsync(referenceId);
            if (reference == null) return NotFound();

            reference.TitleKm = dto.TitleKm;
            reference.TitleEn = dto.TitleEn;
            reference.SortOrder = dto.SortOrder;
            reference.UpdatedAt = DateTime.UtcNow;

            AddAudit("UpdateReference", "AboutReference", reference.Id, reference.TopicId, null, new { dto.TitleKm, dto.TitleEn, dto.SortOrder });
            await _db.SaveChangesAsync();

            await WriteAuditAsync("about:reference:update", "AboutReference", reference.Id, "Updated about reference", new { dto.TitleKm, dto.TitleEn, dto.SortOrder });

            return Ok(_mapper.Map<AboutReferenceDto>(reference));
        }

        [HttpDelete("references/{referenceId}")]
        [HasPermission(PermissionConstants.AboutDelete)]
        public async Task<IActionResult> DeleteReference(Guid referenceId)
        {
            var reference = await _db.AboutReferences.FindAsync(referenceId);
            if (reference == null) return NotFound();

            var uploadsRoot = Path.GetFullPath(Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "about"));
            var fullPath = Path.GetFullPath(reference.StoragePath);
            if (fullPath.StartsWith(uploadsRoot, StringComparison.OrdinalIgnoreCase) && System.IO.File.Exists(fullPath))
            {
                System.IO.File.Delete(fullPath);
            }

            AddAudit("DeleteReference", "AboutReference", reference.Id, reference.TopicId, null, new { reference.PublicUrl, reference.SortOrder });
            _db.AboutReferences.Remove(reference);
            await _db.SaveChangesAsync();

            await WriteAuditAsync("about:reference:delete", "AboutReference", reference.Id, "Deleted about reference", new { reference.PublicUrl, reference.SortOrder });
            return NoContent();
        }

        [HttpPost("topics/{topicId}/references/reorder")]
        [HasPermission(PermissionConstants.AboutUpdate)]
        public async Task<IActionResult> ReorderReferences(Guid topicId, [FromBody] List<AboutReferenceReorderDto> reorders)
        {
            var referenceIds = reorders.Select(r => r.ReferenceId).ToList();
            var references = await _db.AboutReferences
                .Where(r => r.TopicId == topicId && referenceIds.Contains(r.Id))
                .ToListAsync();

            foreach (var reference in references)
            {
                var reorder = reorders.First(r => r.ReferenceId == reference.Id);
                reference.SortOrder = reorder.SortOrder;
                reference.UpdatedAt = DateTime.UtcNow;
            }

            AddAudit("ReorderReferences", "AboutReference", null, topicId, null, reorders);
            await _db.SaveChangesAsync();

            await WriteAuditAsync("about:reference:reorder", "AboutReference", null, "Reordered about references", new { topicId, affectedCount = reorders.Count });
            return Ok();
        }

        #endregion

        #region Governance (Publish/Unpublish)

        [HttpPost("topics/{topicId}/publish")]
        [HasPermission(PermissionConstants.AboutUpdate)]
        public async Task<IActionResult> PublishTopic(Guid topicId)
        {
            var topic = await _db.AboutTopics
                .Include(t => t.Sections)
                .ThenInclude(s => s.Media)
                .FirstOrDefaultAsync(t => t.Id == topicId);

            if (topic == null) return NotFound();

            // Toggle behavior: clicking publish again on a published topic will unpublish it.
            if (topic.Status == TopicStatus.Published)
            {
                topic.Status = TopicStatus.Draft;
                topic.PublishedAt = null;
                topic.PublishedByUserId = null;
                topic.UpdatedAt = DateTime.UtcNow;
                topic.UpdatedByUserId = GetCurrentUserId();

                foreach (var section in topic.Sections)
                {
                    section.Status = TopicStatus.Draft;
                    section.UpdatedAt = DateTime.UtcNow;
                    section.UpdatedByUserId = GetCurrentUserId();
                }

                AddAudit("UnpublishTopic", "AboutTopic", topicId, topicId, null, new { topic.Slug });
                await _db.SaveChangesAsync();
                await TriggerFrontendRevalidationAsync("/Landing-page/About-us");

                await WriteAuditAsync("about:topic:unpublish", "AboutTopic", topicId, "Unpublished about topic", new { topic.Slug });

                return Ok(new { message = "Topic unpublished successfully.", action = "unpublished" });
            }

            var sectionIds = topic.Sections.Select(s => s.Id).ToHashSet();

            // Validation: Ensure all Khmer required fields are complete
            if (string.IsNullOrWhiteSpace(topic.TitleKm))
                return BadRequest("Topic Khmer title is required to publish.");

            foreach (var section in topic.Sections)
            {
                if (section.SortOrder < 0)
                    return BadRequest($"Section '{section.SectionKey}' has invalid sort order.");

                if (section.ParentSectionId.HasValue && !sectionIds.Contains(section.ParentSectionId.Value))
                    return BadRequest($"Section '{section.SectionKey}' has an invalid parent reference.");

                if (string.IsNullOrWhiteSpace(section.SectionKey))
                    return BadRequest("Section key is required to publish.");

                if (string.IsNullOrWhiteSpace(section.TitleKm) || string.IsNullOrWhiteSpace(section.ContentKm))
                    return BadRequest($"Section '{section.SectionKey}' is missing required Khmer fields.");

                foreach (var media in section.Media)
                {
                    if (media.SortOrder < 0)
                        return BadRequest($"Media in section '{section.SectionKey}' has invalid sort order.");

                    if (string.IsNullOrWhiteSpace(media.AltKm))
                        return BadRequest($"Media in section '{section.SectionKey}' is missing required Alt text for Khmer.");
                }
            }

            // Create revision snapshot
            var snapshotObj = new
            {
                Topic = _mapper.Map<AboutTopicDto>(topic),
                Sections = _mapper.Map<List<AboutSectionDto>>(topic.Sections)
            };

            var lastRevision = await _db.AboutRevisions
                .Where(r => r.TopicId == topicId)
                .OrderByDescending(r => r.RevisionNumber)
                .FirstOrDefaultAsync();

            var revisionNumber = (lastRevision?.RevisionNumber ?? 0) + 1;

            var revision = new AboutRevision
            {
                TopicId = topicId,
                SnapshotJson = JsonSerializer.Serialize(snapshotObj),
                RevisionNumber = revisionNumber,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = GetCurrentUserId(),
                ActionType = "Publish"
            };

            _db.AboutRevisions.Add(revision);
            AddAudit("PublishTopic", "AboutTopic", topicId, topicId, null, new { revisionNumber });

            topic.Status = TopicStatus.Published;
            topic.PublishedAt = DateTime.UtcNow;
            topic.PublishedByUserId = GetCurrentUserId();
            topic.UpdatedAt = DateTime.UtcNow;
            topic.UpdatedByUserId = GetCurrentUserId();

            foreach (var s in topic.Sections)
            {
                s.Status = TopicStatus.Published;
            }

            await _db.SaveChangesAsync();
            await TriggerFrontendRevalidationAsync("/Landing-page/About-us");

            await WriteAuditAsync("about:topic:publish", "AboutTopic", topicId, "Published about topic", new { revisionNumber });

            return Ok(new { message = "Topic published successfully.", revisionNumber, action = "published" });
        }

        [HttpPost("topics/{topicId}/unpublish")]
        [HasPermission(PermissionConstants.AboutUpdate)]
        public async Task<IActionResult> UnpublishTopic(Guid topicId)
        {
            var topic = await _db.AboutTopics
                .Include(t => t.Sections)
                .FirstOrDefaultAsync(t => t.Id == topicId);

            if (topic == null) return NotFound();
            if (topic.Status != TopicStatus.Published)
                return BadRequest("Topic is not currently published.");

            topic.Status = TopicStatus.Draft;
            topic.PublishedAt = null;
            topic.PublishedByUserId = null;
            topic.UpdatedAt = DateTime.UtcNow;
            topic.UpdatedByUserId = GetCurrentUserId();

            foreach (var section in topic.Sections)
            {
                section.Status = TopicStatus.Draft;
                section.UpdatedAt = DateTime.UtcNow;
                section.UpdatedByUserId = GetCurrentUserId();
            }

            AddAudit("UnpublishTopic", "AboutTopic", topicId, topicId, null, new { topic.Slug });
            await _db.SaveChangesAsync();
            await TriggerFrontendRevalidationAsync("/Landing-page/About-us");

            await WriteAuditAsync("about:topic:unpublish", "AboutTopic", topicId, "Unpublished about topic", new { topic.Slug });

            return Ok(new { message = "Topic unpublished successfully." });
        }

        [HttpGet("topics/{topicId}/revisions")]
        [HasPermission(PermissionConstants.AboutRead)]
        public async Task<IActionResult> GetRevisions(Guid topicId)
        {
            var revisions = await _db.AboutRevisions
                .Where(r => r.TopicId == topicId)
                .OrderByDescending(r => r.RevisionNumber)
                .ToListAsync();

            return Ok(_mapper.Map<List<AboutRevisionDto>>(revisions));
        }

        #endregion
    }
}

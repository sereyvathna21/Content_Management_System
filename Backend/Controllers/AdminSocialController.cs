using AutoMapper;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
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
    [Route("api/admin/social")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public class AdminSocialController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _config;

        public AdminSocialController(ApplicationDbContext db, IMapper mapper, IWebHostEnvironment env, IConfiguration config)
        {
            _db = db;
            _mapper = mapper;
            _env = env;
            _config = config;
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
            _db.SocialAuditLogs.Add(new SocialAuditLog
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
        public async Task<IActionResult> GetTopics()
        {
            var topics = await _db.SocialTopics
                .OrderBy(t => t.SortOrder)
                .ToListAsync();
            return Ok(_mapper.Map<List<SocialTopicDto>>(topics));
        }

        [HttpGet("topics/{topicId}")]
        public async Task<IActionResult> GetTopic(Guid topicId)
        {
            var topic = await _db.SocialTopics.FindAsync(topicId);
            if (topic == null) return NotFound();
            return Ok(_mapper.Map<SocialTopicDto>(topic));
        }

        [HttpPost("topics")]
        public async Task<IActionResult> CreateTopic([FromBody] SocialTopicCreateDto dto)
        {
            if (await _db.SocialTopics.AnyAsync(t => t.Slug == dto.Slug))
                return BadRequest(new { message = "Slug already exists." });

            var topic = _mapper.Map<SocialTopic>(dto);
            topic.Status = TopicStatus.Draft;
            topic.UpdatedAt = DateTime.UtcNow;
            topic.UpdatedByUserId = GetCurrentUserId();

            _db.SocialTopics.Add(topic);
            AddAudit("CreateTopic", "SocialTopic", topic.Id, topic.Id, null, new { topic.Slug, topic.TitleKm, topic.TitleEn });
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTopic), new { topicId = topic.Id }, _mapper.Map<SocialTopicDto>(topic));
        }

        [HttpPut("topics/{topicId}")]
        public async Task<IActionResult> UpdateTopic(Guid topicId, [FromBody] SocialTopicUpdateDto dto)
        {
            var topic = await _db.SocialTopics.FindAsync(topicId);
            if (topic == null) return NotFound();

            _mapper.Map(dto, topic);
            topic.UpdatedAt = DateTime.UtcNow;
            topic.UpdatedByUserId = GetCurrentUserId();

            AddAudit("UpdateTopic", "SocialTopic", topic.Id, topic.Id, null, new { dto.TitleKm, dto.TitleEn, dto.SubtitleKm, dto.SubtitleEn, dto.ReferenceKm, dto.ReferenceEn, dto.SortOrder, dto.Status });
            await _db.SaveChangesAsync();
            // If this topic is published, trigger frontend revalidation so updates appear on the landing page
            if (topic.Status == TopicStatus.Published)
            {
                await TriggerFrontendRevalidationAsync("/Landing-page/Resources/Social");
            }
            return Ok(_mapper.Map<SocialTopicDto>(topic));
        }

        [HttpDelete("topics/{topicId}")]
        public async Task<IActionResult> DeleteTopic(Guid topicId)
        {
            var topic = await _db.SocialTopics
                .Include(t => t.Sections)
                .FirstOrDefaultAsync(t => t.Id == topicId);

            if (topic == null) return NotFound();

            // Optional: Prevent deletion if there are sections, or rely on cascade.
            // Given the ApplicationDbContext has cascade delete for sections, it should work.
            // But we might want to log it.

            AddAudit("DeleteTopic", "SocialTopic", topic.Id, topic.Id, null, new { topic.Slug, topic.TitleKm });

            _db.SocialTopics.Remove(topic);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        #endregion

        #region Sections CRUD

        [HttpGet("topics/{topicId}/sections")]
        public async Task<IActionResult> GetSections(Guid topicId)
        {
            var sections = await _db.SocialSections
                .Include(s => s.Media)
                .ThenInclude(sm => sm.Media)
                .Where(s => s.TopicId == topicId)
                .OrderBy(s => s.SortOrder)
                .ToListAsync();

            // Typically frontend reconstructs the tree or backend sends nested.
            // Returning flat list sorted by order is usually fine if ParentSectionId is present.
            return Ok(_mapper.Map<List<SocialSectionDto>>(sections));
        }

        [HttpPost("topics/{topicId}/sections")]
        public async Task<IActionResult> CreateSection(Guid topicId, [FromBody] SocialSectionCreateDto dto)
        {
            var topic = await _db.SocialTopics.FindAsync(topicId);
            if (topic == null) return NotFound("Topic not found.");

            var section = _mapper.Map<SocialSection>(dto);
            section.TopicId = topicId;
            section.Status = TopicStatus.Draft;
            section.UpdatedAt = DateTime.UtcNow;
            section.UpdatedByUserId = GetCurrentUserId();

            if (dto.ParentSectionId.HasValue)
            {
                var parent = await _db.SocialSections.FindAsync(dto.ParentSectionId.Value);
                if (parent == null || parent.TopicId != topicId)
                    return BadRequest("Invalid parent section.");
                section.Depth = parent.Depth + 1;
            }
            else
            {
                section.Depth = 0;
            }

            _db.SocialSections.Add(section);
            AddAudit("CreateSection", "SocialSection", section.Id, topicId, section.Id, new { section.SectionKey, section.TitleKm, section.TitleEn, section.SortOrder, section.ParentSectionId });
            await _db.SaveChangesAsync();

            return Ok(_mapper.Map<SocialSectionDto>(section));
        }

        [HttpPut("sections/{sectionId}")]
        public async Task<IActionResult> UpdateSection(Guid sectionId, [FromBody] SocialSectionUpdateDto dto)
        {
            var section = await _db.SocialSections.FindAsync(sectionId);
            if (section == null) return NotFound();

            _mapper.Map(dto, section);
            section.UpdatedAt = DateTime.UtcNow;
            section.UpdatedByUserId = GetCurrentUserId();

            if (dto.ParentSectionId.HasValue)
            {
                var parent = await _db.SocialSections.FindAsync(dto.ParentSectionId.Value);
                if (parent == null || parent.TopicId != section.TopicId)
                    return BadRequest("Invalid parent section.");
                section.Depth = parent.Depth + 1;
            }
            else
            {
                section.Depth = 0;
            }

            AddAudit("UpdateSection", "SocialSection", section.Id, section.TopicId, section.Id, new { dto.SectionKey, dto.TitleKm, dto.TitleEn, dto.SortOrder, dto.ParentSectionId, dto.Status });
            await _db.SaveChangesAsync();
            // If the parent topic is published, trigger frontend revalidation so section changes appear immediately
            var parentTopic = await _db.SocialTopics.FindAsync(section.TopicId);
            if (parentTopic != null && parentTopic.Status == TopicStatus.Published)
            {
                await TriggerFrontendRevalidationAsync("/Landing-page/Resources/Social");
            }
            return Ok(_mapper.Map<SocialSectionDto>(section));
        }

        [HttpDelete("sections/{sectionId}")]
        public async Task<IActionResult> DeleteSection(Guid sectionId)
        {
            var section = await _db.SocialSections
                .Include(s => s.ChildSections)
                .FirstOrDefaultAsync(s => s.Id == sectionId);

            if (section == null) return NotFound();
            if (section.ChildSections.Any()) return BadRequest("Cannot delete a section with children. Delete children first.");

            AddAudit("DeleteSection", "SocialSection", section.Id, section.TopicId, section.Id, new { section.SectionKey, section.TitleKm, section.SortOrder, section.ParentSectionId });
            _db.SocialSections.Remove(section);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("topics/{topicId}/sections/reorder")]
        public async Task<IActionResult> ReorderSections(Guid topicId, [FromBody] List<SectionReorderDto> reorders)
        {
            var sectionIds = reorders.Select(r => r.SectionId).ToList();
            var sections = await _db.SocialSections
                .Where(s => s.TopicId == topicId && sectionIds.Contains(s.Id))
                .ToListAsync();

            foreach (var section in sections)
            {
                var reorder = reorders.First(r => r.SectionId == section.Id);
                section.SortOrder = reorder.SortOrder;
                section.UpdatedAt = DateTime.UtcNow;
                section.UpdatedByUserId = GetCurrentUserId();
            }

            AddAudit("ReorderSections", "SocialSection", null, topicId, null, reorders);
            await _db.SaveChangesAsync();
            return Ok();
        }

        #endregion

        #region Media Actions

        [HttpPost("media/upload")]
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

            var uploadsRoot = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "social");
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
                PublicUrl = $"/uploads/social/{fileName}",
                MimeType = file.ContentType,
                FileSize = file.Length,
                UploadedByUserId = GetCurrentUserId(),
                CreatedAt = DateTime.UtcNow
            };

            _db.Media.Add(media);
            AddAudit("UploadMedia", "Media", media.Id, null, null, new { media.PublicUrl, media.MimeType, media.FileSize });
            await _db.SaveChangesAsync();

            return Ok(_mapper.Map<MediaDto>(media));
        }

        [HttpPost("sections/{sectionId}/media")]
        public async Task<IActionResult> AttachMedia(Guid sectionId, [FromBody] SocialSectionMediaCreateDto dto)
        {
            var section = await _db.SocialSections.FindAsync(sectionId);
            if (section == null) return NotFound("Section not found.");

            var mediaItem = await _db.Media.FindAsync(dto.MediaId);
            if (mediaItem == null) return NotFound("Media not found.");

            if (string.IsNullOrWhiteSpace(dto.AltKm)) return BadRequest("Alt text (Khmer) is required.");

            var sectionMedia = _mapper.Map<SocialSectionMedia>(dto);
            sectionMedia.SectionId = sectionId;

            _db.SocialSectionMedia.Add(sectionMedia);
            AddAudit("AttachMedia", "SocialSectionMedia", sectionMedia.Id, section.TopicId, sectionId, new { sectionMedia.MediaId, sectionMedia.Position, sectionMedia.SortOrder });
            await _db.SaveChangesAsync();

            return Ok(_mapper.Map<SocialSectionMediaDto>(sectionMedia));
        }

        [HttpPut("sections/{sectionId}/media/{sectionMediaId}")]
        public async Task<IActionResult> UpdateMedia(Guid sectionId, Guid sectionMediaId, [FromBody] SocialSectionMediaUpdateDto dto)
        {
            var sectionMedia = await _db.SocialSectionMedia
                .FirstOrDefaultAsync(sm => sm.Id == sectionMediaId && sm.SectionId == sectionId);

            if (sectionMedia == null) return NotFound("Section media not found.");

            if (string.IsNullOrWhiteSpace(dto.AltKm)) return BadRequest("Alt text (Khmer) is required.");

            _mapper.Map(dto, sectionMedia);
            AddAudit("UpdateMedia", "SocialSectionMedia", sectionMedia.Id, null, sectionId, new { dto.Position, dto.SortOrder });
            await _db.SaveChangesAsync();

            return Ok(_mapper.Map<SocialSectionMediaDto>(sectionMedia));
        }

        [HttpDelete("sections/{sectionId}/media/{sectionMediaId}")]
        public async Task<IActionResult> DetachMedia(Guid sectionId, Guid sectionMediaId)
        {
            var sectionMedia = await _db.SocialSectionMedia
                .FirstOrDefaultAsync(sm => sm.Id == sectionMediaId && sm.SectionId == sectionId);

            if (sectionMedia == null) return NotFound();

            AddAudit("DetachMedia", "SocialSectionMedia", sectionMedia.Id, null, sectionId, new { sectionMedia.MediaId, sectionMedia.SortOrder });
            _db.SocialSectionMedia.Remove(sectionMedia);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        #endregion

        #region Reference Files

        [HttpGet("topics/{topicId}/references")]
        public async Task<IActionResult> GetReferences(Guid topicId)
        {
            var references = await _db.SocialReferences
                .Where(r => r.TopicId == topicId)
                .OrderBy(r => r.SortOrder)
                .ToListAsync();

            return Ok(_mapper.Map<List<SocialReferenceDto>>(references));
        }

        [HttpPost("topics/{topicId}/references/upload")]
        public async Task<IActionResult> UploadReference(Guid topicId, [FromForm] IFormFile file, [FromForm] string? titleKm, [FromForm] string? titleEn, [FromForm] string? language)
        {
            var topic = await _db.SocialTopics.FindAsync(topicId);
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

            var uploadsRoot = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "social", "references");
            Directory.CreateDirectory(uploadsRoot);

            var fileName = $"{Guid.NewGuid():N}{ext}";
            var filePath = Path.Combine(uploadsRoot, fileName);

            await using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var sortOrder = (await _db.SocialReferences
                .Where(r => r.TopicId == topicId)
                .MaxAsync(r => (int?)r.SortOrder) ?? -1) + 1;

            var safeName = Path.GetFileName(file.FileName);

            var reference = new SocialReference
            {
                TopicId = topicId,
                Language = normalizedLang,
                TitleKm = normalizedLang == "km" ? (string.IsNullOrWhiteSpace(titleKm) ? safeName : titleKm) : null,
                TitleEn = normalizedLang == "en" ? (string.IsNullOrWhiteSpace(titleEn) ? safeName : titleEn) : null,
                FileName = safeName,
                StoragePath = filePath,
                PublicUrl = $"/uploads/social/references/{fileName}",
                MimeType = file.ContentType,
                FileSizeBytes = file.Length,
                SortOrder = sortOrder,
                UploadedByUserId = GetCurrentUserId(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.SocialReferences.Add(reference);
            AddAudit("UploadReference", "SocialReference", reference.Id, topicId, null, new { reference.PublicUrl, reference.FileSizeBytes, reference.SortOrder, reference.Language });
            await _db.SaveChangesAsync();

            return Ok(_mapper.Map<SocialReferenceDto>(reference));
        }

        [HttpPut("references/{referenceId}")]
        public async Task<IActionResult> UpdateReference(Guid referenceId, [FromBody] SocialReferenceUpdateDto dto)
        {
            var reference = await _db.SocialReferences.FindAsync(referenceId);
            if (reference == null) return NotFound();

            reference.TitleKm = dto.TitleKm;
            reference.TitleEn = dto.TitleEn;
            reference.SortOrder = dto.SortOrder;
            reference.UpdatedAt = DateTime.UtcNow;

            AddAudit("UpdateReference", "SocialReference", reference.Id, reference.TopicId, null, new { dto.TitleKm, dto.TitleEn, dto.SortOrder });
            await _db.SaveChangesAsync();

            return Ok(_mapper.Map<SocialReferenceDto>(reference));
        }

        [HttpDelete("references/{referenceId}")]
        public async Task<IActionResult> DeleteReference(Guid referenceId)
        {
            var reference = await _db.SocialReferences.FindAsync(referenceId);
            if (reference == null) return NotFound();

            var uploadsRoot = Path.GetFullPath(Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "social"));
            var fullPath = Path.GetFullPath(reference.StoragePath);
            if (fullPath.StartsWith(uploadsRoot, StringComparison.OrdinalIgnoreCase) && System.IO.File.Exists(fullPath))
            {
                System.IO.File.Delete(fullPath);
            }

            AddAudit("DeleteReference", "SocialReference", reference.Id, reference.TopicId, null, new { reference.PublicUrl, reference.SortOrder });
            _db.SocialReferences.Remove(reference);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("topics/{topicId}/references/reorder")]
        public async Task<IActionResult> ReorderReferences(Guid topicId, [FromBody] List<SocialReferenceReorderDto> reorders)
        {
            var referenceIds = reorders.Select(r => r.ReferenceId).ToList();
            var references = await _db.SocialReferences
                .Where(r => r.TopicId == topicId && referenceIds.Contains(r.Id))
                .ToListAsync();

            foreach (var reference in references)
            {
                var reorder = reorders.First(r => r.ReferenceId == reference.Id);
                reference.SortOrder = reorder.SortOrder;
                reference.UpdatedAt = DateTime.UtcNow;
            }

            AddAudit("ReorderReferences", "SocialReference", null, topicId, null, reorders);
            await _db.SaveChangesAsync();
            return Ok();
        }

        #endregion

        #region Governance (Publish/Unpublish)

        [HttpPost("topics/{topicId}/publish")]
        public async Task<IActionResult> PublishTopic(Guid topicId)
        {
            var topic = await _db.SocialTopics
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

                AddAudit("UnpublishTopic", "SocialTopic", topicId, topicId, null, new { topic.Slug });
                await _db.SaveChangesAsync();
                await TriggerFrontendRevalidationAsync("/Landing-page/Resources/Social");

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
                Topic = _mapper.Map<SocialTopicDto>(topic),
                Sections = _mapper.Map<List<SocialSectionDto>>(topic.Sections)
            };

            var lastRevision = await _db.SocialRevisions
                .Where(r => r.TopicId == topicId)
                .OrderByDescending(r => r.RevisionNumber)
                .FirstOrDefaultAsync();

            var revisionNumber = (lastRevision?.RevisionNumber ?? 0) + 1;

            var revision = new SocialRevision
            {
                TopicId = topicId,
                SnapshotJson = JsonSerializer.Serialize(snapshotObj),
                RevisionNumber = revisionNumber,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = GetCurrentUserId(),
                ActionType = "Publish"
            };

            _db.SocialRevisions.Add(revision);
            AddAudit("PublishTopic", "SocialTopic", topicId, topicId, null, new { revisionNumber });

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
            await TriggerFrontendRevalidationAsync("/Landing-page/Resources/Social");

            return Ok(new { message = "Topic published successfully.", revisionNumber, action = "published" });
        }

        [HttpPost("topics/{topicId}/unpublish")]
        public async Task<IActionResult> UnpublishTopic(Guid topicId)
        {
            var topic = await _db.SocialTopics
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

            AddAudit("UnpublishTopic", "SocialTopic", topicId, topicId, null, new { topic.Slug });
            await _db.SaveChangesAsync();
            await TriggerFrontendRevalidationAsync("/Landing-page/Resources/Social");

            return Ok(new { message = "Topic unpublished successfully." });
        }

        [HttpGet("topics/{topicId}/revisions")]
        public async Task<IActionResult> GetRevisions(Guid topicId)
        {
            var revisions = await _db.SocialRevisions
                .Where(r => r.TopicId == topicId)
                .OrderByDescending(r => r.RevisionNumber)
                .ToListAsync();

            return Ok(_mapper.Map<List<SocialRevisionDto>>(revisions));
        }

        #endregion
    }
}

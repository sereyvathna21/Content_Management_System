using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Backend.Services;
using Backend.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/publications")]
    public class PublicationsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IWebHostEnvironment _env;
        private readonly INotificationService _notificationService;
        private readonly IAuditLogService _audit;
        private readonly IConfiguration _config;
        private readonly TelegramSyncQueue _telegramQueue;
        private readonly ITelegramJobBuilder _telegramJobBuilder;

        private const long MaxAttachmentBytes = 50_000_000;

        private static readonly HashSet<string> AllowedPdfContentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "application/pdf",
            "application/x-pdf"
        };

        private static readonly string[] BlockedDoubleExtensions =
        {
            ".exe",
            ".js",
            ".html",
            ".htm",
            ".bat",
            ".cmd",
            ".sh",
            ".ps1",
            ".vbs",
            ".jar",
            ".msi",
            ".dll",
            ".scr",
            ".com"
        };

        public PublicationsController(ApplicationDbContext db, IWebHostEnvironment env, INotificationService notificationService, IAuditLogService audit, IConfiguration config, TelegramSyncQueue telegramQueue, ITelegramJobBuilder telegramJobBuilder)
        {
            _db = db;
            _env = env;
            _notificationService = notificationService;
            _audit = audit;
            _config = config;
            _telegramQueue = telegramQueue;
            _telegramJobBuilder = telegramJobBuilder;
        }

        [HttpGet]
        [HasPermission(PermissionConstants.PublicationsRead)]
        public async Task<IActionResult> List(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? category = null,
            [FromQuery] string? q = null)
        {
            page = Math.Max(1, page);
            pageSize = Math.Max(1, pageSize);

            var query = _db.Publications
                .Include(p => p.Translations)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(category))
            {
                // Support special "Others" filter: group all non-NSPC categories under "Others"
                if (string.Equals(category, "Others", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(p => p.Category != null && p.Category != string.Empty && p.Category.ToLower() != "nspc");
                }
                else
                {
                    query = query.Where(p => p.Category == category);
                }
            }

            if (!string.IsNullOrWhiteSpace(q))
            {
                var qLower = q.Trim().ToLower();
                query = query.Where(p =>
                    (p.Category ?? string.Empty).ToLower().Contains(qLower) ||
                    (p.Authors ?? string.Empty).ToLower().Contains(qLower) ||
                    p.Translations.Any(t =>
                        (t.Title ?? string.Empty).ToLower().Contains(qLower) ||
                        (t.Summary ?? string.Empty).ToLower().Contains(qLower) ||
                        (t.Content ?? string.Empty).ToLower().Contains(qLower)
                    ));
            }

            var total = await query.CountAsync();

            var publications = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var items = publications.Select(publication => new PublicationDto
            {
                Id = publication.Id,
                Category = publication.Category ?? string.Empty,
                PublicationDate = publication.PublicationDate,
                Status = publication.Status,
                PublishAt = publication.PublishAt,
                Authors = publication.Authors,
                CoverImageUrl = publication.CoverImageUrl,
                Translations = publication.Translations.Select(t => new PublicationTranslationDto
                {
                    Id = t.Id,
                    Language = t.Language,
                    Category = t.Category,
                    Title = t.Title,
                    Summary = t.Summary,
                    Content = t.Content,
                    AttachmentUrl = BuildAttachmentUrl(t.AttachmentUrl)
                }).ToList()
            }).ToList();

            return Ok(new { total, page, pageSize, items });
        }

        [HttpGet("{id}")]
        [HasPermission(PermissionConstants.PublicationsRead)]
        public async Task<IActionResult> Get(Guid id)
        {
            var publication = await _db.Publications
                .Include(p => p.Translations)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (publication == null) return NotFound();

            var dto = new PublicationDto
            {
                Id = publication.Id,
                Category = publication.Category,
                PublicationDate = publication.PublicationDate,
                Status = publication.Status,
                PublishAt = publication.PublishAt,
                Authors = publication.Authors,
                CoverImageUrl = publication.CoverImageUrl,
                Translations = publication.Translations.Select(t => new PublicationTranslationDto
                {
                    Id = t.Id,
                    Language = t.Language,
                    Category = t.Category,
                    Title = t.Title,
                    Summary = t.Summary,
                    Content = t.Content,
                    AttachmentUrl = BuildAttachmentUrl(t.AttachmentUrl)
                }).ToList()
            };

            return Ok(dto);
        }

        [HttpPost]
        [HasPermission(PermissionConstants.PublicationsCreate)]
        [RequestSizeLimit(50_000_000)]
        public async Task<IActionResult> Create([FromForm] PublicationCreateDto request)
        {
            if (request == null) return BadRequest();
            if (!TryValidatePublicationRequest(request.Translations, out var validationError))
            {
                return BadRequest(new { message = validationError });
            }

            var publication = new Publication
            {
                Category = request.Category?.Trim() ?? string.Empty,
                PublicationDate = request.PublicationDate,
                Status = request.Status,
                PublishAt = request.PublishAt,
                Authors = string.IsNullOrWhiteSpace(request.Authors) ? null : request.Authors.Trim()
            };

            _db.Publications.Add(publication);
            await _db.SaveChangesAsync();

            var uploadsRoot = GetUploadsRoot(publication.Id);
            Directory.CreateDirectory(uploadsRoot);

            if (request.CoverImage != null && request.CoverImage.Length > 0)
            {
                var coverExt = Path.GetExtension(request.CoverImage.FileName);
                var coverFileName = $"cover_{Guid.NewGuid():N}{coverExt}";
                var coverFilePath = Path.Combine(uploadsRoot, coverFileName);
                await using (var stream = System.IO.File.Create(coverFilePath))
                {
                    await request.CoverImage.CopyToAsync(stream);
                }
                publication.CoverImageUrl = $"/uploads/publications/{publication.Id}/{coverFileName}";
            }

            foreach (var translation in request.Translations)
            {
                var normalizedLanguage = (translation.Language ?? string.Empty).Trim();
                string? attachmentUrl = null;

                if (translation.AttachmentFile != null && translation.AttachmentFile.Length > 0)
                {
                    if (!TryValidateAttachmentFile(translation.AttachmentFile, out var errorMessage))
                    {
                        return BadRequest(new { message = errorMessage });
                    }

                    var fileName = GenerateSafeAttachmentFileName(normalizedLanguage);
                    var filePath = Path.Combine(uploadsRoot, fileName);
                    await using (var stream = System.IO.File.Create(filePath))
                    {
                        await translation.AttachmentFile.CopyToAsync(stream);
                    }

                    attachmentUrl = $"/uploads/publications/{publication.Id}/{fileName}";
                }

                var trans = new PublicationTranslation
                {
                    PublicationId = publication.Id,
                    Language = normalizedLanguage,
                    Category = translation.Category?.Trim(),
                    Title = translation.Title.Trim(),
                    Summary = string.IsNullOrWhiteSpace(translation.Summary) ? null : translation.Summary.Trim(),
                    Content = string.IsNullOrWhiteSpace(translation.Content) ? null : translation.Content.Trim(),
                    AttachmentUrl = attachmentUrl
                };

                _db.PublicationTranslations.Add(trans);
            }

            await _db.SaveChangesAsync();

            // Send notification about the new publication
            var titleKm = request.Translations.FirstOrDefault(t => t.Language?.ToLower() == "km" || t.Language?.ToLower() == "kh")?.Title ?? "";
            var titleEn = request.Translations.FirstOrDefault(t => t.Language?.ToLower() == "en")?.Title ?? "";
            var effectiveTitle = !string.IsNullOrWhiteSpace(titleKm) ? titleKm : titleEn;
            var message = $"Publication \"{effectiveTitle}\" was created.";
            await _notificationService.SendPublicationNotificationAsync(publication, titleKm, titleEn, message, "created");

            var publicationTranslations = await _db.PublicationTranslations.Where(t => t.PublicationId == publication.Id).ToListAsync();

            if (publication.Status == ContentStatus.Published && (publication.PublishAt == null || publication.PublishAt <= DateTime.UtcNow))
            {
                var job = await _telegramJobBuilder.BuildPublicationJobAsync(publication, publicationTranslations, TelegramSyncAction.Create);
                await _telegramQueue.EnqueueAsync(job);
                publication.IsPublishedSyncTriggered = true;
                await _db.SaveChangesAsync();
            }

            await _audit.WriteAsync(new AuditLogEntry
            {
                Action = "publication:create",
                EntityType = "Publication",
                EntityId = publication.Id.ToString(),
                Summary = "Created publication",
                Status = AuditLogStatus.Success,
                Metadata = new { publication.Category, publication.PublicationDate, publication.Status, publication.PublishAt, TitleKm = titleKm, TitleEn = titleEn }
            }, HttpContext);

            return CreatedAtAction(nameof(Get), new { id = publication.Id }, new { id = publication.Id });
        }

        [HttpPut("{id}")]
        [HasPermission(PermissionConstants.PublicationsUpdate)]
        [RequestSizeLimit(50_000_000)]
        public async Task<IActionResult> Update(Guid id, [FromForm] PublicationUpdateDto request)
        {
            if (request == null) return BadRequest();
            if (!TryValidatePublicationRequest(request.Translations, out var validationError))
            {
                return BadRequest(new { message = validationError });
            }

            var publication = await _db.Publications
                .Include(p => p.Translations)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (publication == null) return NotFound();

            var previousStatus = publication.Status;

            publication.Category = request.Category?.Trim() ?? string.Empty;
            publication.PublicationDate = request.PublicationDate;
            publication.Status = request.Status;
            publication.PublishAt = request.PublishAt;
            publication.Authors = string.IsNullOrWhiteSpace(request.Authors) ? null : request.Authors.Trim();

            var uploadsRoot = GetUploadsRoot(publication.Id);
            Directory.CreateDirectory(uploadsRoot);

            if (request.CoverImage != null && request.CoverImage.Length > 0)
            {
                if (!string.IsNullOrEmpty(publication.CoverImageUrl))
                {
                    var oldPath = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), publication.CoverImageUrl.TrimStart('/'));
                    if (System.IO.File.Exists(oldPath)) System.IO.File.Delete(oldPath);
                }

                var coverExt = Path.GetExtension(request.CoverImage.FileName);
                var coverFileName = $"cover_{Guid.NewGuid():N}{coverExt}";
                var coverFilePath = Path.Combine(uploadsRoot, coverFileName);
                await using (var stream = System.IO.File.Create(coverFilePath))
                {
                    await request.CoverImage.CopyToAsync(stream);
                }
                publication.CoverImageUrl = $"/uploads/publications/{publication.Id}/{coverFileName}";
            }

            var byLanguage = publication.Translations.ToDictionary(t => t.Language, StringComparer.OrdinalIgnoreCase);
            var requestedLanguages = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (var translation in request.Translations)
            {
                var normalizedLanguage = (translation.Language ?? string.Empty).Trim();
                requestedLanguages.Add(normalizedLanguage);

                if (byLanguage.TryGetValue(normalizedLanguage, out var existing))
                {
                    existing.Title = translation.Title.Trim();
                    existing.Summary = string.IsNullOrWhiteSpace(translation.Summary) ? null : translation.Summary.Trim();
                    existing.Content = string.IsNullOrWhiteSpace(translation.Content) ? null : translation.Content.Trim();
                    existing.Category = translation.Category?.Trim();

                    if (translation.AttachmentFile != null && translation.AttachmentFile.Length > 0)
                    {
                        if (!TryValidateAttachmentFile(translation.AttachmentFile, out var errorMessage))
                        {
                            return BadRequest(new { message = errorMessage });
                        }

                        var fileName = GenerateSafeAttachmentFileName(normalizedLanguage);
                        var filePath = Path.Combine(uploadsRoot, fileName);
                        await using (var stream = System.IO.File.Create(filePath))
                        {
                            await translation.AttachmentFile.CopyToAsync(stream);
                        }

                        TryDeleteAttachmentAtUrl(existing.AttachmentUrl);
                        existing.AttachmentUrl = $"/uploads/publications/{publication.Id}/{fileName}";
                    }
                }
                else
                {
                    string? attachmentUrl = null;
                    if (translation.AttachmentFile != null && translation.AttachmentFile.Length > 0)
                    {
                        if (!TryValidateAttachmentFile(translation.AttachmentFile, out var errorMessage))
                        {
                            return BadRequest(new { message = errorMessage });
                        }

                        var fileName = GenerateSafeAttachmentFileName(normalizedLanguage);
                        var filePath = Path.Combine(uploadsRoot, fileName);
                        await using (var stream = System.IO.File.Create(filePath))
                        {
                            await translation.AttachmentFile.CopyToAsync(stream);
                        }

                        attachmentUrl = $"/uploads/publications/{publication.Id}/{fileName}";
                    }

                    var trans = new PublicationTranslation
                    {
                        PublicationId = publication.Id,
                        Language = normalizedLanguage,
                        Category = translation.Category?.Trim(),
                        Title = translation.Title.Trim(),
                        Summary = string.IsNullOrWhiteSpace(translation.Summary) ? null : translation.Summary.Trim(),
                        Content = string.IsNullOrWhiteSpace(translation.Content) ? null : translation.Content.Trim(),
                        AttachmentUrl = attachmentUrl
                    };

                    _db.PublicationTranslations.Add(trans);
                }
            }

            var toRemove = publication.Translations
                .Where(t => !requestedLanguages.Contains(t.Language))
                .ToList();

            if (toRemove.Count > 0)
            {
                foreach (var translation in toRemove)
                {
                    TryDeleteAttachmentAtUrl(translation.AttachmentUrl);
                }

                _db.PublicationTranslations.RemoveRange(toRemove);
            }

            await _db.SaveChangesAsync();

            if (publication.Status == ContentStatus.Published && (publication.PublishAt == null || publication.PublishAt <= DateTime.UtcNow))
            {
                var action = previousStatus != ContentStatus.Published ? TelegramSyncAction.Create : TelegramSyncAction.Update;
                var job = await _telegramJobBuilder.BuildPublicationJobAsync(publication, publication.Translations, action);
                await _telegramQueue.EnqueueAsync(job);
                publication.IsPublishedSyncTriggered = true;
                await _db.SaveChangesAsync();
            }
            else if (previousStatus == ContentStatus.Published && publication.Status == ContentStatus.Draft)
            {
                var job = new TelegramSyncJob
                {
                    Action = TelegramSyncAction.Delete,
                    EntityType = TelegramEntityType.Publication,
                    EntityId = publication.Id
                };
                await _telegramQueue.EnqueueAsync(job);
                publication.IsPublishedSyncTriggered = false;
                await _db.SaveChangesAsync();
            }

            // Send notification about the publication update
            var titleKm = publication.Translations.FirstOrDefault(t => t.Language?.ToLower() == "km" || t.Language?.ToLower() == "kh")?.Title ?? "";
            var titleEn = publication.Translations.FirstOrDefault(t => t.Language?.ToLower() == "en")?.Title ?? "";
            var effectiveTitle = !string.IsNullOrWhiteSpace(titleKm) ? titleKm : titleEn;
            var message = $"Publication \"{effectiveTitle}\" was updated.";
            await _notificationService.SendPublicationNotificationAsync(publication, titleKm, titleEn, message, "created");

            await _audit.WriteAsync(new AuditLogEntry
            {
                Action = "publication:update",
                EntityType = "Publication",
                EntityId = publication.Id.ToString(),
                Summary = "Updated publication",
                Status = AuditLogStatus.Success,
                Metadata = new { publication.Category, publication.PublicationDate, publication.Status, publication.PublishAt, TitleKm = titleKm, TitleEn = titleEn }
            }, HttpContext);

            return Ok(new { id = publication.Id });
        }

        [HttpDelete("{id}")]
        [HasPermission(PermissionConstants.PublicationsDelete)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var publication = await _db.Publications
                .Include(p => p.Translations)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (publication == null) return NotFound();

            // Capture titles before deletion for notification
            var titleKm = publication.Translations.FirstOrDefault(t => t.Language?.ToLower() == "km" || t.Language?.ToLower() == "kh")?.Title ?? "";
            var titleEn = publication.Translations.FirstOrDefault(t => t.Language?.ToLower() == "en")?.Title ?? "";
            var effectiveTitle = !string.IsNullOrWhiteSpace(titleKm) ? titleKm : titleEn;
            var message = $"Publication \"{effectiveTitle}\" was deleted.";
            await _notificationService.SendPublicationNotificationAsync(publication, titleKm, titleEn, message, "deleted");

            await _telegramQueue.EnqueueAsync(new TelegramSyncJob
            {
                Action = TelegramSyncAction.Delete,
                EntityType = TelegramEntityType.Publication,
                EntityId = publication.Id
            });

            await _audit.WriteAsync(new AuditLogEntry
            {
                Action = "publication:delete",
                EntityType = "Publication",
                EntityId = publication.Id.ToString(),
                Summary = "Deleted publication",
                Status = AuditLogStatus.Success,
                Metadata = new { TitleKm = titleKm, TitleEn = titleEn }
            }, HttpContext);

            _db.Publications.Remove(publication);
            await _db.SaveChangesAsync();

            var uploadsRoot = GetUploadsRoot(id);
            if (Directory.Exists(uploadsRoot))
            {
                try
                {
                    Directory.Delete(uploadsRoot, true);
                }
                catch
                {
                    // Ignore file system errors to avoid failing API after data deletion.
                }
            }

            return Ok(new { id });
        }

        private string GetUploadsRoot(Guid publicationId)
        {
            var root = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            return Path.Combine(root, "uploads", "publications", publicationId.ToString());
        }

        private static bool TryValidatePublicationRequest(IEnumerable<PublicationTranslationCreateDto> translations, out string error)
        {
            error = string.Empty;
            var list = translations?.ToList() ?? new List<PublicationTranslationCreateDto>();

            if (list.Count == 0)
            {
                error = "At least one translation is required.";
                return false;
            }

            var languages = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var hasKhTitle = false;

            foreach (var translation in list)
            {
                var lang = (translation.Language ?? string.Empty).Trim();
                var title = (translation.Title ?? string.Empty).Trim();

                if (string.IsNullOrWhiteSpace(lang))
                {
                    error = "Translation language is required.";
                    return false;
                }

                if (!languages.Add(lang))
                {
                    error = "Duplicate translation language is not allowed.";
                    return false;
                }

                if (string.IsNullOrWhiteSpace(title))
                {
                    error = $"Title is required for language '{lang}'.";
                    return false;
                }

                if (string.Equals(lang, "km", StringComparison.OrdinalIgnoreCase) && !string.IsNullOrWhiteSpace(title))
                {
                    hasKhTitle = true;
                }
            }

            if (!hasKhTitle)
            {
                error = "Khmer (km) title is required.";
                return false;
            }

            return true;
        }

        private static string GenerateSafeAttachmentFileName(string? language)
        {
            var safeLang = Regex.Replace(language ?? string.Empty, "[^a-zA-Z0-9_-]+", "-").Trim('-');
            if (string.IsNullOrWhiteSpace(safeLang))
            {
                safeLang = "publication";
            }

            return $"{safeLang}_{Guid.NewGuid():N}.pdf";
        }

        private static bool HasPdfSignature(IFormFile file)
        {
            try
            {
                using var stream = file.OpenReadStream();
                Span<byte> header = stackalloc byte[5];
                var read = stream.Read(header);
                if (read < 4)
                {
                    return false;
                }

                var headerText = Encoding.ASCII.GetString(header[..read]);
                return headerText.StartsWith("%PDF-", StringComparison.Ordinal);
            }
            catch
            {
                return false;
            }
        }

        private static bool TryValidateAttachmentFile(IFormFile file, out string errorMessage)
        {
            errorMessage = string.Empty;

            if (file.Length <= 0)
            {
                errorMessage = "Attachment file is empty.";
                return false;
            }

            if (file.Length > MaxAttachmentBytes)
            {
                errorMessage = "Attachment file is too large.";
                return false;
            }

            var ext = Path.GetExtension(file.FileName);
            if (!string.Equals(ext, ".pdf", StringComparison.OrdinalIgnoreCase))
            {
                errorMessage = "Only PDF files are allowed.";
                return false;
            }

            if (!AllowedPdfContentTypes.Contains(file.ContentType))
            {
                errorMessage = "Invalid PDF content type.";
                return false;
            }

            var baseName = Path.GetFileNameWithoutExtension(file.FileName);
            foreach (var blocked in BlockedDoubleExtensions)
            {
                if (baseName.EndsWith(blocked, StringComparison.OrdinalIgnoreCase))
                {
                    errorMessage = "PDF filename has a blocked double extension.";
                    return false;
                }
            }

            if (!HasPdfSignature(file))
            {
                errorMessage = "PDF signature validation failed.";
                return false;
            }

            return true;
        }

        private void TryDeleteAttachmentAtUrl(string? attachmentUrl)
        {
            if (string.IsNullOrWhiteSpace(attachmentUrl))
            {
                return;
            }

            var root = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var relative = attachmentUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            var fullPath = Path.GetFullPath(Path.Combine(root, relative));
            var fullRoot = Path.GetFullPath(root);

            if (!fullPath.StartsWith(fullRoot, StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            if (System.IO.File.Exists(fullPath))
            {
                try
                {
                    System.IO.File.Delete(fullPath);
                }
                catch
                {
                    // Ignore file system errors to avoid failing API after data changes.
                }
            }
        }

        private string? BuildAttachmentUrl(string? attachmentUrl)
        {
            if (string.IsNullOrWhiteSpace(attachmentUrl)) return null;
            if (Uri.TryCreate(attachmentUrl, UriKind.Absolute, out _)) return attachmentUrl;
            var baseUrl = $"{Request.Scheme}://{Request.Host.Value}";
            return attachmentUrl.StartsWith("/") ? baseUrl + attachmentUrl : $"{baseUrl}/{attachmentUrl}";
        }
    }
}

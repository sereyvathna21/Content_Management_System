using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.SignalR;
using Backend.Hubs;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/laws")]
    public class LawsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IWebHostEnvironment _env;
        private readonly IHubContext<NotificationHub> _hubContext; // Add SignalR Hub Context
        private const long MaxPdfBytes = 50_000_000;
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

        public LawsController(ApplicationDbContext db, IWebHostEnvironment env, IHubContext<NotificationHub> hubContext)
        {
            _db = db;
            _env = env;
            _hubContext = hubContext; // Initialize Hub Context
        }

        private static string BuildCreatedNotificationMessage(string lawTitle)
        {
            return $"Law \"{lawTitle}\" was created.";
        }

        private static string BuildDeletedNotificationMessage(string lawTitle)
        {
            return $"Law \"{lawTitle}\" was deleted.";
        }

        private static (string? TitleKm, string? TitleEn) GetLocalizedLawTitles(IEnumerable<LawTranslationCreateDto> translations)
        {
            var titleKm = translations
                .FirstOrDefault(t => string.Equals(t.Language, "km", StringComparison.OrdinalIgnoreCase))?.Title?.Trim();
            var titleEn = translations
                .FirstOrDefault(t => string.Equals(t.Language, "en", StringComparison.OrdinalIgnoreCase))?.Title?.Trim();

            return (
                string.IsNullOrWhiteSpace(titleKm) ? null : titleKm,
                string.IsNullOrWhiteSpace(titleEn) ? null : titleEn
            );
        }

        private static (string? TitleKm, string? TitleEn) GetLocalizedLawTitles(IEnumerable<LawTranslation> translations)
        {
            var titleKm = translations
                .FirstOrDefault(t => string.Equals(t.Language, "km", StringComparison.OrdinalIgnoreCase))?.Title?.Trim();
            var titleEn = translations
                .FirstOrDefault(t => string.Equals(t.Language, "en", StringComparison.OrdinalIgnoreCase))?.Title?.Trim();

            return (
                string.IsNullOrWhiteSpace(titleKm) ? null : titleKm,
                string.IsNullOrWhiteSpace(titleEn) ? null : titleEn
            );
        }

        private static string BuildFallbackLawTitle(string? titleKm, string? titleEn, Guid lawId)
        {
            if (!string.IsNullOrWhiteSpace(titleKm)) return titleKm;
            if (!string.IsNullOrWhiteSpace(titleEn)) return titleEn;
            return lawId.ToString();
        }

        private async Task CreateAndBroadcastNotificationAsync(string message, string kind, string? titleKm = null, string? titleEn = null)
        {
            var notification = new Notification
            {
                Message = message,
                Kind = kind,
                TitleKm = titleKm,
                TitleEn = titleEn,
                CreatedAt = DateTime.UtcNow
            };

            _db.Notifications.Add(notification);
            await _db.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveNotification", new
            {
                message = notification.Message,
                kind = notification.Kind,
                titleKm = notification.TitleKm,
                titleEn = notification.TitleEn,
                createdAt = notification.CreatedAt
            });
        }

        private string GetUploadsRoot(Guid lawId)
        {
            var root = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            return Path.Combine(root, "uploads", "laws", lawId.ToString());
        }

        private static string GenerateSafePdfFileName(string? language)
        {
            var safeLang = Regex.Replace(language ?? string.Empty, "[^a-zA-Z0-9_-]+", "-").Trim('-');
            if (string.IsNullOrWhiteSpace(safeLang))
            {
                safeLang = "law";
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

        private static bool TryValidatePdfFile(IFormFile file, out string errorMessage)
        {
            errorMessage = string.Empty;

            if (file.Length <= 0)
            {
                errorMessage = "PDF file is empty.";
                return false;
            }

            if (file.Length > MaxPdfBytes)
            {
                errorMessage = "PDF file is too large.";
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

        private void TryDeletePdfAtUrl(string? pdfUrl)
        {
            if (string.IsNullOrWhiteSpace(pdfUrl))
            {
                return;
            }

            var root = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var relative = pdfUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
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
                    // Ignore file system errors to avoid failing the API after data changes.
                }
            }
        }

        private string? BuildPdfUrl(string? pdfUrl)
        {
            if (string.IsNullOrWhiteSpace(pdfUrl)) return null;
            if (Uri.TryCreate(pdfUrl, UriKind.Absolute, out _)) return pdfUrl;
            var baseUrl = $"{Request.Scheme}://{Request.Host.Value}";
            return pdfUrl.StartsWith("/") ? baseUrl + pdfUrl : $"{baseUrl}/{pdfUrl}";
        }

        [HttpGet]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> List([FromQuery] string lang = "en", [FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? category = null, [FromQuery] string? q = null)
        {
            page = Math.Max(1, page);
            pageSize = Math.Max(1, pageSize);
            try
            {
                var query = _db.Laws.Include(l => l.Translations).AsQueryable();

                if (!string.IsNullOrWhiteSpace(category))
                {
                    query = query.Where(l => l.Category == category);
                }

                if (!string.IsNullOrWhiteSpace(q))
                {
                    var qLower = q.Trim().ToLower();
                    query = query.Where(l =>
                        (l.Category ?? string.Empty).ToLower().Contains(qLower) ||
                        l.Translations.Any(t =>
                            (t.Title ?? string.Empty).ToLower().Contains(qLower) ||
                            (t.Description ?? string.Empty).ToLower().Contains(qLower)
                        ));
                }

                var total = await query.CountAsync();

                var laws = await query
                    .OrderByDescending(l => l.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var list = laws.Select(law => new LawDto
                {
                    Id = law.Id,
                    Category = law.Category ?? string.Empty,
                    Date = law.Date,
                    Translations = law.Translations.Select(t => new LawTranslationDto
                    {
                        Id = t.Id,
                        Language = t.Language,
                        Title = t.Title,
                        Description = t.Description,
                        PdfUrl = BuildPdfUrl(t.PdfUrl)
                    }).ToList()
                }).ToList();

                return Ok(new { total, page, pageSize, items = list });
            }
            catch (Exception ex)
            {
                return Problem(ex.Message);
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> Get(Guid id, [FromQuery] string lang = "en")
        {
            var law = await _db.Laws.Include(l => l.Translations).FirstOrDefaultAsync(l => l.Id == id);
            if (law == null) return NotFound();

            var dto = new LawDto
            {
                Id = law.Id,
                Category = law.Category,
                Date = law.Date,
                Translations = law.Translations.Select(t => new LawTranslationDto
                {
                    Id = t.Id,
                    Language = t.Language,
                    Title = t.Title,
                    Description = t.Description,
                    PdfUrl = BuildPdfUrl(t.PdfUrl)
                }).ToList()
            };

            return Ok(dto);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [RequestSizeLimit(50_000_000)]
        public async Task<IActionResult> Create([FromForm] LawCreateDto request)
        {
            if (request == null) return BadRequest();

            var law = new Law
            {
                Category = request.Category,
                Date = request.Date
            };

            _db.Laws.Add(law);
            await _db.SaveChangesAsync();

            var uploadsRoot = GetUploadsRoot(law.Id);
            Directory.CreateDirectory(uploadsRoot);

            foreach (var t in request.Translations)
            {
                string? pdfUrl = null;
                if (t.PdfFile != null && t.PdfFile.Length > 0)
                {
                    if (!TryValidatePdfFile(t.PdfFile, out var errorMessage))
                    {
                        return BadRequest(new { message = errorMessage });
                    }

                    var fileName = GenerateSafePdfFileName(t.Language);
                    var filePath = Path.Combine(uploadsRoot, fileName);
                    using (var stream = System.IO.File.Create(filePath))
                    {
                        await t.PdfFile.CopyToAsync(stream);
                    }
                    pdfUrl = $"/uploads/laws/{law.Id}/{fileName}";
                }

                var trans = new LawTranslation
                {
                    LawId = law.Id,
                    Language = t.Language,
                    Title = t.Title,
                    Description = t.Description,
                    PdfUrl = pdfUrl
                };
                _db.LawTranslations.Add(trans);
            }

            await _db.SaveChangesAsync();

            var (createdTitleKm, createdTitleEn) = GetLocalizedLawTitles(request.Translations);
            var createdLawTitle = BuildFallbackLawTitle(createdTitleKm, createdTitleEn, law.Id);

            // Notify clients about the new law and keep history for future retrieval.
            await CreateAndBroadcastNotificationAsync(
                BuildCreatedNotificationMessage(createdLawTitle),
                "created",
                createdTitleKm,
                createdTitleEn);

            return CreatedAtAction(nameof(Get), new { id = law.Id }, new { id = law.Id });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        [RequestSizeLimit(50_000_000)]
        public async Task<IActionResult> Update(Guid id, [FromForm] LawUpdateDto request)
        {
            if (request == null) return BadRequest();

            var law = await _db.Laws.Include(l => l.Translations).FirstOrDefaultAsync(l => l.Id == id);
            if (law == null) return NotFound();

            law.Category = request.Category;
            law.Date = request.Date;

            var uploadsRoot = GetUploadsRoot(law.Id);
            Directory.CreateDirectory(uploadsRoot);

            var byLanguage = law.Translations.ToDictionary(t => t.Language, StringComparer.OrdinalIgnoreCase);
            var requestedLanguages = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (var t in request.Translations)
            {
                var lang = (t.Language ?? string.Empty).Trim();
                if (string.IsNullOrWhiteSpace(lang)) continue;

                requestedLanguages.Add(lang);

                if (byLanguage.TryGetValue(lang, out var existing))
                {
                    existing.Title = t.Title;
                    existing.Description = t.Description;

                    if (t.PdfFile != null && t.PdfFile.Length > 0)
                    {
                        if (!TryValidatePdfFile(t.PdfFile, out var errorMessage))
                        {
                            return BadRequest(new { message = errorMessage });
                        }

                        var fileName = GenerateSafePdfFileName(lang);
                        var filePath = Path.Combine(uploadsRoot, fileName);
                        using (var stream = System.IO.File.Create(filePath))
                        {
                            await t.PdfFile.CopyToAsync(stream);
                        }
                        TryDeletePdfAtUrl(existing.PdfUrl);
                        existing.PdfUrl = $"/uploads/laws/{law.Id}/{fileName}";
                    }
                }
                else
                {
                    string? pdfUrl = null;
                    if (t.PdfFile != null && t.PdfFile.Length > 0)
                    {
                        if (!TryValidatePdfFile(t.PdfFile, out var errorMessage))
                        {
                            return BadRequest(new { message = errorMessage });
                        }

                        var fileName = GenerateSafePdfFileName(lang);
                        var filePath = Path.Combine(uploadsRoot, fileName);
                        using (var stream = System.IO.File.Create(filePath))
                        {
                            await t.PdfFile.CopyToAsync(stream);
                        }
                        pdfUrl = $"/uploads/laws/{law.Id}/{fileName}";
                    }

                    var trans = new LawTranslation
                    {
                        LawId = law.Id,
                        Language = lang,
                        Title = t.Title,
                        Description = t.Description,
                        PdfUrl = pdfUrl
                    };
                    _db.LawTranslations.Add(trans);
                }
            }

            var toRemove = law.Translations
                .Where(tr => !requestedLanguages.Contains(tr.Language))
                .ToList();

            if (toRemove.Count > 0)
            {
                foreach (var translation in toRemove)
                {
                    TryDeletePdfAtUrl(translation.PdfUrl);
                }
                _db.LawTranslations.RemoveRange(toRemove);
            }

            await _db.SaveChangesAsync();

            return Ok(new { id = law.Id });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var law = await _db.Laws.Include(l => l.Translations).FirstOrDefaultAsync(l => l.Id == id);
            if (law == null) return NotFound();

            var (deletedTitleKm, deletedTitleEn) = GetLocalizedLawTitles(law.Translations);
            var deletedLawTitle = BuildFallbackLawTitle(deletedTitleKm, deletedTitleEn, law.Id);

            _db.Laws.Remove(law);
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
                    // Ignore file system errors to avoid failing the API after data is deleted.
                }
            }

            // Notify clients about the deleted law and keep history for future retrieval.
            await CreateAndBroadcastNotificationAsync(
                BuildDeletedNotificationMessage(deletedLawTitle),
                "deleted",
                deletedTitleKm,
                deletedTitleEn);

            return Ok(new { id });
        }
    }
}

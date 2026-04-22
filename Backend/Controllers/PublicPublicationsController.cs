using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/public/publications")]
    public class PublicPublicationsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public PublicPublicationsController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> List(
            [FromQuery] string lang = "en",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? category = null,
            [FromQuery] string? q = null)
        {
            var requestedLang = NormalizeLang(lang);
            page = Math.Max(1, page);
            pageSize = Math.Max(1, pageSize);

            var baseQuery = _db.Publications
                .Where(p => p.Translations.Any(t => t.Language.ToLower() == requestedLang));

            var categories = await baseQuery
                .Where(p => p.Category != null && p.Category != string.Empty)
                .Select(p => p.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            IQueryable<Publication> query = baseQuery.Include(p => p.Translations);

            if (!string.IsNullOrWhiteSpace(category))
            {
                // Support special "Others" filter for public listing as well
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

            var items = publications.Select(publication =>
            {
                var translation = PickTranslation(publication.Translations, requestedLang);
                return new PublicPublicationListItemDto
                {
                    Id = publication.Id,
                    Category = translation?.Category ?? publication.Category ?? string.Empty,
                    PublicationDate = publication.PublicationDate,
                    Authors = publication.Authors,
                    Language = translation?.Language ?? requestedLang,
                    Title = translation?.Title ?? string.Empty,
                    Summary = translation?.Summary,
                    Content = translation?.Content,
                    AttachmentUrl = BuildAttachmentUrl(translation?.AttachmentUrl)
                };
            }).ToList();

            return Ok(new { total, page, pageSize, categories, items });
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Get(Guid id, [FromQuery] string lang = "en")
        {
            var requestedLang = NormalizeLang(lang);
            var publication = await _db.Publications
                .Include(p => p.Translations)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (publication == null) return NotFound();

            var translation = PickTranslation(publication.Translations, requestedLang);
            if (translation == null) return NotFound();
            var selectedTranslation = translation;

            var dto = new PublicPublicationListItemDto
            {
                Id = publication.Id,
                Category = selectedTranslation.Category ?? publication.Category ?? string.Empty,
                PublicationDate = publication.PublicationDate,
                Authors = publication.Authors,
                Language = selectedTranslation.Language,
                Title = selectedTranslation.Title ?? string.Empty,
                Summary = selectedTranslation.Summary,
                Content = selectedTranslation.Content,
                AttachmentUrl = BuildAttachmentUrl(selectedTranslation.AttachmentUrl)
            };

            return Ok(dto);
        }

        private static PublicationTranslation? PickTranslation(IEnumerable<PublicationTranslation> translations, string? lang)
        {
            var list = translations?.ToList() ?? new List<PublicationTranslation>();
            if (list.Count == 0) return null;

            if (string.IsNullOrWhiteSpace(lang)) return null;
            return list.FirstOrDefault(t => string.Equals(t.Language, lang, StringComparison.OrdinalIgnoreCase));
        }

        private static string NormalizeLang(string? lang)
        {
            return string.IsNullOrWhiteSpace(lang)
                ? "en"
                : lang.Trim().ToLowerInvariant();
        }

        private string? BuildAttachmentUrl(string? attachmentUrl)
        {
            if (string.IsNullOrWhiteSpace(attachmentUrl)) return null;
            if (Uri.TryCreate(attachmentUrl, UriKind.Absolute, out var absolute) &&
                (absolute.Scheme == Uri.UriSchemeHttp || absolute.Scheme == Uri.UriSchemeHttps))
            {
                return attachmentUrl;
            }

            var baseUrl = $"{Request.Scheme}://{Request.Host.Value}";
            return attachmentUrl.StartsWith("/") ? baseUrl + attachmentUrl : $"{baseUrl}/{attachmentUrl}";
        }
    }
}

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
    [Route("api/public/laws")]
    public class PublicLawsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public PublicLawsController(ApplicationDbContext db)
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

            var baseQuery = _db.Laws
                .Where(l => l.Translations.Any(t => t.Language.ToLower() == requestedLang));

            var categories = await baseQuery
                .Where(l => l.Category != null && l.Category != string.Empty)
                .Select(l => l.Category!)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            IQueryable<Law> query = baseQuery.Include(l => l.Translations);

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

            var items = laws.Select(law =>
            {
                var translation = PickTranslation(law.Translations, requestedLang);
                return new PublicLawListItemDto
                {
                    Id = law.Id,
                    Category = translation?.Category ?? law.Category ?? string.Empty,
                    Date = law.Date,
                    Language = translation?.Language ?? requestedLang,
                    Title = translation?.Title ?? string.Empty,
                    Description = translation?.Description,
                    PdfUrl = BuildPdfUrl(translation?.PdfUrl)
                };
            }).ToList();

            return Ok(new { total, page, pageSize, categories, items });
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Get(Guid id, [FromQuery] string lang = "en")
        {
            var requestedLang = NormalizeLang(lang);
            var law = await _db.Laws.Include(l => l.Translations).FirstOrDefaultAsync(l => l.Id == id);
            if (law == null) return NotFound();

            var translation = PickTranslation(law.Translations, requestedLang);
            if (translation == null) return NotFound();
            var selectedTranslation = translation;

            var dto = new PublicLawListItemDto
            {
                Id = law.Id,
                Category = selectedTranslation.Category ?? law.Category ?? string.Empty,
                Date = law.Date,
                Language = selectedTranslation.Language,
                Title = selectedTranslation.Title ?? string.Empty,
                Description = selectedTranslation.Description,
                PdfUrl = BuildPdfUrl(selectedTranslation.PdfUrl)
            };

            return Ok(dto);
        }

        private static LawTranslation? PickTranslation(IEnumerable<LawTranslation> translations, string? lang)
        {
            if (translations == null) return null;
            var list = translations.ToList();
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

        private string? BuildPdfUrl(string? pdfUrl)
        {
            if (string.IsNullOrWhiteSpace(pdfUrl)) return null;
            if (Uri.TryCreate(pdfUrl, UriKind.Absolute, out var absolute) &&
                (absolute.Scheme == Uri.UriSchemeHttp || absolute.Scheme == Uri.UriSchemeHttps))
            {
                return pdfUrl;
            }
            var baseUrl = $"{Request.Scheme}://{Request.Host.Value}";
            return pdfUrl.StartsWith("/") ? baseUrl + pdfUrl : $"{baseUrl}/{pdfUrl}";
        }
    }
}

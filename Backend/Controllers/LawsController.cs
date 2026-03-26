using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/laws")]
    public class LawsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IWebHostEnvironment _env;

        public LawsController(ApplicationDbContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> List([FromQuery] string lang = "en", [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            page = Math.Max(1, page);
            try
            {
                var query = _db.Laws.Include(l => l.Translations).AsQueryable();
                
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
                        PdfUrl = t.PdfUrl
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
        [AllowAnonymous]
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
                    PdfUrl = t.PdfUrl
                }).ToList()
            };

            return Ok(dto);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
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

            var uploadsRoot = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "laws", law.Id.ToString());
            Directory.CreateDirectory(uploadsRoot);

            foreach (var t in request.Translations)
            {
                string? pdfUrl = null;
                if (t.PdfFile != null && t.PdfFile.Length > 0)
                {
                    var ext = Path.GetExtension(t.PdfFile.FileName);
                    var fileName = t.Language + (string.IsNullOrEmpty(ext) ? ".pdf" : ext);
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

            return CreatedAtAction(nameof(Get), new { id = law.Id }, new { id = law.Id });
        }
    }
}

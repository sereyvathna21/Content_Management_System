using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
using Backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LawController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IWebHostEnvironment _env;

        public LawController(ApplicationDbContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        // GET /api/law?page=1&pageSize=20&category=&published=true
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 100,
            [FromQuery] string? category = null,
            [FromQuery] bool? published = null)
        {
            var query = _db.Laws.OrderByDescending(l => l.CreatedAt).AsQueryable();

            if (!string.IsNullOrWhiteSpace(category))
                query = query.Where(l => l.Category == category);

            if (published.HasValue)
                query = query.Where(l => l.IsPublished == published.Value);

            var total = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            var dtos = items.Select(ToDto).ToList();
            return Ok(new { total, page, pageSize, items = dtos });
        }

        // GET /api/law/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var law = await _db.Laws.FindAsync(id);
            if (law == null) return NotFound();
            return Ok(ToDto(law));
        }

        // POST /api/law  (JSON body, auth required)
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] LawCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.TitleEn) && string.IsNullOrWhiteSpace(dto.TitleKh))
                return BadRequest("At least one title (English or Khmer) is required.");

            if (string.IsNullOrWhiteSpace(dto.Category))
                return BadRequest("Category is required.");

            var law = new Law
            {
                TitleEn = dto.TitleEn,
                TitleKh = dto.TitleKh,
                DescriptionEn = dto.DescriptionEn,
                DescriptionKh = dto.DescriptionKh,
                Category = dto.Category,
                Date = dto.Date,
                IsPublished = dto.IsPublished,
                CreatedAt = DateTime.UtcNow
            };

            _db.Laws.Add(law);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = law.Id }, ToDto(law));
        }

        // PUT /api/law/{id}  (JSON body, auth required)
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] LawUpdateDto dto)
        {
            var law = await _db.Laws.FindAsync(id);
            if (law == null) return NotFound();

            if (string.IsNullOrWhiteSpace(dto.TitleEn) && string.IsNullOrWhiteSpace(dto.TitleKh))
                return BadRequest("At least one title (English or Khmer) is required.");

            if (string.IsNullOrWhiteSpace(dto.Category))
                return BadRequest("Category is required.");

            law.TitleEn = dto.TitleEn;
            law.TitleKh = dto.TitleKh;
            law.DescriptionEn = dto.DescriptionEn;
            law.DescriptionKh = dto.DescriptionKh;
            law.Category = dto.Category;
            law.Date = dto.Date;
            law.PdfEn = dto.PdfEn;
            law.PdfKh = dto.PdfKh;
            law.IsPublished = dto.IsPublished;

            await _db.SaveChangesAsync();
            return Ok(ToDto(law));
        }

        // DELETE /api/law/{id}  (auth required)
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var law = await _db.Laws.FindAsync(id);
            if (law == null) return NotFound();

            // Delete associated PDF files if they exist
            DeletePdfFile(law.PdfEn);
            DeletePdfFile(law.PdfKh);

            _db.Laws.Remove(law);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // POST /api/law/{id}/upload-pdf?lang=en|kh
        [HttpPost("{id}/upload-pdf")]
        [Authorize]
        public async Task<IActionResult> UploadPdf(int id, [FromQuery] string lang, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            if (lang != "en" && lang != "kh")
                return BadRequest("lang must be 'en' or 'kh'.");

            if (!file.ContentType.Equals("application/pdf", StringComparison.OrdinalIgnoreCase)
                && !file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
                return BadRequest("Only PDF files are allowed.");

            var law = await _db.Laws.FindAsync(id);
            if (law == null) return NotFound();

            // Ensure upload directory exists
            var uploadsDir = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "laws");
            Directory.CreateDirectory(uploadsDir);

            // Generate a unique filename
            var uniqueName = $"law_{id}_{lang}_{Guid.NewGuid():N}.pdf";
            var filePath = Path.Combine(uploadsDir, uniqueName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Remove old file if exists
            if (lang == "en")
            {
                DeletePdfFile(law.PdfEn);
                law.PdfEn = $"/uploads/laws/{uniqueName}";
            }
            else
            {
                DeletePdfFile(law.PdfKh);
                law.PdfKh = $"/uploads/laws/{uniqueName}";
            }

            await _db.SaveChangesAsync();
            return Ok(ToDto(law));
        }

        // DELETE /api/law/{id}/pdf?lang=en|kh
        [HttpDelete("{id}/pdf")]
        [Authorize]
        public async Task<IActionResult> DeletePdf(int id, [FromQuery] string lang)
        {
            if (lang != "en" && lang != "kh")
                return BadRequest("lang must be 'en' or 'kh'.");

            var law = await _db.Laws.FindAsync(id);
            if (law == null) return NotFound();

            if (lang == "en")
            {
                DeletePdfFile(law.PdfEn);
                law.PdfEn = null;
            }
            else
            {
                DeletePdfFile(law.PdfKh);
                law.PdfKh = null;
            }

            await _db.SaveChangesAsync();
            return Ok(ToDto(law));
        }

        // ── helpers ──────────────────────────────────────────────────────

        private static LawDto ToDto(Law law) => new LawDto
        {
            Id = law.Id,
            TitleEn = law.TitleEn,
            TitleKh = law.TitleKh,
            DescriptionEn = law.DescriptionEn,
            DescriptionKh = law.DescriptionKh,
            Category = law.Category,
            Date = law.Date,
            PdfEn = law.PdfEn,
            PdfKh = law.PdfKh,
            IsPublished = law.IsPublished,
            CreatedAt = law.CreatedAt
        };

        private void DeletePdfFile(string? relativePath)
        {
            if (string.IsNullOrWhiteSpace(relativePath)) return;
            try
            {
                var wwwroot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var full = Path.Combine(wwwroot, relativePath.TrimStart('/'));
                if (System.IO.File.Exists(full))
                    System.IO.File.Delete(full);
            }
            catch
            {
                // ignore file system errors
            }
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LawController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public LawController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _db.Laws
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => new LawDto(l.Id, l.Title, l.Description, l.Category, l.Date, l.PdfUrl, l.CreatedAt, l.UpdatedAt))
                .ToListAsync();

            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var l = await _db.Laws.FindAsync(id);
            if (l == null) return NotFound();
            return Ok(new LawDto(l.Id, l.Title, l.Description, l.Category, l.Date, l.PdfUrl, l.CreatedAt, l.UpdatedAt));
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateLawDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title) || string.IsNullOrWhiteSpace(dto.Category))
                return BadRequest("Title and Category are required.");

            var law = new Law
            {
                Title = dto.Title.Trim(),
                Description = dto.Description?.Trim(),
                Category = dto.Category.Trim(),
                Date = dto.Date,
                PdfUrl = dto.PdfUrl?.Trim() ?? string.Empty,
                CreatedAt = DateTime.UtcNow
            };

            _db.Laws.Add(law);
            await _db.SaveChangesAsync();

            var result = new LawDto(law.Id, law.Title, law.Description, law.Category, law.Date, law.PdfUrl, law.CreatedAt, law.UpdatedAt);
            return CreatedAtAction(nameof(GetById), new { id = law.Id }, result);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateLawDto dto)
        {
            var law = await _db.Laws.FindAsync(id);
            if (law == null) return NotFound();

            law.Title = dto.Title.Trim();
            law.Description = dto.Description?.Trim();
            law.Category = dto.Category.Trim();
            law.Date = dto.Date;
            law.PdfUrl = dto.PdfUrl?.Trim() ?? string.Empty;
            law.UpdatedAt = DateTime.UtcNow;

            _db.Laws.Update(law);
            await _db.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            var law = await _db.Laws.FindAsync(id);
            if (law == null) return NotFound();

            _db.Laws.Remove(law);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}

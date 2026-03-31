using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
using Backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly Services.EmailService _emailService;
        private readonly Microsoft.AspNetCore.SignalR.IHubContext<Backend.Hubs.ContactHub> _hubContext;

        public ContactController(ApplicationDbContext db, Services.EmailService emailService, Microsoft.AspNetCore.SignalR.IHubContext<Backend.Hubs.ContactHub> hubContext)
        {
            _db = db;
            _emailService = emailService;
            _hubContext = hubContext;
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] ContactCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Message))
            {
                return BadRequest("Name, email and message are required.");
            }

            var contact = new Contact
            {
                Name = dto.Name,
                Email = dto.Email,
                Subject = dto.Subject ?? string.Empty,
                Message = dto.Message,
                CreatedAt = DateTime.UtcNow,
                Read = false
            };

            _db.Contacts.Add(contact);
            await _db.SaveChangesAsync();

            // Optionally notify admin email if configured
            // If you want to send an email here, call _emailService.SendOtpAsync / SendPasswordResetAsync or add a SendEmailAsync method.

            var result = new ContactDto
            {
                Id = contact.Id,
                Name = contact.Name,
                Email = contact.Email,
                Subject = contact.Subject,
                Message = contact.Message,
                CreatedAt = contact.CreatedAt,
                Read = contact.Read
            };

            // broadcast to connected clients
            try
            {
                await _hubContext.Clients.All.SendAsync("ContactCreated", result);
            }
            catch
            {
                // ignore hub errors
            }

            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? q = null, [FromQuery] string status = "all")
        {
            page = Math.Max(1, page);
            pageSize = Math.Max(1, pageSize);

            var query = _db.Contacts.AsQueryable();

            if (!string.IsNullOrWhiteSpace(q))
            {
                var qLower = q.Trim().ToLower();
                query = query.Where(c =>
                    c.Name.ToLower().Contains(qLower) ||
                    c.Email.ToLower().Contains(qLower) ||
                    c.Subject.ToLower().Contains(qLower) ||
                    c.Message.ToLower().Contains(qLower));
            }

            if (string.Equals(status, "read", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.Read);
            }
            else if (string.Equals(status, "unread", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => !c.Read);
            }

            query = query.OrderByDescending(c => c.CreatedAt);
            var total = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            var dtos = items.Select(c => new ContactDto
            {
                Id = c.Id,
                Name = c.Name,
                Email = c.Email,
                Subject = c.Subject,
                Message = c.Message,
                CreatedAt = c.CreatedAt,
                Read = c.Read
            }).ToList();

            return Ok(new { total, page, pageSize, items = dtos });
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var c = await _db.Contacts.FindAsync(id);
            if (c == null) return NotFound();
            var dto = new ContactDto
            {
                Id = c.Id,
                Name = c.Name,
                Email = c.Email,
                Subject = c.Subject,
                Message = c.Message,
                CreatedAt = c.CreatedAt,
                Read = c.Read
            };
            return Ok(dto);
        }

        [HttpPut("{id}/toggle-read")]
        [Authorize]
        public async Task<IActionResult> ToggleRead(int id)
        {
            var c = await _db.Contacts.FindAsync(id);
            if (c == null) return NotFound();
            c.Read = !c.Read;
            await _db.SaveChangesAsync();
            // broadcast read toggle to connected clients
            try
            {
                await _hubContext.Clients.All.SendAsync("ContactReadToggled", new { id = c.Id, read = c.Read });
            }
            catch
            {
                // ignore hub errors
            }

            return Ok(new { id = c.Id, read = c.Read });
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var c = await _db.Contacts.FindAsync(id);
            if (c == null) return NotFound();
            _db.Contacts.Remove(c);
            await _db.SaveChangesAsync();

            // broadcast deletion to connected clients
            try
            {
                await _hubContext.Clients.All.SendAsync("ContactDeleted", new { id = id });
            }
            catch
            {
                // ignore hub errors
            }

            return NoContent();
        }
    }
}

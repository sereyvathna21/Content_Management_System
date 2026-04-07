using Backend.Data;
using Backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/notifications")]
    [Authorize(Roles = "Admin")]
    public class NotificationsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private const int MaxTake = 100;

        public NotificationsController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> List([FromQuery] int take = 30)
        {
            take = Math.Clamp(take, 1, MaxTake);

            var notifications = await _db.Notifications
                .AsNoTracking()
                .OrderByDescending(n => n.CreatedAt)
                .Take(take)
                .Select(n => new NotificationDto
                {
                    Id = n.Id,
                    Message = n.Message,
                    Kind = n.Kind,
                    TitleKm = n.TitleKm,
                    TitleEn = n.TitleEn,
                    CreatedAt = n.CreatedAt
                })
                .ToListAsync();

            return Ok(notifications);
        }
    }
}

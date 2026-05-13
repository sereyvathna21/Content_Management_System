using AutoMapper;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/admin/media")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public class AdminMediaController : ControllerBase
    {
        private const long MaxImageBytes = 10 * 1024 * 1024;
        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
        };
        private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "image/jpeg",
            "image/png",
            "image/webp"
        };

        private readonly ApplicationDbContext _db;
        private readonly IWebHostEnvironment _env;
        private readonly IMapper _mapper;

        public AdminMediaController(ApplicationDbContext db, IWebHostEnvironment env, IMapper mapper)
        {
            _db = db;
            _env = env;
            _mapper = mapper;
        }

        private int GetCurrentUserId()
        {
            var userIdStr = User.Claims.FirstOrDefault(c => c.Type == "Id")?.Value;
            if (int.TryParse(userIdStr, out var userId)) return userId;
            return 1;
        }

        [HttpPost("upload")]
        [RequestSizeLimit(MaxImageBytes)]
        public async Task<IActionResult> Upload([FromForm] IFormFile file)
        {
            if (file == null || file.Length <= 0)
            {
                return BadRequest(new { message = "Image file is required." });
            }

            if (file.Length > MaxImageBytes)
            {
                return BadRequest(new { message = "File too large. Max 10 MB." });
            }

            var ext = Path.GetExtension(file.FileName);
            if (string.IsNullOrWhiteSpace(ext) || !AllowedExtensions.Contains(ext))
            {
                return BadRequest(new { message = "Only jpg, jpeg, png, and webp images are allowed." });
            }

            if (!AllowedContentTypes.Contains(file.ContentType))
            {
                return BadRequest(new { message = "Invalid image content type." });
            }

            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadsRoot = Path.Combine(webRoot, "uploads", "media");
            Directory.CreateDirectory(uploadsRoot);

            var fileName = $"{Guid.NewGuid():N}{ext.ToLowerInvariant()}";
            var filePath = Path.Combine(uploadsRoot, fileName);

            await using (var stream = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None))
            {
                await file.CopyToAsync(stream);
            }

            var media = new Media
            {
                StoragePath = filePath,
                PublicUrl = $"/uploads/media/{fileName}",
                MimeType = file.ContentType,
                FileSize = file.Length,
                UploadedByUserId = GetCurrentUserId(),
                CreatedAt = DateTime.UtcNow
            };

            _db.Media.Add(media);
            await _db.SaveChangesAsync();

            var dto = _mapper.Map<MediaDto>(media);
            return Ok(dto);
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Data;
using Backend.Models;
using Backend.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SettingsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IMemoryCache _cache;

        public SettingsController(ApplicationDbContext db, IMemoryCache cache)
        {
            _db = db;
            _cache = cache;
        }

        private static readonly HashSet<string> AllowedKeys = new(StringComparer.OrdinalIgnoreCase)
        {
            "TelegramBotToken",
            "TelegramChannelId",
            "SiteName",
            "SiteDescription",
            "ContactEmail"
        };

        private static readonly HashSet<string> SensitiveKeys = new(StringComparer.OrdinalIgnoreCase)
        {
            "TelegramBotToken",
            "SmtpPassword"
        };

        [HttpGet]
        [HasPermission(PermissionConstants.SettingsRead)]
        public async Task<IActionResult> GetSettings()
        {
            var rawSettings = await _db.SystemSettings.ToDictionaryAsync(s => s.Key, s => s.Value);
            var safeSettings = new Dictionary<string, string>();
            
            foreach (var kvp in rawSettings)
            {
                if (SensitiveKeys.Contains(kvp.Key))
                {
                    var val = kvp.Value ?? "";
                    if (val.Length > 4)
                        safeSettings[kvp.Key] = new string('•', 8) + val[^4..];
                    else
                        safeSettings[kvp.Key] = "••••••••";
                }
                else
                {
                    safeSettings[kvp.Key] = kvp.Value;
                }
            }

            return Ok(safeSettings);
        }

        [HttpPut]
        [HasPermission(PermissionConstants.SettingsUpdate)]
        public async Task<IActionResult> UpdateSettings([FromBody] Dictionary<string, string> request)
        {
            if (request == null) return BadRequest();

            foreach (var kvp in request)
            {
                if (!AllowedKeys.Contains(kvp.Key))
                {
                    continue; // Block unauthorized keys
                }

                // If a sensitive key comes back masked from the frontend, don't overwrite it
                if (SensitiveKeys.Contains(kvp.Key) && kvp.Value.StartsWith("••••"))
                {
                    continue;
                }

                var setting = await _db.SystemSettings.FirstOrDefaultAsync(s => s.Key == kvp.Key);
                if (setting == null)
                {
                    _db.SystemSettings.Add(new SystemSetting
                    {
                        Key = kvp.Key,
                        Value = kvp.Value,
                        UpdatedAt = DateTime.UtcNow
                    });
                }
                else
                {
                    setting.Value = kvp.Value;
                    setting.UpdatedAt = DateTime.UtcNow;
                }
                
                // Clear cache so services like Telegram fetch fresh config
                _cache.Remove($"SystemSetting_{kvp.Key}");
            }

            await _db.SaveChangesAsync();

            return Ok(new { message = "Settings updated successfully" });
        }
    }
}

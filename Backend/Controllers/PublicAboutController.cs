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
    [Route("api/public/about")]
    public class PublicAboutController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public PublicAboutController(ApplicationDbContext db)
        {
            _db = db;
        }

        private static string FallbackText(string lang, string? textKm, string? textEn)
        {
            if (lang == "km") return textKm ?? string.Empty;
            if (lang == "en") return textEn ?? string.Empty;
            return string.Empty;
        }

        private string? BuildUrl(string? rawUrl)
        {
            if (string.IsNullOrWhiteSpace(rawUrl)) return null;
            if (Uri.TryCreate(rawUrl, UriKind.Absolute, out var absolute) &&
                (absolute.Scheme == Uri.UriSchemeHttp || absolute.Scheme == Uri.UriSchemeHttps))
            {
                return rawUrl;
            }
            var baseUrl = $"{Request.Scheme}://{Request.Host.Value}";
            return rawUrl.StartsWith("/") ? baseUrl + rawUrl : $"{baseUrl}/{rawUrl}";
        }

        [HttpGet("topics")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTopics([FromQuery] string lang = "km")
        {
            var targetLang = lang.ToLower() == "en" ? "en" : "km";

            var topics = await _db.AboutTopics
                .Where(t => t.Status == TopicStatus.Published)
                .OrderBy(t => t.SortOrder)
                .ToListAsync();

            var list = topics.Select(t => new PublicAboutTopicDto
            {
                Slug = t.Slug,
                Title = FallbackText(targetLang, t.TitleKm, t.TitleEn),
                Subtitle = string.IsNullOrWhiteSpace(FallbackText(targetLang, t.SubtitleKm, t.SubtitleEn)) ? null : FallbackText(targetLang, t.SubtitleKm, t.SubtitleEn),
                Reference = string.IsNullOrWhiteSpace(FallbackText(targetLang, t.ReferenceKm, t.ReferenceEn)) ? null : FallbackText(targetLang, t.ReferenceKm, t.ReferenceEn),
                PublishedAt = t.PublishedAt,
                Sections = new List<PublicAboutSectionDto>(), // List API doesn't load heavy sections
                ReferencesKm = new List<PublicAboutReferenceDto>(),
                ReferencesEn = new List<PublicAboutReferenceDto>()
            }).ToList();

            return Ok(list);
        }

        [HttpGet("topics/{slug}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTopic(string slug, [FromQuery] string lang = "km")
        {
            var targetLang = lang.ToLower() == "en" ? "en" : "km";

            var topic = await _db.AboutTopics
                .Include(t => t.Sections)
                    .ThenInclude(s => s.Media)
                        .ThenInclude(sm => sm.Media)
                .Include(t => t.References)
                .FirstOrDefaultAsync(t => t.Slug == slug && t.Status == TopicStatus.Published);

            if (topic == null) return NotFound();

            var result = new PublicAboutTopicDto
            {
                Slug = topic.Slug,
                Title = FallbackText(targetLang, topic.TitleKm, topic.TitleEn),
                Subtitle = string.IsNullOrWhiteSpace(FallbackText(targetLang, topic.SubtitleKm, topic.SubtitleEn)) ? null : FallbackText(targetLang, topic.SubtitleKm, topic.SubtitleEn),
                Reference = string.IsNullOrWhiteSpace(FallbackText(targetLang, topic.ReferenceKm, topic.ReferenceEn)) ? null : FallbackText(targetLang, topic.ReferenceKm, topic.ReferenceEn),
                PublishedAt = topic.PublishedAt,
                Sections = BuildSectionTree(topic.Sections.Where(s => s.Status == TopicStatus.Published), targetLang, null),
                ReferencesKm = topic.References
                    .Where(r => r.Language == "km")
                    .OrderBy(r => r.SortOrder)
                    .Select(r => new PublicAboutReferenceDto
                    {
                        Title = string.IsNullOrWhiteSpace(r.TitleKm) ? r.FileName : r.TitleKm,
                        PublicUrl = BuildUrl(r.PublicUrl) ?? string.Empty,
                        FileSizeBytes = r.FileSizeBytes,
                        SortOrder = r.SortOrder
                    })
                    .ToList(),
                ReferencesEn = topic.References
                    .Where(r => r.Language == "en")
                    .OrderBy(r => r.SortOrder)
                    .Select(r => new PublicAboutReferenceDto
                    {
                        Title = string.IsNullOrWhiteSpace(r.TitleEn) ? r.FileName : r.TitleEn,
                        PublicUrl = BuildUrl(r.PublicUrl) ?? string.Empty,
                        FileSizeBytes = r.FileSizeBytes,
                        SortOrder = r.SortOrder
                    })
                    .ToList()
            };

            return Ok(result);
        }

        private List<PublicAboutSectionDto> BuildSectionTree(IEnumerable<AboutSection> allSections, string lang, Guid? parentId)
        {
            // Convert lang to ImageLanguage enum
            var targetImageLang = lang == "en" ? ImageLanguage.EN : ImageLanguage.KH;

            return allSections
                .Where(s => s.ParentSectionId == parentId)
                .OrderBy(s => s.SortOrder)
                .Select(s => new PublicAboutSectionDto
                {
                    SectionKey = s.SectionKey,
                    Title = FallbackText(lang, s.TitleKm, s.TitleEn),
                    Content = FallbackText(lang, s.ContentKm, s.ContentEn),
                    SortOrder = s.SortOrder,
                    Depth = s.Depth,
                    Media = s.Media
                        .Where(m => m.Language == targetImageLang)
                        .OrderBy(m => m.SortOrder)
                        .Select(m => new
                        {
                            PublicUrl = BuildUrl(m.Media?.PublicUrl),
                            Media = m
                        })
                        .Where(x => !string.IsNullOrWhiteSpace(x.PublicUrl))
                        .Select(x => new PublicAboutSectionMediaDto
                        {
                            PublicUrl = x.PublicUrl!,
                            Position = x.Media.Position.ToString().ToLower(),
                            Language = x.Media.Language.ToString(),
                            Caption = string.IsNullOrWhiteSpace(FallbackText(lang, x.Media.CaptionKm, x.Media.CaptionEn)) ? null : FallbackText(lang, x.Media.CaptionKm, x.Media.CaptionEn),
                            Alt = string.IsNullOrWhiteSpace(FallbackText(lang, x.Media.AltKm, x.Media.AltEn)) ? null : FallbackText(lang, x.Media.AltKm, x.Media.AltEn),
                            SortOrder = x.Media.SortOrder,
                            Width = x.Media.Width > 0 ? x.Media.Width : 75,
                            Height = x.Media.Media?.Height
                        })
                        .ToList(),
                    ChildSections = BuildSectionTree(allSections, lang, s.Id)
                }).ToList();
        }

        [HttpPost("fix-permissions")]
        [AllowAnonymous]
        public async Task<IActionResult> FixPermissions()
        {
            var permissions = new[] { "about:read", "about:create", "about:update", "about:delete" };
            var role = await _db.Roles.FirstOrDefaultAsync(r => r.Name == "SuperAdmin");
            if (role == null) return NotFound("SuperAdmin role not found");

            foreach (var p in permissions)
            {
                var perm = await _db.Permissions.FirstOrDefaultAsync(x => x.Name == p);
                if (perm == null)
                {
                    perm = new Permission { Name = p, Description = "About Us Management" };
                    _db.Permissions.Add(perm);
                    await _db.SaveChangesAsync();
                }

                if (!await _db.RolePermissions.AnyAsync(rp => rp.RoleId == role.Id && rp.PermissionId == perm.Id))
                {
                    _db.RolePermissions.Add(new RolePermission { RoleId = role.Id, PermissionId = perm.Id });
                }
            }
            await _db.SaveChangesAsync();
            return Ok("Permissions fixed");
        }

        [HttpPost("fix-seed")]
        [AllowAnonymous]
        public async Task<IActionResult> FixSeed()
        {
            var jsonPath = System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "seed_about.json");
            
            // Re-generate json if not exists
            if (!System.IO.File.Exists(jsonPath))
            {
                var code = @"
const fs = require('fs');
let c = fs.readFileSync('Frontend/app/data/aboutContent.ts', 'utf8');
c = c.replace(/export interface [\s\S]*?(?=\nexport const aboutContent)/g, '');
c = c.replace(/export const aboutContent: Record<string, AboutTopic> = /, 'module.exports = ');
fs.writeFileSync('temp.js', c);
const data = require('./temp.js');
fs.writeFileSync('seed_about.json', JSON.stringify(data, null, 2));
";
                System.IO.File.WriteAllText("temp_script.js", code);
                var process = new System.Diagnostics.Process { StartInfo = new System.Diagnostics.ProcessStartInfo { FileName = "node", Arguments = "temp_script.js", RedirectStandardOutput = true } };
                process.Start();
                process.WaitForExit();
            }

            var json = await System.IO.File.ReadAllTextAsync(jsonPath);
            var parsed = System.Text.Json.JsonDocument.Parse(json);
            
            _db.AboutTopics.RemoveRange(_db.AboutTopics);
            _db.AboutSections.RemoveRange(_db.AboutSections);
            await _db.SaveChangesAsync();

            var sortOrder = 0;
            foreach (var prop in parsed.RootElement.EnumerateObject())
            {
                var val = prop.Value;
                var slug = val.GetProperty("id").GetString()!;

                var tKm = val.GetProperty("title").GetProperty("kh").GetString()!;
                var tEn = val.GetProperty("title").GetProperty("en").GetString()!;
                var sKm = val.TryGetProperty("subtitle", out var sub) ? sub.GetProperty("kh").GetString() : null;
                var sEn = val.TryGetProperty("subtitle", out var sub2) ? sub2.GetProperty("en").GetString() : null;

                var refKm = val.TryGetProperty("reference", out var refObj) && refObj.TryGetProperty("kh", out var rKh) ? string.Join("\n", rKh.EnumerateArray().Select(x => x.GetString())) : null;
                var refEn = val.TryGetProperty("reference", out var refObj2) && refObj2.TryGetProperty("en", out var rEn) ? string.Join("\n", rEn.EnumerateArray().Select(x => x.GetString())) : null;

                var topic = new AboutTopic
                {
                    Id = Guid.NewGuid(),
                    Slug = slug,
                    TitleKm = tKm,
                    TitleEn = tEn,
                    SubtitleKm = sKm,
                    SubtitleEn = sEn,
                    ReferenceKm = refKm,
                    ReferenceEn = refEn,
                    SortOrder = sortOrder++,
                    Status = TopicStatus.Published,
                    PublishedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                // Helper to add sections
                Action<System.Text.Json.JsonElement, Guid, Guid?, int> processSections = null!;
                processSections = (sectionsArray, tId, parentId, depth) => {
                    var secOrder = 0;
                    foreach (var sec in sectionsArray.EnumerateArray())
                    {
                        var secKey = sec.GetProperty("id").GetString()!;
                        var secTKm = sec.GetProperty("title").GetProperty("kh").GetString()!;
                        var secTEn = sec.GetProperty("title").GetProperty("en").GetString()!;
                        
                        string cKm = null, cEn = null;
                        if (sec.TryGetProperty("content", out var contentArr)) {
                            var khProp = contentArr.GetProperty("kh");
                            cKm = khProp.ValueKind == System.Text.Json.JsonValueKind.String 
                                ? khProp.GetString() 
                                : string.Join("\n\n", khProp.EnumerateArray().Select(x => x.GetString()));
                                
                            var enProp = contentArr.GetProperty("en");
                            cEn = enProp.ValueKind == System.Text.Json.JsonValueKind.String 
                                ? enProp.GetString() 
                                : string.Join("\n\n", enProp.EnumerateArray().Select(x => x.GetString()));
                        }

                        var aboutSec = new AboutSection
                        {
                            Id = Guid.NewGuid(),
                            TopicId = tId,
                            ParentSectionId = parentId,
                            SectionKey = secKey,
                            TitleKm = secTKm,
                            TitleEn = secTEn,
                            ContentKm = string.IsNullOrWhiteSpace(cKm) ? " " : cKm,
                            ContentEn = string.IsNullOrWhiteSpace(cEn) ? " " : cEn,
                            SortOrder = secOrder++,
                            Depth = depth,
                            Status = TopicStatus.Published,
                            UpdatedAt = DateTime.UtcNow
                        };
                        _db.AboutSections.Add(aboutSec);

                        if (sec.TryGetProperty("subsections", out var subsecs))
                            processSections(subsecs, tId, aboutSec.Id, depth + 1);
                        if (sec.TryGetProperty("sections", out var childSecs)) // handle subTopics -> sections
                            processSections(childSecs, tId, aboutSec.Id, depth + 1);
                    }
                };

                if (val.TryGetProperty("sections", out var sections))
                    processSections(sections, topic.Id, null, 0);
                
                if (val.TryGetProperty("subTopics", out var subTopics))
                    processSections(subTopics, topic.Id, null, 0);

                _db.AboutTopics.Add(topic);
            }

            await _db.SaveChangesAsync();
            return Ok("Seeded perfectly");
        }
    }
}

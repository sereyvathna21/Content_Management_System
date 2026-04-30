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
    [Route("api/public/social")]
    public class PublicSocialController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public PublicSocialController(ApplicationDbContext db)
        {
            _db = db;
        }

        private static string FallbackText(string lang, string? textKm, string? textEn)
        {
            if (lang == "km" && !string.IsNullOrWhiteSpace(textKm)) return textKm;
            if (lang == "en" && !string.IsNullOrWhiteSpace(textEn)) return textEn;
            // Fallback to whichever is available
            return !string.IsNullOrWhiteSpace(textKm) ? textKm! : textEn ?? string.Empty;
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

            var topics = await _db.SocialTopics
                .Where(t => t.Status == TopicStatus.Published)
                .OrderBy(t => t.SortOrder)
                .ToListAsync();

            var list = topics.Select(t => new PublicSocialTopicDto
            {
                Slug = t.Slug,
                Title = FallbackText(targetLang, t.TitleKm, t.TitleEn),
                Subtitle = string.IsNullOrWhiteSpace(FallbackText(targetLang, t.SubtitleKm, t.SubtitleEn)) ? null : FallbackText(targetLang, t.SubtitleKm, t.SubtitleEn),
                PublishedAt = t.PublishedAt,
                Sections = new List<PublicSocialSectionDto>() // List API doesn't load heavy sections
            }).ToList();

            return Ok(list);
        }

        [HttpGet("topics/{slug}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTopic(string slug, [FromQuery] string lang = "km")
        {
            var targetLang = lang.ToLower() == "en" ? "en" : "km";

            var topic = await _db.SocialTopics
                .Include(t => t.Sections)
                    .ThenInclude(s => s.Media)
                        .ThenInclude(sm => sm.Media)
                .FirstOrDefaultAsync(t => t.Slug == slug && t.Status == TopicStatus.Published);

            if (topic == null) return NotFound();

            var result = new PublicSocialTopicDto
            {
                Slug = topic.Slug,
                Title = FallbackText(targetLang, topic.TitleKm, topic.TitleEn),
                Subtitle = string.IsNullOrWhiteSpace(FallbackText(targetLang, topic.SubtitleKm, topic.SubtitleEn)) ? null : FallbackText(targetLang, topic.SubtitleKm, topic.SubtitleEn),
                PublishedAt = topic.PublishedAt,
                Sections = BuildSectionTree(topic.Sections.Where(s => s.Status == TopicStatus.Published), targetLang, null)
            };

            return Ok(result);
        }

        private List<PublicSocialSectionDto> BuildSectionTree(IEnumerable<SocialSection> allSections, string lang, Guid? parentId)
        {
            return allSections
                .Where(s => s.ParentSectionId == parentId)
                .OrderBy(s => s.SortOrder)
                .Select(s => new PublicSocialSectionDto
                {
                    SectionKey = s.SectionKey,
                    Title = FallbackText(lang, s.TitleKm, s.TitleEn),
                    Content = FallbackText(lang, s.ContentKm, s.ContentEn),
                    SortOrder = s.SortOrder,
                    Depth = s.Depth,
                    Media = s.Media.OrderBy(m => m.SortOrder).Select(m => new PublicSocialSectionMediaDto
                    {
                        PublicUrl = BuildUrl(m.Media?.PublicUrl) ?? "",
                        Position = m.Position.ToString().ToLower(),
                        Caption = string.IsNullOrWhiteSpace(FallbackText(lang, m.CaptionKm, m.CaptionEn)) ? null : FallbackText(lang, m.CaptionKm, m.CaptionEn),
                        Alt = string.IsNullOrWhiteSpace(FallbackText(lang, m.AltKm, m.AltEn)) ? null : FallbackText(lang, m.AltKm, m.AltEn),
                        SortOrder = m.SortOrder,
                        Width = m.Media?.Width,
                        Height = m.Media?.Height
                    }).ToList(),
                    ChildSections = BuildSectionTree(allSections, lang, s.Id)
                }).ToList();
        }
    }
}

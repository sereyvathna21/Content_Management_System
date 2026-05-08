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

            var topics = await _db.SocialTopics
                .Where(t => t.Status == TopicStatus.Published)
                .OrderBy(t => t.SortOrder)
                .ToListAsync();

            var list = topics.Select(t => new PublicSocialTopicDto
            {
                Slug = t.Slug,
                Title = FallbackText(targetLang, t.TitleKm, t.TitleEn),
                Subtitle = string.IsNullOrWhiteSpace(FallbackText(targetLang, t.SubtitleKm, t.SubtitleEn)) ? null : FallbackText(targetLang, t.SubtitleKm, t.SubtitleEn),
                Reference = string.IsNullOrWhiteSpace(FallbackText(targetLang, t.ReferenceKm, t.ReferenceEn)) ? null : FallbackText(targetLang, t.ReferenceKm, t.ReferenceEn),
                PublishedAt = t.PublishedAt,
                Sections = new List<PublicSocialSectionDto>(), // List API doesn't load heavy sections
                ReferencesKm = new List<PublicSocialReferenceDto>(),
                ReferencesEn = new List<PublicSocialReferenceDto>()
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
                .Include(t => t.References)
                .FirstOrDefaultAsync(t => t.Slug == slug && t.Status == TopicStatus.Published);

            if (topic == null) return NotFound();

            var result = new PublicSocialTopicDto
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
                    .Select(r => new PublicSocialReferenceDto
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
                    .Select(r => new PublicSocialReferenceDto
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

        private List<PublicSocialSectionDto> BuildSectionTree(IEnumerable<SocialSection> allSections, string lang, Guid? parentId)
        {
            // Convert lang to ImageLanguage enum
            var targetImageLang = lang == "en" ? ImageLanguage.EN : ImageLanguage.KH;

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
                    Media = s.Media
                        .Where(m => m.Language == targetImageLang)
                        .OrderBy(m => m.SortOrder)
                        .Select(m => new
                        {
                            PublicUrl = BuildUrl(m.Media?.PublicUrl),
                            Media = m
                        })
                        .Where(x => !string.IsNullOrWhiteSpace(x.PublicUrl))
                        .Select(x => new PublicSocialSectionMediaDto
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
    }
}

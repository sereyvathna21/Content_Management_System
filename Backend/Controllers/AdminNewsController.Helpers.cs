using Backend.DTOs;
using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    public partial class AdminNewsController
    {
        private static string NormalizeSlug(string? slug)
        {
            return (slug ?? string.Empty).Trim().ToLowerInvariant();
        }

        private static string NormalizeLang(string? lang)
        {
            var normalized = (lang ?? string.Empty).Trim().ToLowerInvariant();
            if (normalized == "kh") return "km";
            return normalized;
        }

        private static bool TryParseStatus(string raw, out ContentStatus status)
        {
            return Enum.TryParse(raw, true, out status);
        }

        private static bool TryValidateNewsRequest(
            string slug,
            string category,
            ContentStatus status,
            DateTime? publishAt,
            string? imageUrl,
            Guid? imageMediaId,
            string? imageAltKh,
            List<NewsArticleTranslationCreateDto> translations,
            out string error)
        {
            error = string.Empty;
            if (string.IsNullOrWhiteSpace(slug))
            {
                error = "Slug is required.";
                return false;
            }

            if (string.IsNullOrWhiteSpace(category))
            {
                error = "Category is required.";
                return false;
            }

            var list = translations ?? new List<NewsArticleTranslationCreateDto>();
            if (list.Count == 0)
            {
                error = "At least one translation is required.";
                return false;
            }

            var languages = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var requiresFullTranslations = status == ContentStatus.Published;

            foreach (var translation in list)
            {
                var lang = NormalizeLang(translation.Language);
                if (string.IsNullOrWhiteSpace(lang))
                {
                    error = "Translation language is required.";
                    return false;
                }

                if (!languages.Add(lang))
                {
                    error = "Duplicate translation language is not allowed.";
                    return false;
                }

                if (requiresFullTranslations)
                {
                    if (string.IsNullOrWhiteSpace(translation.Title))
                    {
                        error = $"Title is required for language '{lang}'.";
                        return false;
                    }

                    if (string.IsNullOrWhiteSpace(translation.Excerpt))
                    {
                        error = $"Excerpt is required for language '{lang}'.";
                        return false;
                    }
                }
            }

            if (status == ContentStatus.Published)
            {
                if (publishAt == null)
                {
                    error = "PublishAt is required when status is Published.";
                    return false;
                }

                if (string.IsNullOrWhiteSpace(imageUrl) && imageMediaId == null)
                {
                    error = "Image is required before publishing.";
                    return false;
                }

                if (!string.IsNullOrWhiteSpace(imageUrl) || imageMediaId != null)
                {
                    if (string.IsNullOrWhiteSpace(imageAltKh))
                    {
                        error = "ImageAltKh is required when an image is set.";
                        return false;
                    }
                }

                if (!languages.Contains("km"))
                {
                    error = "Khmer (km) translation is required for publish.";
                    return false;
                }
            }

            return true;
        }

        private static bool TryValidateNewsForPublish(NewsArticle article, out string error)
        {
            error = string.Empty;

            if (string.IsNullOrWhiteSpace(article.Slug))
            {
                error = "Slug is required.";
                return false;
            }

            if (string.IsNullOrWhiteSpace(article.Category))
            {
                error = "Category is required.";
                return false;
            }

            if (article.PublishAt == null)
            {
                error = "PublishAt is required when status is Published.";
                return false;
            }

            if (string.IsNullOrWhiteSpace(article.ImageUrl) && article.ImageMediaId == null)
            {
                error = "Image is required before publishing.";
                return false;
            }

            if (!string.IsNullOrWhiteSpace(article.ImageUrl) || article.ImageMediaId != null)
            {
                if (string.IsNullOrWhiteSpace(article.ImageAltKh))
                {
                    error = "ImageAltKh is required when an image is set.";
                    return false;
                }
            }

            var hasKm = article.Translations.Any(t =>
                string.Equals(NormalizeLang(t.Language), "km", StringComparison.OrdinalIgnoreCase));
            if (!hasKm)
            {
                error = "Khmer (km) translation is required for publish.";
                return false;
            }

            var missing = article.Translations.FirstOrDefault(t =>
                string.IsNullOrWhiteSpace(t.Title) || string.IsNullOrWhiteSpace(t.Excerpt));
            if (missing != null)
            {
                error = "Each translation requires a title and excerpt.";
                return false;
            }

            return true;
        }

        private static NewsArticleDto MapAdminDto(NewsArticle article)
        {
            return new NewsArticleDto
            {
                Id = article.Id,
                Slug = article.Slug,
                Category = article.Category ?? string.Empty,
                Status = article.Status,
                PublishAt = article.PublishAt,
                ImageUrl = article.ImageUrl,
                ImageMediaId = article.ImageMediaId,
                ImageAltKh = article.ImageAltKh,
                ImageAltEn = article.ImageAltEn,
                Featured = article.Featured,
                SortOrder = article.SortOrder,
                CreatedAt = article.CreatedAt,
                UpdatedAt = article.UpdatedAt,
                DeletedAt = article.DeletedAt,
                Translations = article.Translations.Select(t => new NewsArticleTranslationDto
                {
                    Id = t.Id,
                    Language = NormalizeLang(t.Language),
                    Title = t.Title,
                    Excerpt = t.Excerpt,
                    Subtitle = t.Subtitle,
                    ContentHtml = t.ContentHtml,
                    ContentMd = t.ContentMd,
                    MetaTitle = t.MetaTitle,
                    MetaDescription = t.MetaDescription,
                    CanonicalUrl = t.CanonicalUrl
                }).ToList()
            };
        }

        private async Task TriggerFrontendRevalidationAsync(IEnumerable<string> paths)
        {
            try
            {
                var frontendUrl = _config["FrontendUrl"] ?? "http://localhost:3000";
                var secret = _config["RevalidateSecret"] ?? "fallback-secret-123";
                using var client = new HttpClient();
                client.Timeout = TimeSpan.FromSeconds(5);

                foreach (var path in paths.Where(p => !string.IsNullOrWhiteSpace(p)).Distinct())
                {
                    var payload = new { secret = secret, path = path };
                    var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                    await client.PostAsync($"{frontendUrl.TrimEnd('/')}/api/revalidate", content);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to trigger frontend revalidation: {ex.Message}");
            }
        }
    }
}

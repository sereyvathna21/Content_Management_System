using Backend.DTOs;
using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    public partial class AdminVideosController
    {
        private static bool TryParseStatus(string raw, out ContentStatus status)
        {
            return Enum.TryParse(raw, true, out status);
        }

        private static bool TryValidateVideoRequest(
            string title,
            string description,
            string embedUrl,
            string category,
            ContentStatus status,
            DateTime? publishAt,
            out string error)
        {
            error = string.Empty;

            if (string.IsNullOrWhiteSpace(title))
            {
                error = "Title is required.";
                return false;
            }

            if (string.IsNullOrWhiteSpace(description))
            {
                error = "Description is required.";
                return false;
            }

            if (string.IsNullOrWhiteSpace(embedUrl))
            {
                error = "EmbedUrl is required.";
                return false;
            }

            if (string.IsNullOrWhiteSpace(category))
            {
                error = "Category is required.";
                return false;
            }

            if (status == ContentStatus.Published)
            {
                if (!IsAllowedEmbedUrl(embedUrl))
                {
                    error = "EmbedUrl must be from YouTube, Vimeo, or Facebook.";
                    return false;
                }

                if (publishAt == null)
                {
                    error = "PublishAt is required when status is Published.";
                    return false;
                }
            }

            return true;
        }

        private static bool TryValidateVideoForPublish(Video video, out string error)
        {
            error = string.Empty;

            if (string.IsNullOrWhiteSpace(video.Title))
            {
                error = "Title is required.";
                return false;
            }

            if (string.IsNullOrWhiteSpace(video.Description))
            {
                error = "Description is required.";
                return false;
            }

            if (string.IsNullOrWhiteSpace(video.EmbedUrl))
            {
                error = "EmbedUrl is required.";
                return false;
            }

            if (!IsAllowedEmbedUrl(video.EmbedUrl))
            {
                error = "EmbedUrl must be from YouTube, Vimeo, or Facebook.";
                return false;
            }

            if (string.IsNullOrWhiteSpace(video.Category))
            {
                error = "Category is required.";
                return false;
            }

            if (video.PublishAt == null)
            {
                error = "PublishAt is required when status is Published.";
                return false;
            }

            return true;
        }

        private static bool IsAllowedEmbedUrl(string embedUrl)
        {
            if (!TryNormalizeEmbedUrl(embedUrl, out var normalizedEmbedUrl))
            {
                return false;
            }

            if (!Uri.TryCreate(normalizedEmbedUrl, UriKind.Absolute, out var uri))
            {
                return false;
            }

            if (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps)
            {
                return false;
            }

            var host = uri.Host.ToLowerInvariant();
            return host.Contains("youtube.com") ||
                   host.Contains("youtu.be") ||
                   host.Contains("vimeo.com") ||
                   host.Contains("facebook.com");
        }

        private static bool TryNormalizeEmbedUrl(string raw, out string normalized)
        {
            normalized = string.Empty;

            if (string.IsNullOrWhiteSpace(raw))
            {
                return false;
            }

            var value = raw.Trim();

            // Supports pasting full iframe markup by extracting src.
            var iframeSrcMatch = Regex.Match(
                value,
                @"src\s*=\s*[\""\'](?<url>https?://[^\""\']+)[\""\']",
                RegexOptions.IgnoreCase);

            if (iframeSrcMatch.Success)
            {
                value = iframeSrcMatch.Groups["url"].Value;
            }
            else
            {
                // Supports pasting URL followed by HTML attributes.
                var urlMatch = Regex.Match(value, @"https?://[^\""'\s<>]+", RegexOptions.IgnoreCase);
                if (urlMatch.Success)
                {
                    value = urlMatch.Value;
                }
            }

            value = value.Trim().Trim('"', '\'');
            normalized = value;

            return Uri.TryCreate(normalized, UriKind.Absolute, out _);
        }

        private static VideoDto MapAdminDto(Video video)
        {
            return new VideoDto
            {
                Id = video.Id,
                Title = video.Title,
                Description = video.Description,
                EmbedUrl = video.EmbedUrl,
                Category = video.Category,
                Status = video.Status,
                PublishAt = video.PublishAt,
                Featured = video.Featured,
                SortOrder = video.SortOrder,
                CreatedAt = video.CreatedAt,
                UpdatedAt = video.UpdatedAt,
                DeletedAt = video.DeletedAt
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

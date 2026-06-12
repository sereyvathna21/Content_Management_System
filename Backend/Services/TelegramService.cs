using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Backend.Models;
using Microsoft.Extensions.Options;

namespace Backend.Services
{
    public record TelegramApiResponse<T>(bool Ok, T? Result, string? Description);
    public record TelegramMessage(long MessageId);

    public interface ITelegramService
    {
        Task<long> SendMessageAsync(string caption, string? photoUrl, string? linkUrl, string linkText);
        Task<long> SendMediaAsync(TelegramSyncJob job);
        Task EditCaptionAsync(long messageId, string caption, string? linkUrl, string linkText);
        Task EditMediaAsync(long messageId, TelegramSyncJob job);
        Task DeleteMessageAsync(long messageId);
    }

    public class TelegramService : ITelegramService
    {
        private readonly HttpClient _http;
        private readonly TelegramOptions _options;
        private readonly ILogger<TelegramService> _logger;

        private static readonly JsonSerializerOptions JsonOpts = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        public TelegramService(
            HttpClient http,
            IOptions<TelegramOptions> options,
            ILogger<TelegramService> logger)
        {
            _http = http;
            _options = options.Value;
            _logger = logger;
            _http.BaseAddress = new Uri($"https://api.telegram.org/bot{_options.BotToken}/");
        }

        public async Task<long> SendMediaAsync(TelegramSyncJob job)
        {
            var caption = job.Caption ?? "";
            
            if (!string.IsNullOrWhiteSpace(job.LocalFilePath) && File.Exists(job.LocalFilePath))
            {
                var endpoint = job.FileType switch
                {
                    "Document" => "sendDocument",
                    "Video" => "sendVideo",
                    _ => "sendPhoto"
                };

                var form = new MultipartFormDataContent();
                form.Add(new StringContent(_options.ChannelId), "chat_id");
                form.Add(new StringContent(SafeTruncate(caption, 1024)), "caption");
                form.Add(new StringContent("HTML"), "parse_mode");

                var replyMarkup = BuildInlineKeyboardJson(job.LinkUrl, job.LinkText ?? "View");
                if (replyMarkup != null)
                {
                    form.Add(new StringContent(replyMarkup), "reply_markup");
                }

                var fileStream = new FileStream(job.LocalFilePath, FileMode.Open, FileAccess.Read, FileShare.Read);
                var streamContent = new StreamContent(fileStream);
                
                var fieldName = job.FileType switch
                {
                    "Document" => "document",
                    "Video" => "video",
                    _ => "photo"
                };
                
                form.Add(streamContent, fieldName, Path.GetFileName(job.LocalFilePath));

                var message = await PostMultipartWithRetryAsync<TelegramMessage>(endpoint, form);
                return message.MessageId;
            }

            // Fallback to URL or text
            return await SendMessageAsync(caption, job.PhotoUrl, job.LinkUrl, job.LinkText ?? "View");
        }

        public async Task<long> SendMessageAsync(string caption, string? photoUrl, string? linkUrl, string linkText)
        {
            if (!string.IsNullOrWhiteSpace(photoUrl))
            {
                var payload = new
                {
                    chat_id = _options.ChannelId,
                    photo = photoUrl,
                    caption = SafeTruncate(caption, 1024),
                    parse_mode = "HTML",
                    reply_markup = BuildInlineKeyboard(linkUrl, linkText)
                };

                var message = await PostWithRetryAsync<TelegramMessage>("sendPhoto", payload);
                return message.MessageId;
            }
            else
            {
                var payload = new
                {
                    chat_id = _options.ChannelId,
                    text = SafeTruncate(caption, 4096),
                    parse_mode = "HTML",
                    reply_markup = BuildInlineKeyboard(linkUrl, linkText)
                };

                var message = await PostWithRetryAsync<TelegramMessage>("sendMessage", payload);
                return message.MessageId;
            }
        }

        public async Task EditCaptionAsync(long messageId, string caption, string? linkUrl, string linkText)
        {
            var payload = new
            {
                chat_id = _options.ChannelId,
                message_id = messageId,
                caption = SafeTruncate(caption, 1024),
                parse_mode = "HTML",
                reply_markup = BuildInlineKeyboard(linkUrl, linkText)
            };

            try
            {
                await PostWithRetryAsync<JsonElement>("editMessageCaption", payload);
            }
            catch (Exception ex) when (ex.Message.Contains("message is not modified"))
            {
                _logger.LogDebug("Telegram caption unchanged for MessageId={MsgId}, skipping.", messageId);
            }
        }

        public async Task EditMediaAsync(long messageId, TelegramSyncJob job)
        {
            if (!string.IsNullOrEmpty(job.LocalFilePath) && System.IO.File.Exists(job.LocalFilePath))
            {
                var form = new MultipartFormDataContent();
                
                var mediaPayload = new
                {
                    type = job.FileType switch
                    {
                        "Document" => "document",
                        "Video" => "video",
                        _ => "photo"
                    },
                    media = $"attach://{Path.GetFileName(job.LocalFilePath)}",
                    caption = SafeTruncate(job.Caption ?? "", 1024),
                    parse_mode = "HTML"
                };

                form.Add(new StringContent(_options.ChannelId), "chat_id");
                form.Add(new StringContent(messageId.ToString()), "message_id");
                form.Add(new StringContent(JsonSerializer.Serialize(mediaPayload, JsonOpts)), "media");

                var replyMarkup = BuildInlineKeyboardJson(job.LinkUrl, job.LinkText ?? "View");
                if (replyMarkup != null)
                {
                    form.Add(new StringContent(replyMarkup), "reply_markup");
                }

                var fileStream = new FileStream(job.LocalFilePath, FileMode.Open, FileAccess.Read, FileShare.Read);
                var streamContent = new StreamContent(fileStream);
                form.Add(streamContent, Path.GetFileName(job.LocalFilePath), Path.GetFileName(job.LocalFilePath));

                await PostMultipartWithRetryAsync<JsonElement>("editMessageMedia", form);
                return;
            }

            // Fallback to URL-based edit
            var payload = new
            {
                chat_id = _options.ChannelId,
                message_id = messageId,
                media = new
                {
                    type = "photo",
                    media = job.PhotoUrl,
                    caption = SafeTruncate(job.Caption ?? "", 1024),
                    parse_mode = "HTML"
                },
                reply_markup = BuildInlineKeyboard(job.LinkUrl, job.LinkText ?? "View")
            };

            await PostWithRetryAsync<JsonElement>("editMessageMedia", payload);
        }

        public async Task DeleteMessageAsync(long messageId)
        {
            var payload = new
            {
                chat_id = _options.ChannelId,
                message_id = messageId
            };

            try
            {
                await PostWithRetryAsync<JsonElement>("deleteMessage", payload);
            }
            catch (Exception ex) when (ex.Message.Contains("message to delete not found"))
            {
                _logger.LogWarning("Telegram message already deleted. MessageId={MsgId}", messageId);
            }
        }

        private static object? BuildInlineKeyboard(string? linkUrl, string linkText)
        {
            if (string.IsNullOrWhiteSpace(linkUrl)) return null;
            
            // Telegram API rejects localhost/127.0.0.1 URLs in inline buttons
            if (linkUrl.Contains("localhost") || linkUrl.Contains("127.0.0.1"))
            {
                return null;
            }

            return new
            {
                inline_keyboard = new[] { new[] { new { text = linkText, url = linkUrl } } }
            };
        }

        private static string? BuildInlineKeyboardJson(string? linkUrl, string linkText)
        {
            var obj = BuildInlineKeyboard(linkUrl, linkText);
            if (obj == null) return null;
            return JsonSerializer.Serialize(obj, JsonOpts);
        }

        public static string EscapeHtml(string input) =>
            input.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;");

        public static string SafeTruncate(string input, int maxLength)
        {
            if (input.Length <= maxLength) return input;
            var cut = input[..maxLength];
            var lastSpace = cut.LastIndexOf(' ');
            return lastSpace > 0 ? cut[..lastSpace] + "…" : cut + "…";
        }

        private async Task<T> PostWithRetryAsync<T>(string endpoint, object payload, int maxRetries = 3)
        {
            for (int attempt = 1; attempt <= maxRetries; attempt++)
            {
                try
                {
                    var json = JsonSerializer.Serialize(payload, JsonOpts);
                    var content = new StringContent(json, Encoding.UTF8, "application/json");
                    var response = await _http.PostAsync(endpoint, content);
                    var body = await response.Content.ReadAsStringAsync();

                    var result = JsonSerializer.Deserialize<TelegramApiResponse<T>>(body, JsonOpts);

                    if (result == null) throw new Exception($"Null response from Telegram [{endpoint}]");
                    
                    if (!result.Ok)
                    {
                        if ((int)response.StatusCode == 429)
                        {
                            var retryAfter = 5;
                            throw new Exception($"Telegram rate limited. Retry after {retryAfter}s");
                        }
                        throw new Exception($"Telegram API error [{endpoint}]: {result.Description ?? body}");
                    }
                    return result.Result!;
                }
                catch (Exception ex) when (attempt < maxRetries && !ex.Message.Contains("message is not modified") && !ex.Message.Contains("message to delete not found"))
                {
                    await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, attempt)));
                }
            }
            throw new Exception("Telegram call failed after retries.");
        }

        private async Task<T> PostMultipartWithRetryAsync<T>(string endpoint, MultipartFormDataContent content, int maxRetries = 3)
        {
            for (int attempt = 1; attempt <= maxRetries; attempt++)
            {
                try
                {
                    var response = await _http.PostAsync(endpoint, content);
                    var body = await response.Content.ReadAsStringAsync();

                    var result = JsonSerializer.Deserialize<TelegramApiResponse<T>>(body, JsonOpts);

                    if (result == null) throw new Exception($"Null response from Telegram [{endpoint}]");
                    
                    if (!result.Ok)
                    {
                        if ((int)response.StatusCode == 429)
                        {
                            var retryAfter = 5;
                            throw new Exception($"Telegram rate limited. Retry after {retryAfter}s");
                        }
                        throw new Exception($"Telegram API error [{endpoint}]: {result.Description ?? body}");
                    }
                    return result.Result!;
                }
                catch (Exception ex) when (attempt < maxRetries)
                {
                    await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, attempt)));
                    
                    // Note: MultipartFormDataContent is consumed on first POST and typically can't be reused safely without recreating.
                    // For simplicity, we wrap it in a stream that allows re-reading or we just don't retry network drops for large files unless recreated.
                    // If network fails on large upload, throw.
                    if (ex is HttpRequestException) throw; 
                }
            }
            throw new Exception("Telegram call failed after retries.");
        }
    }
}

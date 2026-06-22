using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Backend.Services
{
    public record TelegramApiResponse<T>(bool Ok, T? Result, string? Description);
    public record TelegramMessage(long MessageId);

    public interface ITelegramService
    {
        Task<long> SendMessageAsync(string caption, string? photoUrl, string? linkUrl, string linkText);
        Task<long[]> SendMediaAsync(TelegramSyncJob job);
        Task EditCaptionAsync(long messageId, string caption, string? linkUrl, string linkText);
        Task EditMediaAsync(long messageId, TelegramSyncJob job);
        Task DeleteMessageAsync(long messageId);
    }

    public class TelegramService : ITelegramService
    {
        private readonly HttpClient _http;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly TelegramOptions _options;
        private readonly ILogger<TelegramService> _logger;

        private static readonly JsonSerializerOptions JsonOpts = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        public TelegramService(
            HttpClient http,
            IServiceScopeFactory scopeFactory,
            IOptions<TelegramOptions> options,
            ILogger<TelegramService> logger)
        {
            _http = http;
            _scopeFactory = scopeFactory;
            _options = options.Value;
            _logger = logger;
        }

        private async Task<(string BotToken, string ChannelId)> GetConfigAsync()
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var cache = scope.ServiceProvider.GetRequiredService<IMemoryCache>();

            var botToken = await cache.GetOrCreateAsync("SystemSetting_TelegramBotToken", async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10);
                var setting = await db.SystemSettings.FirstOrDefaultAsync(s => s.Key == "TelegramBotToken");
                return setting?.Value;
            });

            var channelId = await cache.GetOrCreateAsync("SystemSetting_TelegramChannelId", async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10);
                var setting = await db.SystemSettings.FirstOrDefaultAsync(s => s.Key == "TelegramChannelId");
                return setting?.Value;
            });

            var finalBotToken = !string.IsNullOrWhiteSpace(botToken) ? botToken : _options.BotToken;
            var finalChannelId = !string.IsNullOrWhiteSpace(channelId) ? channelId : _options.ChannelId;

            return (finalBotToken ?? string.Empty, finalChannelId ?? string.Empty);
        }

        public async Task<long[]> SendMediaAsync(TelegramSyncJob job)
        {
            var (botToken, channelId) = await GetConfigAsync();
            if (string.IsNullOrWhiteSpace(botToken) || string.IsNullOrWhiteSpace(channelId))
            {
                _logger.LogWarning("Telegram bot token or channel ID is missing. Skipping SendMediaAsync.");
                return Array.Empty<long>();
            }

            var caption = job.Caption ?? "";
            
            _logger.LogInformation("SendMediaAsync: FileType={FileType}, LocalFilePath={LocalFilePath}, FileExists={FileExists}", 
                job.FileType, job.LocalFilePath, 
                !string.IsNullOrWhiteSpace(job.LocalFilePath) && File.Exists(job.LocalFilePath));
            
            var existingFilePaths = job.LocalFilePaths?
                .Where(p => !string.IsNullOrWhiteSpace(p) && File.Exists(p))
                .ToList() ?? new List<string>();

            // Fallback for single file job
            if (existingFilePaths.Count == 0 && !string.IsNullOrWhiteSpace(job.LocalFilePath) && File.Exists(job.LocalFilePath))
            {
                existingFilePaths.Add(job.LocalFilePath);
            }

            if (existingFilePaths.Count > 0)
            {
                const long MaxTelegramFileSize = 50 * 1024 * 1024; // 50 MB
                var firstFileInfo = new FileInfo(existingFilePaths.First());
                
                if (firstFileInfo.Length > MaxTelegramFileSize)
                {
                    _logger.LogWarning("SendMediaAsync: File {FileName} is {SizeMB:F1} MB which exceeds Telegram's 50 MB limit. Falling back to text-only message.",
                        Path.GetFileName(existingFilePaths.First()), firstFileInfo.Length / (1024.0 * 1024.0));
                }
                else if (existingFilePaths.Count > 1)
                {
                    // MediaGroup branch
                    var endpoint = "sendMediaGroup";
                    _logger.LogInformation("SendMediaAsync: Using endpoint={Endpoint} for {Count} files", endpoint, existingFilePaths.Count);
                    
                    var appendedCaption = caption;
                    if (!string.IsNullOrWhiteSpace(job.LinkUrl))
                    {
                        appendedCaption += $"\n\n<a href=\"{job.LinkUrl}\">{job.LinkText ?? "📰 អានអត្ថបទ"}</a>";
                    }

                    var messages = await PostMultipartWithRetryAsync<TelegramMessage[]>(botToken, endpoint, () =>
                    {
                        var form = new MultipartFormDataContent();
                        form.Add(new StringContent(channelId), "chat_id");
                        
                        var mediaArray = new List<object>();
                        for (int i = 0; i < existingFilePaths.Count && i < 10; i++) // Max 10 per album
                        {
                            var path = existingFilePaths[i];
                            if (i == 0)
                            {
                                mediaArray.Add(new { type = "photo", media = $"attach://file_{i}", caption = SafeTruncate(appendedCaption, 1024), parse_mode = "HTML" });
                            }
                            else
                            {
                                mediaArray.Add(new { type = "photo", media = $"attach://file_{i}" });
                            }

                            var fileStream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read);
                            var streamContent = new StreamContent(fileStream);
                            form.Add(streamContent, $"file_{i}", Path.GetFileName(path));
                        }

                        var mediaJson = JsonSerializer.Serialize(mediaArray);
                        form.Add(new StringContent(mediaJson), "media");

                        return form;
                    });

                    return messages.Select(m => m.MessageId).ToArray();
                }
                else
                {
                    // Single file branch
                    var singleFilePath = existingFilePaths.First();
                    var endpoint = job.FileType switch
                    {
                        TelegramFileType.Document => "sendDocument",
                        TelegramFileType.Video => "sendVideo",
                        _ => "sendPhoto"
                    };

                    _logger.LogInformation("SendMediaAsync: Using endpoint={Endpoint} for file={FileName}", 
                        endpoint, Path.GetFileName(singleFilePath));

                    var message = await PostMultipartWithRetryAsync<TelegramMessage>(botToken, endpoint, () =>
                    {
                        var form = new MultipartFormDataContent();
                        form.Add(new StringContent(channelId), "chat_id");
                        form.Add(new StringContent(SafeTruncate(caption, 1024)), "caption");
                        form.Add(new StringContent("HTML"), "parse_mode");

                        var replyMarkup = BuildInlineKeyboardJson(job.LinkUrl, job.LinkText ?? "View");
                        if (replyMarkup != null)
                        {
                            form.Add(new StringContent(replyMarkup), "reply_markup");
                        }

                        var fileStream = new FileStream(singleFilePath, FileMode.Open, FileAccess.Read, FileShare.Read);
                        var streamContent = new StreamContent(fileStream);
                        
                        var fieldName = job.FileType switch
                        {
                            TelegramFileType.Document => "document",
                            TelegramFileType.Video => "video",
                            _ => "photo"
                        };
                        
                        var fileNameToUpload = string.IsNullOrWhiteSpace(job.DisplayFileName) 
                            ? Path.GetFileName(singleFilePath) 
                            : job.DisplayFileName;
                            
                        form.Add(streamContent, fieldName, fileNameToUpload);

                        if (job.FileType == TelegramFileType.Video && !string.IsNullOrWhiteSpace(job.ThumbnailPath) && File.Exists(job.ThumbnailPath))
                        {
                            var thumbStream = new FileStream(job.ThumbnailPath, FileMode.Open, FileAccess.Read, FileShare.Read);
                            var thumbContent = new StreamContent(thumbStream);
                            form.Add(thumbContent, "thumbnail", Path.GetFileName(job.ThumbnailPath));
                        }

                        return form;
                    });

                    return new[] { message.MessageId };
                }
            }

            _logger.LogInformation("SendMediaAsync: Local file not found or exceeded size limit. Falling back to URL/text message.");
            var textMsgId = await SendMessageAsync(caption, job.PhotoUrl, job.LinkUrl, job.LinkText ?? "View");
            return new[] { textMsgId };
        }

        public async Task<long> SendMessageAsync(string caption, string? photoUrl, string? linkUrl, string linkText)
        {
            var (botToken, channelId) = await GetConfigAsync();
            if (string.IsNullOrWhiteSpace(botToken) || string.IsNullOrWhiteSpace(channelId))
            {
                _logger.LogWarning("Telegram bot token or channel ID is missing. Skipping SendMessageAsync.");
                return 0;
            }

            if (!string.IsNullOrWhiteSpace(photoUrl) && 
                (photoUrl.StartsWith("http://", StringComparison.OrdinalIgnoreCase) || 
                 photoUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase)))
            {
                var photoPayload = new
                {
                    chat_id = channelId,
                    photo = photoUrl,
                    caption = SafeTruncate(caption, 1024),
                    parse_mode = "HTML",
                    reply_markup = BuildInlineKeyboard(linkUrl, linkText)
                };

                try
                {
                    var photoMsg = await PostWithRetryAsync<TelegramMessage>(botToken, "sendPhoto", photoPayload);
                    return photoMsg.MessageId;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to send photo by URL. Falling back to text message. PhotoUrl={PhotoUrl}", photoUrl);
                }
            }

            var payload = new
            {
                chat_id = channelId,
                text = SafeTruncate(caption, 4096),
                parse_mode = "HTML",
                reply_markup = BuildInlineKeyboard(linkUrl, linkText)
            };

            var message = await PostWithRetryAsync<TelegramMessage>(botToken, "sendMessage", payload);
            return message.MessageId;
        }

        public async Task EditCaptionAsync(long messageId, string caption, string? linkUrl, string linkText)
        {
            var (botToken, channelId) = await GetConfigAsync();
            if (string.IsNullOrWhiteSpace(botToken) || string.IsNullOrWhiteSpace(channelId)) return;

            var payload = new
            {
                chat_id = channelId,
                message_id = messageId,
                caption = SafeTruncate(caption, 1024),
                parse_mode = "HTML",
                reply_markup = BuildInlineKeyboard(linkUrl, linkText)
            };

            try
            {
                await PostWithRetryAsync<object>(botToken, "editMessageCaption", payload);
            }
            catch (Exception ex) when (ex.Message.Contains("message is not modified"))
            {
                _logger.LogDebug("Telegram caption unchanged for MessageId={MsgId}, skipping.", messageId);
            }
        }

        public async Task EditMediaAsync(long messageId, TelegramSyncJob job)
        {
            var (botToken, channelId) = await GetConfigAsync();
            if (string.IsNullOrWhiteSpace(botToken) || string.IsNullOrWhiteSpace(channelId)) return;

            if (!string.IsNullOrEmpty(job.LocalFilePath) && System.IO.File.Exists(job.LocalFilePath))
            {
                try
                {
                    await PostMultipartWithRetryAsync<JsonElement>(botToken, "editMessageMedia", () =>
                    {
                        var form = new MultipartFormDataContent();
                        
                        var mediaPayload = new
                        {
                            type = job.FileType switch
                            {
                                TelegramFileType.Document => "document",
                                TelegramFileType.Video => "video",
                                _ => "photo"
                            },
                            media = "attach://uploaded_media",
                            caption = SafeTruncate(job.Caption ?? "", 1024),
                            parse_mode = "HTML"
                        };

                        form.Add(new StringContent(channelId), "chat_id");
                        form.Add(new StringContent(messageId.ToString()), "message_id");
                        form.Add(new StringContent(JsonSerializer.Serialize(mediaPayload, JsonOpts)), "media");

                        var replyMarkup = BuildInlineKeyboardJson(job.LinkUrl, job.LinkText ?? "View");
                        if (replyMarkup != null)
                        {
                            form.Add(new StringContent(replyMarkup), "reply_markup");
                        }

                        var fileStream = new FileStream(job.LocalFilePath, FileMode.Open, FileAccess.Read, FileShare.Read);
                        var streamContent = new StreamContent(fileStream);
                        
                        var fileNameToUpload = string.IsNullOrWhiteSpace(job.DisplayFileName) 
                            ? Path.GetFileName(job.LocalFilePath) 
                            : job.DisplayFileName;
                            
                        form.Add(streamContent, "uploaded_media", fileNameToUpload);
                        
                        return form;
                    });
                }
                catch (Exception ex) when (ex.Message.Contains("message is not modified"))
                {
                    _logger.LogDebug("Telegram media/caption unchanged for MessageId={MsgId}, skipping.", messageId);
                }
                return;
            }

            if (string.IsNullOrWhiteSpace(job.PhotoUrl) || !job.PhotoUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
            {
                // We have no valid external photo URL to edit the media with.
                // We just need to edit the text/caption. Since we don't know if the original message 
                // was text or media, we try editMessageText first, then editMessageCaption.
                var textPayload = new
                {
                    chat_id = channelId,
                    message_id = messageId,
                    text = SafeTruncate(job.Caption ?? "", 4096),
                    parse_mode = "HTML",
                    reply_markup = BuildInlineKeyboard(job.LinkUrl, job.LinkText ?? "View")
                };

                try
                {
                    await PostWithRetryAsync<object>(botToken, "editMessageText", textPayload);
                }
                catch (Exception ex) when (ex.Message.Contains("message is not modified"))
                {
                    _logger.LogDebug("Telegram text unchanged for MessageId={MsgId}, skipping.", messageId);
                }
                catch (Exception ex) when (ex.Message.Contains("there is no text in the message to edit"))
                {
                    // It was a media message. Edit the caption instead.
                    await EditCaptionAsync(messageId, job.Caption ?? "", job.LinkUrl, job.LinkText ?? "View");
                }
                return;
            }

            var payload = new
            {
                chat_id = channelId,
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

            await PostWithRetryAsync<JsonElement>(botToken, "editMessageMedia", payload);
        }

        public async Task DeleteMessageAsync(long messageId)
        {
            var (botToken, channelId) = await GetConfigAsync();
            if (string.IsNullOrWhiteSpace(botToken) || string.IsNullOrWhiteSpace(channelId)) return;

            var payload = new
            {
                chat_id = channelId,
                message_id = messageId
            };

            try
            {
                await PostWithRetryAsync<object>(botToken, "deleteMessage", payload);
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

        private async Task<T> PostWithRetryAsync<T>(string botToken, string endpoint, object payload, int maxRetries = 3)
        {
            var url = $"https://api.telegram.org/bot{botToken}/{endpoint}";
            for (int attempt = 1; attempt <= maxRetries; attempt++)
            {
                try
                {
                    var json = JsonSerializer.Serialize(payload, JsonOpts);
                    var content = new StringContent(json, Encoding.UTF8, "application/json");
                    var response = await _http.PostAsync(url, content);
                    var body = await response.Content.ReadAsStringAsync();

                    var result = JsonSerializer.Deserialize<TelegramApiResponse<T>>(body, JsonOpts);

                    if (result == null) throw new Exception($"Null response from Telegram [{endpoint}]");
                    
                    if (!result.Ok)
                    {
                        if ((int)response.StatusCode == 429)
                        {
                            var retryAfterSeconds = response.Headers.RetryAfter?.Delta?.TotalSeconds ?? 5;
                            _logger.LogWarning("Telegram rate limited on [{Endpoint}]. Waiting {RetryAfter}s before retry.", endpoint, retryAfterSeconds);
                            await Task.Delay(TimeSpan.FromSeconds(retryAfterSeconds));
                            continue;
                        }
                        throw new Exception($"Telegram API error [{endpoint}]: {result.Description ?? body}");
                    }
                    return result.Result!;
                }
                catch (TaskCanceledException ex)
                {
                    _logger.LogError(ex, "Telegram API call timed out for [{Endpoint}]. Will NOT retry to avoid duplicates.", endpoint);
                    throw;
                }
                catch (Exception ex) when (attempt < maxRetries && ex is not TaskCanceledException && !ex.Message.Contains("message is not modified") && !ex.Message.Contains("message to delete not found"))
                {
                    await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, attempt)));
                }
            }
            throw new Exception("Telegram call failed after retries.");
        }

        private async Task<T> PostMultipartWithRetryAsync<T>(string botToken, string endpoint, Func<MultipartFormDataContent> contentFactory, int maxRetries = 3)
        {
            var url = $"https://api.telegram.org/bot{botToken}/{endpoint}";
            for (int attempt = 1; attempt <= maxRetries; attempt++)
            {
                MultipartFormDataContent? content = null;
                try
                {
                    content = contentFactory();
                    var response = await _http.PostAsync(url, content);
                    var body = await response.Content.ReadAsStringAsync();

                    var result = JsonSerializer.Deserialize<TelegramApiResponse<T>>(body, JsonOpts);

                    if (result == null) throw new Exception($"Null response from Telegram [{endpoint}]");
                    
                    if (!result.Ok)
                    {
                        if ((int)response.StatusCode == 429)
                        {
                            var retryAfterSeconds = response.Headers.RetryAfter?.Delta?.TotalSeconds ?? 5;
                            _logger.LogWarning("Telegram rate limited on [{Endpoint}]. Waiting {RetryAfter}s before retry.", endpoint, retryAfterSeconds);
                            await Task.Delay(TimeSpan.FromSeconds(retryAfterSeconds));
                            continue;
                        }
                        throw new Exception($"Telegram API error [{endpoint}]: {result.Description ?? body}");
                    }
                    return result.Result!;
                }
                catch (TaskCanceledException ex)
                {
                    // NEVER retry on timeout — Telegram likely already received and posted
                    // the file. Retrying would cause duplicate/spam messages.
                    _logger.LogError(ex, "Telegram file upload timed out for [{Endpoint}]. The message may have been posted. Will NOT retry to avoid duplicates.", endpoint);
                    throw;
                }
                catch (Exception ex) when (attempt < maxRetries && ex is not TaskCanceledException)
                {
                    var delay = TimeSpan.FromSeconds(Math.Pow(2, attempt));
                    _logger.LogWarning(ex, "Telegram multipart call failed (attempt {Attempt}/{MaxRetries}), retrying in {Delay}s...", attempt, maxRetries, delay.TotalSeconds);
                    await Task.Delay(delay);
                }
                finally
                {
                    content?.Dispose();
                }
            }
            throw new Exception("Telegram call failed after retries.");
        }
    }
}

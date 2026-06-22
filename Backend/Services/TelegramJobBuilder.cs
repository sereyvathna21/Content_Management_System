using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public interface ITelegramJobBuilder
    {
        Task<TelegramSyncJob> BuildNewsJobAsync(NewsArticle article, TelegramSyncAction action, bool isCaptionOnlyEdit = false);
        Task<TelegramSyncJob> BuildLawJobAsync(Law law, IEnumerable<LawTranslation> translations, TelegramSyncAction action);
        Task<TelegramSyncJob> BuildPublicationJobAsync(Publication publication, IEnumerable<PublicationTranslation> translations, TelegramSyncAction action);
    }

    public class TelegramJobBuilder : ITelegramJobBuilder
    {
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _config;
        private readonly IWebHostEnvironment _env;

        public TelegramJobBuilder(ApplicationDbContext db, IConfiguration config, IWebHostEnvironment env)
        {
            _db = db;
            _config = config;
            _env = env;
        }

        public async Task<TelegramSyncJob> BuildNewsJobAsync(NewsArticle article, TelegramSyncAction action, bool isCaptionOnlyEdit = false)
        {
            if (action == TelegramSyncAction.Delete)
            {
                return new TelegramSyncJob
                {
                    Action = TelegramSyncAction.Delete,
                    EntityType = TelegramEntityType.News,
                    EntityId = article.Id
                };
            }

            var caption = TelegramCaptionFormatter.FormatNewsCaption(article);
            var frontendUrl = _config["App:FrontendUrl"]?.TrimEnd('/') ?? "https://domain.com";
            var portalUrl = $"{frontendUrl}/Landing-page/News/{Uri.EscapeDataString(article.Slug)}";
            var photoUrls = await ResolveNewsImageUrlsAsync(article);
            var localFilePaths = new List<string>();
            var primaryFileType = TelegramFileType.None;

            foreach(var url in photoUrls) {
                var (local, ftype) = ResolveLocalFile(url);
                if (local != null) localFilePaths.Add(local);
                if (primaryFileType == TelegramFileType.None && ftype != TelegramFileType.None) 
                    primaryFileType = ftype;
            }

            return new TelegramSyncJob
            {
                Action = action,
                EntityType = TelegramEntityType.News,
                EntityId = article.Id,
                Caption = caption,
                PhotoUrl = photoUrls.FirstOrDefault(),
                LocalFilePath = localFilePaths.FirstOrDefault(),
                PhotoUrls = photoUrls,
                LocalFilePaths = localFilePaths,
                FileType = primaryFileType,
                LinkUrl = portalUrl,
                LinkText = "📰 អានអត្ថបទ",
                IsCaptionOnlyEdit = isCaptionOnlyEdit
            };
        }

        public Task<TelegramSyncJob> BuildLawJobAsync(Law law, IEnumerable<LawTranslation> translations, TelegramSyncAction action)
        {
            if (action == TelegramSyncAction.Delete)
            {
                return Task.FromResult(new TelegramSyncJob
                {
                    Action = TelegramSyncAction.Delete,
                    EntityType = TelegramEntityType.Law,
                    EntityId = law.Id
                });
            }

            var translationList = translations.ToList();
            var frontendUrl = _config["App:FrontendUrl"]?.TrimEnd('/') ?? "https://domain.com";
            var linkUrl = $"{frontendUrl}/Landing-page/Laws";

            var preferredPdf = translationList
                .FirstOrDefault(t => t.Language.Equals("km", StringComparison.OrdinalIgnoreCase))?.PdfUrl
                ?? translationList.FirstOrDefault(t => !string.IsNullOrEmpty(t.PdfUrl))?.PdfUrl;

            var caption = TelegramCaptionFormatter.FormatLawCaption(law, translationList);

            string? localFilePath = null;
            var fileType = TelegramFileType.None;
            var root = GetWebRoot();

            if (!string.IsNullOrEmpty(preferredPdf))
            {
                localFilePath = Path.Combine(root, preferredPdf.TrimStart('/'));
                fileType = TelegramFileType.Document;
            }
            else if (!string.IsNullOrEmpty(law.CoverImageUrl))
            {
                localFilePath = Path.Combine(root, law.CoverImageUrl.TrimStart('/'));
                fileType = TelegramFileType.Photo;
            }

            var titleKm = translationList
                .FirstOrDefault(t => t.Language.Equals("km", StringComparison.OrdinalIgnoreCase))?.Title;
            var titleEn = translationList
                .FirstOrDefault(t => t.Language.Equals("en", StringComparison.OrdinalIgnoreCase))?.Title;
            var lawTitle = titleKm ?? titleEn ?? law.Id.ToString();

            return Task.FromResult(new TelegramSyncJob
            {
                Action = action,
                EntityType = TelegramEntityType.Law,
                EntityId = law.Id,
                Caption = caption,
                LinkUrl = linkUrl,
                LinkText = "📄 មើលច្បាប់",
                LocalFilePath = localFilePath,
                FileType = fileType,
                DisplayFileName = fileType == TelegramFileType.Document ? $"{lawTitle}.pdf" : null,
                PublicFileUrl = !string.IsNullOrEmpty(preferredPdf) ? $"{frontendUrl}{preferredPdf}" : null
            });
        }

        public Task<TelegramSyncJob> BuildPublicationJobAsync(Publication publication, IEnumerable<PublicationTranslation> translations, TelegramSyncAction action)
        {
            if (action == TelegramSyncAction.Delete)
            {
                return Task.FromResult(new TelegramSyncJob
                {
                    Action = TelegramSyncAction.Delete,
                    EntityType = TelegramEntityType.Publication,
                    EntityId = publication.Id
                });
            }

            var translationList = translations.ToList();
            var frontendUrl = _config["App:FrontendUrl"]?.TrimEnd('/') ?? "https://domain.com";
            var linkUrl = $"{frontendUrl}/Landing-page/Publications";

            var preferredAttachment = translationList
                .FirstOrDefault(t => t.Language.Equals("km", StringComparison.OrdinalIgnoreCase))?.AttachmentUrl
                ?? translationList.FirstOrDefault(t => !string.IsNullOrEmpty(t.AttachmentUrl))?.AttachmentUrl;

            var caption = TelegramCaptionFormatter.FormatPublicationCaption(publication, translationList);

            string? localFilePath = null;
            var fileType = TelegramFileType.None;
            var root = GetWebRoot();

            if (!string.IsNullOrEmpty(preferredAttachment))
            {
                localFilePath = Path.Combine(root, preferredAttachment.TrimStart('/'));
                fileType = TelegramFileType.Document;
            }
            else if (!string.IsNullOrEmpty(publication.CoverImageUrl))
            {
                localFilePath = Path.Combine(root, publication.CoverImageUrl.TrimStart('/'));
                fileType = TelegramFileType.Photo;
            }

            var titleEn = translationList
                .FirstOrDefault(t => t.Language.Equals("en", StringComparison.OrdinalIgnoreCase))?.Title ?? "";

            return Task.FromResult(new TelegramSyncJob
            {
                Action = action,
                EntityType = TelegramEntityType.Publication,
                EntityId = publication.Id,
                Caption = caption,
                LinkUrl = linkUrl,
                LinkText = "📋 មើលការបោះពុម្ពផ្សាយ",
                LocalFilePath = localFilePath,
                FileType = fileType,
                DisplayFileName = fileType == TelegramFileType.Document ? $"{titleEn}.pdf" : null,
                PublicFileUrl = !string.IsNullOrEmpty(preferredAttachment) ? $"{frontendUrl}{preferredAttachment}" : null
            });
        }

        // ── Private helpers ──────────────────────────────────────────

        private async Task<List<string>> ResolveNewsImageUrlsAsync(NewsArticle article)
        {
            var results = new List<string>();
            if (!string.IsNullOrWhiteSpace(article.ImageUrl))
            {
                var urls = article.ImageUrl.Split(',', StringSplitOptions.RemoveEmptyEntries);
                foreach(var url in urls)
                {
                    results.Add(url.Trim());
                }
            }
            if (results.Count == 0 && article.ImageMediaId.HasValue)
            {
                var media = await _db.Media.FindAsync(article.ImageMediaId.Value);
                if (media?.PublicUrl != null) results.Add(media.PublicUrl);
            }
            return results;
        }

        private (string? LocalFilePath, TelegramFileType FileType) ResolveLocalFile(string? url)
        {
            if (string.IsNullOrEmpty(url))
                return (null, TelegramFileType.None);

            if (url.StartsWith("http://", StringComparison.OrdinalIgnoreCase) || 
                url.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            {
                try
                {
                    var uri = new Uri(url);
                    url = uri.AbsolutePath;
                }
                catch { }
            }

            if (!url.StartsWith("/"))
                return (null, TelegramFileType.None);

            var root = GetWebRoot();
            var localFilePath = Path.Combine(root, url.TrimStart('/'));

            if (url.EndsWith(".mp4", StringComparison.OrdinalIgnoreCase) ||
                url.EndsWith(".mov", StringComparison.OrdinalIgnoreCase))
            {
                return (localFilePath, TelegramFileType.Video);
            }

            return (localFilePath, TelegramFileType.Photo);
        }

        private string GetWebRoot()
        {
            return _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        }
    }
}

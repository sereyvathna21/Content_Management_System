using Backend.Models;

namespace Backend.Services
{
    public static class TelegramCaptionFormatter
    {
        public static string FormatNewsCaption(NewsArticle article, string preferredLang = "en")
        {
            var translation = article.Translations
                .FirstOrDefault(t => t.Language.Equals(preferredLang, StringComparison.OrdinalIgnoreCase))
                ?? article.Translations.FirstOrDefault();

            if (translation == null) return "<b>📰 News Update</b>";

            var title   = TelegramService.EscapeHtml(translation.Title);
            var excerpt = TelegramService.EscapeHtml(TelegramService.SafeTruncate(translation.Excerpt ?? "", 300));
            var category = TelegramService.EscapeHtml(article.Category ?? "General");

            return $"<b>📰 {title}</b>\n\n<b>Category:</b> {category}\n" +
                   (string.IsNullOrWhiteSpace(excerpt) ? "" : $"{excerpt}\n\n") +
                   $"<i>Published on NSPC — tap below to read more.</i>";
        }

        public static string FormatLawCaption(Law law, IEnumerable<LawTranslation> translations, string preferredLang = "en")
        {
            var translation = translations
                .FirstOrDefault(t => t.Language.Equals(preferredLang, StringComparison.OrdinalIgnoreCase))
                ?? translations.FirstOrDefault();

            if (translation == null) return "<b>⚖️ New Law</b>";

            var title    = TelegramService.EscapeHtml(translation.Title);
            var category = TelegramService.EscapeHtml(translation.Category ?? law.Category ?? "General");
            var dateStr  = law.Date?.ToString("yyyy-MM-dd") ?? "";

            return $"<b>⚖️ {title}</b>\n\n<b>Category:</b> {category}\n" +
                   (string.IsNullOrWhiteSpace(dateStr) ? "" : $"<b>Date:</b> {dateStr}\n\n") +
                   $"<i>Published on NSPC — tap below to view.</i>";
        }

        public static string FormatPublicationCaption(Publication publication, IEnumerable<PublicationTranslation> translations, string preferredLang = "en")
        {
            var translation = translations
                .FirstOrDefault(t => t.Language.Equals(preferredLang, StringComparison.OrdinalIgnoreCase))
                ?? translations.FirstOrDefault();

            if (translation == null) return "<b>📋 New Publication</b>";

            var title    = TelegramService.EscapeHtml(translation.Title);
            var category = TelegramService.EscapeHtml(translation.Category ?? publication.Category ?? "General");
            var dateStr  = publication.PublicationDate?.ToString("yyyy-MM-dd") ?? "";

            return $"<b>📋 {title}</b>\n\n<b>Category:</b> {category}\n" +
                   (string.IsNullOrWhiteSpace(dateStr) ? "" : $"<b>Date:</b> {dateStr}\n\n") +
                   $"<i>Published on NSPC — tap below to view.</i>";
        }
    }
}

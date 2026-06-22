using Backend.Models;

namespace Backend.Services
{
    public static class TelegramCaptionFormatter
    {
        public static string FormatNewsCaption(NewsArticle article, string preferredLang = "km")
        {
            var translation = article.Translations
                .FirstOrDefault(t => t.Language.Equals(preferredLang, StringComparison.OrdinalIgnoreCase))
                ?? article.Translations.FirstOrDefault();

            if (translation == null) return "<b>📰 ព័ត៌មានថ្មីៗ</b>";

            var title   = TelegramService.EscapeHtml(translation.Title);
            var rawExcerpt = translation.Excerpt;
            if (string.IsNullOrWhiteSpace(rawExcerpt))
            {
                rawExcerpt = translation.ContentHtml != null 
                    ? System.Text.RegularExpressions.Regex.Replace(translation.ContentHtml, "<.*?>", string.Empty) 
                    : "";
            }
            var excerpt = TelegramService.EscapeHtml(TelegramService.SafeTruncate(rawExcerpt, 800));
            
            var category = TelegramService.EscapeHtml(article.Category ?? "ទូទៅ");
            var dateStr  = article.PublishAt?.ToString("yyyy-MM-dd") ?? article.CreatedAt.ToString("yyyy-MM-dd");

            return $"<b>[ 📰 ព័ត៌មាន ]</b>\n\n" +
                   $"<b><u>{title}</u></b>\n\n" +
                   $"<b>ប្រភេទ:</b> {category}\n" +
                   (string.IsNullOrWhiteSpace(dateStr) ? "" : $"<b>កាលបរិច្ឆេទ:</b> {dateStr}\n") +
                   (string.IsNullOrWhiteSpace(excerpt) ? "" : $"\n<b>ការពិពណ៌នា:</b>\n{excerpt}\n\n") +
                   $"#ព័ត៌មាន";
        }

        public static string FormatLawCaption(Law law, IEnumerable<LawTranslation> translations, string preferredLang = "km")
        {
            var translation = translations
                .FirstOrDefault(t => t.Language.Equals(preferredLang, StringComparison.OrdinalIgnoreCase))
                ?? translations.FirstOrDefault();

            if (translation == null) return "<b>⚖️ ច្បាប់ថ្មី</b>";

            var title    = TelegramService.EscapeHtml(translation.Title);
            var category = TelegramService.EscapeHtml(translation.Category ?? law.Category ?? "ទូទៅ");
            var description = TelegramService.EscapeHtml(TelegramService.SafeTruncate(translation.Description ?? "", 800));
            var dateStr  = law.Date?.ToString("yyyy-MM-dd") ?? "";

            return $"<b>[ ⚖️ ច្បាប់ ]</b>\n\n" +
                   $"<b><u>{title}</u></b>\n\n" +
                   $"<b>ប្រភេទ:</b> {category}\n" +
                   (string.IsNullOrWhiteSpace(dateStr) ? "" : $"<b>កាលបរិច្ឆេទ:</b> {dateStr}\n") +
                   (string.IsNullOrWhiteSpace(description) ? "" : $"\n<b>ការពិពណ៌នា:</b>\n{description}\n\n") +
                   $"#ច្បាប់";
        }

        public static string FormatPublicationCaption(Publication publication, IEnumerable<PublicationTranslation> translations, string preferredLang = "km")
        {
            var translation = translations
                .FirstOrDefault(t => t.Language.Equals(preferredLang, StringComparison.OrdinalIgnoreCase))
                ?? translations.FirstOrDefault();

            if (translation == null) return "<b>📋 ការបោះពុម្ពផ្សាយថ្មី</b>";

            var title    = TelegramService.EscapeHtml(translation.Title);
            var category = TelegramService.EscapeHtml(translation.Category ?? publication.Category ?? "ទូទៅ");
            
            var rawDescription = translation.Summary;
            if (string.IsNullOrWhiteSpace(rawDescription))
            {
                rawDescription = translation.Content != null 
                    ? System.Text.RegularExpressions.Regex.Replace(translation.Content, "<.*?>", string.Empty) 
                    : "";
            }
            var description = TelegramService.EscapeHtml(TelegramService.SafeTruncate(rawDescription, 800));
            
            var dateStr  = publication.PublicationDate?.ToString("yyyy-MM-dd") ?? "";

            return $"<b>[ 📚 ឯកសារបោះពុម្ពផ្សាយ ]</b>\n\n" +
                   $"<b><u>{title}</u></b>\n\n" +
                   $"<b>ប្រភេទ:</b> {category}\n" +
                   (string.IsNullOrWhiteSpace(dateStr) ? "" : $"<b>កាលបរិច្ឆេទ:</b> {dateStr}\n") +
                   (string.IsNullOrWhiteSpace(description) ? "" : $"\n<b>ការពិពណ៌នា:</b>\n{description}\n\n") +
                   $"#ឯកសារបោះពុម្ពផ្សាយ";
        }
    }
}

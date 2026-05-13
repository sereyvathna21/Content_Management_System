using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("NewsArticleTranslation")]
    public class NewsArticleTranslation
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ArticleId { get; set; }
        public NewsArticle Article { get; set; } = null!;
        public string Language { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Excerpt { get; set; } = string.Empty;
        public string? Subtitle { get; set; }
        public string? ContentHtml { get; set; }
        public string? ContentMd { get; set; }
        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }
        public string? CanonicalUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

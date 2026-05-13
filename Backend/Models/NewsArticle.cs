using System;
using System.Collections.Generic;

namespace Backend.Models
{
    public class NewsArticle
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Slug { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public ContentStatus Status { get; set; } = ContentStatus.Draft;
        public DateTime? PublishAt { get; set; }
        public string? ImageUrl { get; set; }
        public Guid? ImageMediaId { get; set; }
        public Media? ImageMedia { get; set; }
        public string? ImageAltKh { get; set; }
        public string? ImageAltEn { get; set; }
        public bool Featured { get; set; }
        public int? SortOrder { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int? CreatedByUserId { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public int? UpdatedByUserId { get; set; }
        public DateTime? DeletedAt { get; set; }
        public int? DeletedByUserId { get; set; }

        public ICollection<NewsArticleTranslation> Translations { get; set; } = new List<NewsArticleTranslation>();
    }
}

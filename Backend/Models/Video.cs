using System;
using System.Collections.Generic;

namespace Backend.Models
{
    public class Video
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string EmbedUrl { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public ContentStatus Status { get; set; } = ContentStatus.Draft;
        public DateTime? PublishAt { get; set; }
        public string? ThumbnailUrl { get; set; }
        public Guid? ThumbnailMediaId { get; set; }
        public Media? ThumbnailMedia { get; set; }
        public string? ThumbnailAltKh { get; set; }
        public string? ThumbnailAltEn { get; set; }
        public bool Featured { get; set; }
        public int? SortOrder { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public int? CreatedByUserId { get; set; }
        public int? UpdatedByUserId { get; set; }
        public DateTime? DeletedAt { get; set; }
        public int? DeletedByUserId { get; set; }

        public ICollection<VideoTranslation> Translations { get; set; } = new List<VideoTranslation>();
    }
}

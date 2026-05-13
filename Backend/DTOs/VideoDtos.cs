using System;
using Backend.Models;

namespace Backend.DTOs
{
    public class VideoCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string EmbedUrl { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public ContentStatus Status { get; set; } = ContentStatus.Draft;
        public DateTime? PublishAt { get; set; }
        public string? ThumbnailUrl { get; set; }
        public Guid? ThumbnailMediaId { get; set; }
        public string? ThumbnailAltKh { get; set; }
        public string? ThumbnailAltEn { get; set; }
        public bool Featured { get; set; }
        public int? SortOrder { get; set; }
    }

    public class VideoUpdateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string EmbedUrl { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public ContentStatus Status { get; set; } = ContentStatus.Draft;
        public DateTime? PublishAt { get; set; }
        public string? ThumbnailUrl { get; set; }
        public Guid? ThumbnailMediaId { get; set; }
        public string? ThumbnailAltKh { get; set; }
        public string? ThumbnailAltEn { get; set; }
        public bool Featured { get; set; }
        public int? SortOrder { get; set; }
    }

    public class VideoDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string EmbedUrl { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public ContentStatus Status { get; set; }
        public DateTime? PublishAt { get; set; }
        public string? ThumbnailUrl { get; set; }
        public Guid? ThumbnailMediaId { get; set; }
        public string? ThumbnailAltKh { get; set; }
        public string? ThumbnailAltEn { get; set; }
        public bool Featured { get; set; }
        public int? SortOrder { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }

    public class PublicVideoListItemDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string EmbedUrl { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public DateTime? PublishAt { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string? ThumbnailAlt { get; set; }
    }
}

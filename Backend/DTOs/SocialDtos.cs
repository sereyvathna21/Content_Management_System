using System;
using System.Collections.Generic;
using Backend.Models;

namespace Backend.DTOs
{
    // Admin Request DTOs
    public class SocialTopicCreateDto
    {
        public string Slug { get; set; } = string.Empty;
        public string TitleKm { get; set; } = string.Empty;
        public string? TitleEn { get; set; }
        public string? SubtitleKm { get; set; }
        public string? SubtitleEn { get; set; }
        public int SortOrder { get; set; }
    }

    public class SocialTopicUpdateDto
    {
        public string TitleKm { get; set; } = string.Empty;
        public string? TitleEn { get; set; }
        public string? SubtitleKm { get; set; }
        public string? SubtitleEn { get; set; }
        public int SortOrder { get; set; }
        public TopicStatus Status { get; set; }
    }

    public class SocialSectionCreateDto
    {
        public Guid? ParentSectionId { get; set; }
        public string SectionKey { get; set; } = string.Empty;
        public string TitleKm { get; set; } = string.Empty;
        public string? TitleEn { get; set; }
        public string ContentKm { get; set; } = string.Empty;
        public string? ContentEn { get; set; }
        public int SortOrder { get; set; }
    }

    public class SocialSectionUpdateDto
    {
        public Guid? ParentSectionId { get; set; }
        public string SectionKey { get; set; } = string.Empty;
        public string TitleKm { get; set; } = string.Empty;
        public string? TitleEn { get; set; }
        public string ContentKm { get; set; } = string.Empty;
        public string? ContentEn { get; set; }
        public int SortOrder { get; set; }
        public TopicStatus Status { get; set; }
    }

    public class SectionReorderDto
    {
        public Guid SectionId { get; set; }
        public int SortOrder { get; set; }
    }

    public class SocialSectionMediaCreateDto
    {
        public Guid MediaId { get; set; }
        public ImagePosition Position { get; set; } = ImagePosition.Full;
        public string? CaptionKm { get; set; }
        public string? CaptionEn { get; set; }
        public string? AltKm { get; set; }
        public string? AltEn { get; set; }
        public int SortOrder { get; set; }
    }

    public class SocialSectionMediaUpdateDto
    {
        public ImagePosition Position { get; set; } = ImagePosition.Full;
        public string? CaptionKm { get; set; }
        public string? CaptionEn { get; set; }
        public string? AltKm { get; set; }
        public string? AltEn { get; set; }
        public int SortOrder { get; set; }
    }

    // Admin Response DTOs
    public class SocialTopicDto
    {
        public Guid Id { get; set; }
        public string Slug { get; set; } = string.Empty;
        public string TitleKm { get; set; } = string.Empty;
        public string? TitleEn { get; set; }
        public string? SubtitleKm { get; set; }
        public string? SubtitleEn { get; set; }
        public int SortOrder { get; set; }
        public TopicStatus Status { get; set; }
        public DateTime? PublishedAt { get; set; }
        public int? PublishedByUserId { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int? UpdatedByUserId { get; set; }
    }

    public class SocialSectionDto
    {
        public Guid Id { get; set; }
        public Guid TopicId { get; set; }
        public Guid? ParentSectionId { get; set; }
        public string SectionKey { get; set; } = string.Empty;
        public string TitleKm { get; set; } = string.Empty;
        public string? TitleEn { get; set; }
        public string ContentKm { get; set; } = string.Empty;
        public string? ContentEn { get; set; }
        public int SortOrder { get; set; }
        public int Depth { get; set; }
        public TopicStatus Status { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int? UpdatedByUserId { get; set; }

        public List<SocialSectionDto> ChildSections { get; set; } = new();
        public List<SocialSectionMediaDto> Media { get; set; } = new();
    }

    public class MediaDto
    {
        public Guid Id { get; set; }
        public string PublicUrl { get; set; } = string.Empty;
        public string MimeType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public int? Width { get; set; }
        public int? Height { get; set; }
    }

    public class SocialSectionMediaDto
    {
        public Guid Id { get; set; }
        public Guid SectionId { get; set; }
        public Guid MediaId { get; set; }
        public ImagePosition Position { get; set; }
        public string? CaptionKm { get; set; }
        public string? CaptionEn { get; set; }
        public string? AltKm { get; set; }
        public string? AltEn { get; set; }
        public int SortOrder { get; set; }

        public MediaDto? Media { get; set; }
    }

    public class SocialRevisionDto
    {
        public Guid Id { get; set; }
        public Guid TopicId { get; set; }
        public string SnapshotJson { get; set; } = string.Empty;
        public int RevisionNumber { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? CreatedByUserId { get; set; }
        public string ActionType { get; set; } = string.Empty;
    }

    // Public DTOs (Localized)
    public class PublicSocialTopicDto
    {
        public string Slug { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Subtitle { get; set; }
        public DateTime? PublishedAt { get; set; }
        public List<PublicSocialSectionDto> Sections { get; set; } = new();
    }

    public class PublicSocialSectionDto
    {
        public string SectionKey { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public int SortOrder { get; set; }
        public int Depth { get; set; }
        public List<PublicSocialSectionDto> ChildSections { get; set; } = new();
        public List<PublicSocialSectionMediaDto> Media { get; set; } = new();
    }

    public class PublicSocialSectionMediaDto
    {
        public string PublicUrl { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public string? Caption { get; set; }
        public string? Alt { get; set; }
        public int SortOrder { get; set; }
        public int? Width { get; set; }
        public int? Height { get; set; }
    }
}

using System;
using System.Collections.Generic;
using Backend.Models;

namespace Backend.DTOs
{
    // Admin Request DTOs
    public class AboutTopicCreateDto
    {
        public string Slug { get; set; } = string.Empty;
        public string TitleKm { get; set; } = string.Empty;
        public string? TitleEn { get; set; }
        public string? SubtitleKm { get; set; }
        public string? SubtitleEn { get; set; }
        public string? ReferenceKm { get; set; }
        public string? ReferenceEn { get; set; }
        public int SortOrder { get; set; }
    }

    public class AboutTopicUpdateDto
    {
        public string TitleKm { get; set; } = string.Empty;
        public string? TitleEn { get; set; }
        public string? SubtitleKm { get; set; }
        public string? SubtitleEn { get; set; }
        public string? ReferenceKm { get; set; }
        public string? ReferenceEn { get; set; }
        public int SortOrder { get; set; }
        public TopicStatus Status { get; set; }
    }

    public class AboutSectionCreateDto
    {
        public Guid? ParentSectionId { get; set; }
        public string SectionKey { get; set; } = string.Empty;
        public string TitleKm { get; set; } = string.Empty;
        public string? TitleEn { get; set; }
        public string ContentKm { get; set; } = string.Empty;
        public string? ContentEn { get; set; }
        public int SortOrder { get; set; }
    }

    public class AboutSectionUpdateDto
    {
        public Guid? ParentSectionId { get; set; }
        public string SectionKey { get; set; } = string.Empty;
        public string TitleKm { get; set; } = string.Empty;
        public string? TitleEn { get; set; }
        public string ContentKm { get; set; } = string.Empty;
        public string? ContentEn { get; set; }
        public int SortOrder { get; set; }
        public TopicStatus? Status { get; set; }
    }

    public class AboutSectionMediaCreateDto
    {
        public Guid MediaId { get; set; }
        public ImagePosition Position { get; set; } = ImagePosition.Full;
        public ImageLanguage Language { get; set; } = ImageLanguage.KH;
        public int Width { get; set; } = 75;
        public string? CaptionKm { get; set; }
        public string? CaptionEn { get; set; }
        public string? AltKm { get; set; }
        public string? AltEn { get; set; }
        public int SortOrder { get; set; }
    }

    public class AboutSectionMediaUpdateDto
    {
        public ImagePosition Position { get; set; } = ImagePosition.Full;
        public ImageLanguage Language { get; set; } = ImageLanguage.KH;
        public int Width { get; set; } = 75;
        public string? CaptionKm { get; set; }
        public string? CaptionEn { get; set; }
        public string? AltKm { get; set; }
        public string? AltEn { get; set; }
        public int SortOrder { get; set; }
    }

    public class AboutReferenceUpdateDto
    {
        public string? TitleKm { get; set; }
        public string? TitleEn { get; set; }
        public int SortOrder { get; set; }
    }

    public class AboutReferenceReorderDto
    {
        public Guid ReferenceId { get; set; }
        public int SortOrder { get; set; }
    }

    // Admin Response DTOs
    public class AboutTopicDto
    {
        public Guid Id { get; set; }
        public string Slug { get; set; } = string.Empty;
        public string TitleKm { get; set; } = string.Empty;
        public string? TitleEn { get; set; }
        public string? SubtitleKm { get; set; }
        public string? SubtitleEn { get; set; }
        public string? ReferenceKm { get; set; }
        public string? ReferenceEn { get; set; }
        public int SortOrder { get; set; }
        public TopicStatus Status { get; set; }
        public DateTime? PublishedAt { get; set; }
        public int? PublishedByUserId { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int? UpdatedByUserId { get; set; }
    }

    public class AboutSectionDto
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

        public List<AboutSectionDto> ChildSections { get; set; } = new();
        public List<AboutSectionMediaDto> Media { get; set; } = new();
    }

    public class AboutSectionMediaDto
    {
        public Guid Id { get; set; }
        public Guid SectionId { get; set; }
        public Guid MediaId { get; set; }
        public ImagePosition Position { get; set; }
        public ImageLanguage Language { get; set; }
        public int Width { get; set; }
        public string? CaptionKm { get; set; }
        public string? CaptionEn { get; set; }
        public string? AltKm { get; set; }
        public string? AltEn { get; set; }
        public int SortOrder { get; set; }

        public MediaDto? Media { get; set; }
    }

    public class AboutRevisionDto
    {
        public Guid Id { get; set; }
        public Guid TopicId { get; set; }
        public string SnapshotJson { get; set; } = string.Empty;
        public int RevisionNumber { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? CreatedByUserId { get; set; }
        public string ActionType { get; set; } = string.Empty;
    }

    public class AboutReferenceDto
    {
        public Guid Id { get; set; }
        public Guid TopicId { get; set; }
        public string Language { get; set; } = "km";
        public string? TitleKm { get; set; }
        public string? TitleEn { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string PublicUrl { get; set; } = string.Empty;
        public string MimeType { get; set; } = string.Empty;
        public long FileSizeBytes { get; set; }
        public int SortOrder { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    // Public DTOs (Localized)
    public class PublicAboutTopicDto
    {
        public string Slug { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Subtitle { get; set; }
        public string? Reference { get; set; }
        public DateTime? PublishedAt { get; set; }
        public List<PublicAboutSectionDto> Sections { get; set; } = new();
        public List<PublicAboutReferenceDto> ReferencesKm { get; set; } = new();
        public List<PublicAboutReferenceDto> ReferencesEn { get; set; } = new();
    }

    public class PublicAboutSectionDto
    {
        public string SectionKey { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public int SortOrder { get; set; }
        public int Depth { get; set; }
        public List<PublicAboutSectionDto> ChildSections { get; set; } = new();
        public List<PublicAboutSectionMediaDto> Media { get; set; } = new();
    }

    public class PublicAboutSectionMediaDto
    {
        public string PublicUrl { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
        public string? Caption { get; set; }
        public string? Alt { get; set; }
        public int SortOrder { get; set; }
        public int Width { get; set; }
        public int? Height { get; set; }
    }

    public class PublicAboutReferenceDto
    {
        public string Title { get; set; } = string.Empty;
        public string PublicUrl { get; set; } = string.Empty;
        public long FileSizeBytes { get; set; }
        public int SortOrder { get; set; }
    }
}

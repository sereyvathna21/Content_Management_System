using System;
using System.Collections.Generic;
using Backend.Models;

namespace Backend.DTOs
{
    public class NewsArticleCreateDto
    {
        public string Slug { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public ContentStatus Status { get; set; } = ContentStatus.Draft;
        public DateTime? PublishAt { get; set; }
        public string? ImageUrl { get; set; }
        public Guid? ImageMediaId { get; set; }
        public string? ImageAltKh { get; set; }
        public string? ImageAltEn { get; set; }
        public bool Featured { get; set; }
        public int? SortOrder { get; set; }
        public List<NewsArticleTranslationCreateDto> Translations { get; set; } = new();
    }

    public class NewsArticleUpdateDto
    {
        public string Slug { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public ContentStatus Status { get; set; } = ContentStatus.Draft;
        public DateTime? PublishAt { get; set; }
        public string? ImageUrl { get; set; }
        public Guid? ImageMediaId { get; set; }
        public string? ImageAltKh { get; set; }
        public string? ImageAltEn { get; set; }
        public bool Featured { get; set; }
        public int? SortOrder { get; set; }
        public List<NewsArticleTranslationCreateDto> Translations { get; set; } = new();
    }

    public class NewsArticleTranslationCreateDto
    {
        public string Language { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Excerpt { get; set; } = string.Empty;
        public string? Subtitle { get; set; }
        public string? ContentHtml { get; set; }
        public string? ContentMd { get; set; }
        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }
        public string? CanonicalUrl { get; set; }
    }

    public class NewsArticleDto
    {
        public Guid Id { get; set; }
        public string Slug { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public ContentStatus Status { get; set; }
        public DateTime? PublishAt { get; set; }
        public string? ImageUrl { get; set; }
        public Guid? ImageMediaId { get; set; }
        public string? ImageAltKh { get; set; }
        public string? ImageAltEn { get; set; }
        public bool Featured { get; set; }
        public int? SortOrder { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public List<NewsArticleTranslationDto> Translations { get; set; } = new();
    }

    public class NewsArticleTranslationDto
    {
        public Guid Id { get; set; }
        public string Language { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Excerpt { get; set; } = string.Empty;
        public string? Subtitle { get; set; }
        public string? ContentHtml { get; set; }
        public string? ContentMd { get; set; }
        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }
        public string? CanonicalUrl { get; set; }
    }

    public class PublicNewsListItemDto
    {
        public Guid Id { get; set; }
        public string Slug { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public DateTime? PublishAt { get; set; }
        public string Language { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Excerpt { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public string? ImageAlt { get; set; }
    }

    public class PublicNewsDetailDto
    {
        public Guid Id { get; set; }
        public string Slug { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public DateTime? PublishAt { get; set; }
        public string Language { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Excerpt { get; set; } = string.Empty;
        public string? Subtitle { get; set; }
        public string? ContentHtml { get; set; }
        public string? ContentMd { get; set; }
        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }
        public string? CanonicalUrl { get; set; }
        public string? ImageUrl { get; set; }
        public string? ImageAlt { get; set; }
    }
}

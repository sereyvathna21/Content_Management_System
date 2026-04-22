using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;

namespace Backend.DTOs
{
    public class PublicationCreateDto
    {
        public string Category { get; set; } = string.Empty;
        public DateTime? PublicationDate { get; set; }
        public string? Authors { get; set; }
        public List<PublicationTranslationCreateDto> Translations { get; set; } = new();
    }

    public class PublicationUpdateDto
    {
        public string Category { get; set; } = string.Empty;
        public DateTime? PublicationDate { get; set; }
        public string? Authors { get; set; }
        public List<PublicationTranslationCreateDto> Translations { get; set; } = new();
    }

    public class PublicationTranslationCreateDto
    {
        public string Language { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Summary { get; set; }
        public string? Content { get; set; }
        public string? Category { get; set; }
        public IFormFile? AttachmentFile { get; set; }
    }

    public class PublicationDto
    {
        public Guid Id { get; set; }
        public string Category { get; set; } = string.Empty;
        public DateTime? PublicationDate { get; set; }
        public string? Authors { get; set; }
        public List<PublicationTranslationDto> Translations { get; set; } = new();
    }

    public class PublicationTranslationDto
    {
        public Guid Id { get; set; }
        public string Language { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Category { get; set; }
        public string? Summary { get; set; }
        public string? Content { get; set; }
        public string? AttachmentUrl { get; set; }
    }

    public class PublicPublicationListItemDto
    {
        public Guid Id { get; set; }
        public string Category { get; set; } = string.Empty;
        public DateTime? PublicationDate { get; set; }
        public string? Authors { get; set; }
        public string Language { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Summary { get; set; }
        public string? Content { get; set; }
        public string? AttachmentUrl { get; set; }
    }
}

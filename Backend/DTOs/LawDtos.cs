using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;

namespace Backend.DTOs
{
    public class LawCreateDto
    {
        public string Category { get; set; } = string.Empty;
        public DateTime? Date { get; set; }
        public List<LawTranslationCreateDto> Translations { get; set; } = new();
    }

    public class LawUpdateDto
    {
        public string Category { get; set; } = string.Empty;
        public DateTime? Date { get; set; }
        public List<LawTranslationCreateDto> Translations { get; set; } = new();
    }

    public class LawTranslationCreateDto
    {
        public string Language { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Category { get; set; }
        public string? Description { get; set; }
        // When using multipart/form-data the field name should match this property for each translation
        public IFormFile? PdfFile { get; set; }
    }

    public class LawDto
    {
        public Guid Id { get; set; }
        public string Category { get; set; } = string.Empty;
        public DateTime? Date { get; set; }
        public List<LawTranslationDto> Translations { get; set; } = new();
    }

    public class LawTranslationDto
    {
        public Guid Id { get; set; }
        public string Language { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Category { get; set; }
        public string? Description { get; set; }
        public string? PdfUrl { get; set; }
    }

    public class PublicLawListItemDto
    {
        public Guid Id { get; set; }
        public string Category { get; set; } = string.Empty;
        public DateTime? Date { get; set; }
        public string Language { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? PdfUrl { get; set; }
    }
}

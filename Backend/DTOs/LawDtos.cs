using System;

namespace Backend.DTOs
{
    public class LawCreateDto
    {
        public string TitleEn { get; set; } = string.Empty;
        public string TitleKh { get; set; } = string.Empty;
        public string? DescriptionEn { get; set; }
        public string? DescriptionKh { get; set; }
        public string Category { get; set; } = string.Empty;
        public string? Date { get; set; }
        public bool IsPublished { get; set; } = true;
    }

    public class LawUpdateDto
    {
        public string TitleEn { get; set; } = string.Empty;
        public string TitleKh { get; set; } = string.Empty;
        public string? DescriptionEn { get; set; }
        public string? DescriptionKh { get; set; }
        public string Category { get; set; } = string.Empty;
        public string? Date { get; set; }
        public string? PdfEn { get; set; }
        public string? PdfKh { get; set; }
        public bool IsPublished { get; set; } = true;
    }

    public class LawDto
    {
        public int Id { get; set; }
        public string TitleEn { get; set; } = string.Empty;
        public string TitleKh { get; set; } = string.Empty;
        public string? DescriptionEn { get; set; }
        public string? DescriptionKh { get; set; }
        public string Category { get; set; } = string.Empty;
        public string? Date { get; set; }
        public string? PdfEn { get; set; }
        public string? PdfKh { get; set; }
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

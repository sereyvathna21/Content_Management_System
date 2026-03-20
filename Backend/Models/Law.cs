using System;

namespace Backend.Models
{
    public class Law
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
        public bool IsPublished { get; set; } = true;
        public DateTime CreatedAt { get; set; }
    }
}

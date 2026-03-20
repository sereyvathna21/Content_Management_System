using System;

namespace Backend.DTOs
{
    public record LawDto(Guid Id, string Title, string? Description, string Category, DateTime? Date, string PdfUrl, DateTime CreatedAt, DateTime? UpdatedAt);

    public class CreateLawDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public DateTime? Date { get; set; }
        public string PdfUrl { get; set; } = string.Empty;
    }

    public class UpdateLawDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public DateTime? Date { get; set; }
        public string PdfUrl { get; set; } = string.Empty;
    }
}

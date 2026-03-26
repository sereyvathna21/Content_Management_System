using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("LawTranslation")]
    public class LawTranslation
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid LawId { get; set; }
        public Law Law { get; set; } = null!;
        public string Language { get; set; } = string.Empty; // en, km, etc.
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? PdfUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

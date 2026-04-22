using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("PublicationTranslation")]
    public class PublicationTranslation
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid PublicationId { get; set; }
        public Publication Publication { get; set; } = null!;
        public string Language { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Category { get; set; }
        public string? Summary { get; set; }
        public string? Content { get; set; }
        public string? AttachmentUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

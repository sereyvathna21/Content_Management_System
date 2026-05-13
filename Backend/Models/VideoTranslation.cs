using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("VideoTranslation")]
    public class VideoTranslation
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid VideoId { get; set; }
        public Video Video { get; set; } = null!;
        public string Language { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

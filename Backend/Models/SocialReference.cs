using System;

namespace Backend.Models
{
    public class SocialReference
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid TopicId { get; set; }
        public string Language { get; set; } = "km";
        public string? TitleKm { get; set; }
        public string? TitleEn { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string StoragePath { get; set; } = string.Empty;
        public string PublicUrl { get; set; } = string.Empty;
        public string MimeType { get; set; } = string.Empty;
        public long FileSizeBytes { get; set; }
        public int SortOrder { get; set; }
        public int? UploadedByUserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public SocialTopic? Topic { get; set; }
    }
}

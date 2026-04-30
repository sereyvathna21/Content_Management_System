using System;

namespace Backend.Models
{
    public class Media
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string StoragePath { get; set; } = string.Empty;
        public string PublicUrl { get; set; } = string.Empty;
        public string MimeType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public int? Width { get; set; }
        public int? Height { get; set; }
        public int? UploadedByUserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

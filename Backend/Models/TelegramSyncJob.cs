namespace Backend.Models
{
    public class TelegramSyncJob
    {
        public string Action { get; set; } = string.Empty; // "Create", "Update", "Delete"
        public string EntityType { get; set; } = string.Empty; // "News", "Law", "Publication"
        public Guid EntityId { get; set; }
        
        // Data needed for creating/updating
        public string? Caption { get; set; }
        public string? PhotoUrl { get; set; }
        public string? LinkUrl { get; set; }
        public string? LinkText { get; set; }
        
        // Physical file data for multipart uploads
        public string? LocalFilePath { get; set; }
        public string? FileType { get; set; } // "Document", "Photo", "Video", or "None"
        
        // Indicates if it's just a caption edit (no image changed)
        public bool IsCaptionOnlyEdit { get; set; }
    }
}

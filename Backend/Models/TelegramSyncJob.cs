namespace Backend.Models
{
    public class TelegramSyncJob
    {
        public TelegramSyncAction Action { get; set; }
        public TelegramEntityType EntityType { get; set; }
        public Guid EntityId { get; set; }
        
        // Data needed for creating/updating
        public string? Caption { get; set; }
        public string? PhotoUrl { get; set; }
        public List<string>? PhotoUrls { get; set; }
        public string? LinkUrl { get; set; }
        public string? LinkText { get; set; }
        
        // Physical file data for multipart uploads
        public string? LocalFilePath { get; set; }
        public List<string>? LocalFilePaths { get; set; }
        public string? ThumbnailPath { get; set; }
        public TelegramFileType FileType { get; set; } = TelegramFileType.None;
        public string? DisplayFileName { get; set; } // The human-readable file name to show in Telegram
        
        // Indicates if it's just a caption edit (no image changed)
        public bool IsCaptionOnlyEdit { get; set; }

        // The public URL of the file to fall back on if file size is too large
        public string? PublicFileUrl { get; set; }
    }
}

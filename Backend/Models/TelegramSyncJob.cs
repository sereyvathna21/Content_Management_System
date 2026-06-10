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
        
        // Indicates if it's just a caption edit (no image changed)
        public bool IsCaptionOnlyEdit { get; set; }
    }
}

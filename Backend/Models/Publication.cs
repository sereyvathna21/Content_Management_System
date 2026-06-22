using System;
using System.Collections.Generic;

namespace Backend.Models
{
    public class Publication
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Category { get; set; } = string.Empty;
        public DateTime? PublicationDate { get; set; }
        public string? Authors { get; set; }
        public string? CoverImageUrl { get; set; }
        
        public ContentStatus Status { get; set; } = ContentStatus.Draft;
        public DateTime? PublishAt { get; set; }
        public bool IsPublishedSyncTriggered { get; set; } = false;
        public TelegramSyncStatus TelegramSyncStatus { get; set; } = TelegramSyncStatus.NotSynced;
        public string? TelegramSyncErrorMessage { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<PublicationTranslation> Translations { get; set; } = new List<PublicationTranslation>();
    }
}

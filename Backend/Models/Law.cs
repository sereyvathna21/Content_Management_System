using System;
using System.Collections.Generic;

namespace Backend.Models
{
    public class Law
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Category { get; set; } = string.Empty;
        public DateTime? Date { get; set; }
        public string? CoverImageUrl { get; set; }
        
        public ContentStatus Status { get; set; } = ContentStatus.Draft;
        public DateTime? PublishAt { get; set; }
        public bool IsPublishedSyncTriggered { get; set; } = false;
        public TelegramSyncStatus TelegramSyncStatus { get; set; } = TelegramSyncStatus.NotSynced;
        public string? TelegramSyncErrorMessage { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<LawTranslation> Translations { get; set; } = new List<LawTranslation>();
    }
}

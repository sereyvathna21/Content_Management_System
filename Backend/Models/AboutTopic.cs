using System;
using System.Collections.Generic;

namespace Backend.Models
{
    public class AboutTopic
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Slug { get; set; } = string.Empty;
        public string TitleKm { get; set; } = string.Empty;
        public string? TitleEn { get; set; }
        public string? SubtitleKm { get; set; }
        public string? SubtitleEn { get; set; }
        public string? ReferenceKm { get; set; }
        public string? ReferenceEn { get; set; }
        public int SortOrder { get; set; }
        public TopicStatus Status { get; set; } = TopicStatus.Draft;
        public DateTime? PublishedAt { get; set; }
        public int? PublishedByUserId { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public int? UpdatedByUserId { get; set; }

        public TelegramSyncStatus TelegramSyncStatus { get; set; } = TelegramSyncStatus.NotSynced;
        public string? TelegramSyncErrorMessage { get; set; }

        public ICollection<AboutSection> Sections { get; set; } = new List<AboutSection>();
        public ICollection<AboutRevision> Revisions { get; set; } = new List<AboutRevision>();
        public ICollection<AboutReference> References { get; set; } = new List<AboutReference>();
    }
}

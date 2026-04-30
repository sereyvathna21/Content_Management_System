using System;
using System.Collections.Generic;

namespace Backend.Models
{
    public class SocialTopic
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Slug { get; set; } = string.Empty;
        public string TitleKm { get; set; } = string.Empty;
        public string? TitleEn { get; set; }
        public string? SubtitleKm { get; set; }
        public string? SubtitleEn { get; set; }
        public int SortOrder { get; set; }
        public TopicStatus Status { get; set; } = TopicStatus.Draft;
        public DateTime? PublishedAt { get; set; }
        public int? PublishedByUserId { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public int? UpdatedByUserId { get; set; }

        public ICollection<SocialSection> Sections { get; set; } = new List<SocialSection>();
        public ICollection<SocialRevision> Revisions { get; set; } = new List<SocialRevision>();
    }
}

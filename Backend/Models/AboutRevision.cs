using System;

namespace Backend.Models
{
    public class AboutRevision
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid TopicId { get; set; }
        public string SnapshotJson { get; set; } = string.Empty;
        public int RevisionNumber { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int? CreatedByUserId { get; set; }
        public string ActionType { get; set; } = string.Empty; // SaveDraft, Publish

        public AboutTopic? Topic { get; set; }
    }
}

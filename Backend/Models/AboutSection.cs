using System;
using System.Collections.Generic;

namespace Backend.Models
{
    public class AboutSection
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid TopicId { get; set; }
        public Guid? ParentSectionId { get; set; }
        public string SectionKey { get; set; } = string.Empty;
        public string TitleKm { get; set; } = string.Empty;
        public string? TitleEn { get; set; }
        public string ContentKm { get; set; } = string.Empty;
        public string? ContentEn { get; set; }
        public int SortOrder { get; set; }
        public int Depth { get; set; }
        public TopicStatus Status { get; set; } = TopicStatus.Draft;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public int? UpdatedByUserId { get; set; }

        public AboutTopic? Topic { get; set; }
        public AboutSection? ParentSection { get; set; }
        public ICollection<AboutSection> ChildSections { get; set; } = new List<AboutSection>();
        public ICollection<AboutSectionMedia> Media { get; set; } = new List<AboutSectionMedia>();
    }
}

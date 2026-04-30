using System;

namespace Backend.Models
{
    public class SocialSectionMedia
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid SectionId { get; set; }
        public Guid MediaId { get; set; }
        public ImagePosition Position { get; set; } = ImagePosition.Full;
        public string? CaptionKm { get; set; }
        public string? CaptionEn { get; set; }
        public string? AltKm { get; set; }
        public string? AltEn { get; set; }
        public int SortOrder { get; set; }

        public SocialSection? Section { get; set; }
        public Media? Media { get; set; }
    }
}

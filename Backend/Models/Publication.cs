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
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<PublicationTranslation> Translations { get; set; } = new List<PublicationTranslation>();
    }
}

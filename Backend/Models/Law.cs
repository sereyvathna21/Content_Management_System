using System;
using System.Collections.Generic;

namespace Backend.Models
{
    public class Law
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Category { get; set; } = string.Empty;
        public DateTime? Date { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<LawTranslation> Translations { get; set; } = new List<LawTranslation>();
    }
}

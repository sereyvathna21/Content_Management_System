using System;

namespace Backend.Models
{
    public class Contact
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool Read { get; set; }
        public bool Replied { get; set; }
        public DateTime? RepliedAt { get; set; }
    }
}

using System;

namespace Backend.Models
{
    public class Notification
    {
        public int Id { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Kind { get; set; } = "general";
        public string? TitleKm { get; set; }
        public string? TitleEn { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

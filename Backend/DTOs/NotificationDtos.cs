using System;

namespace Backend.DTOs
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Kind { get; set; } = "general";
        public string? TitleKm { get; set; }
        public string? TitleEn { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

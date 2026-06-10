namespace Backend.Models
{
    public class TelegramMessageMapping
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        /// <summary>
        /// "News", "Law", or "Publication"
        /// </summary>
        public string EntityType { get; set; } = string.Empty;

        /// <summary>
        /// The Guid ID of the News / Law / Publication entity.
        /// </summary>
        public Guid EntityId { get; set; }

        /// <summary>
        /// The message_id returned by Telegram Bot API.
        /// </summary>
        public long TelegramMessageId { get; set; }

        /// <summary>
        /// When the message was last sent/updated on Telegram.
        /// </summary>
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
}

using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Services
{
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _db;
        private readonly IHubContext<Hubs.NotificationHub> _hubContext;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            ApplicationDbContext db,
            IHubContext<Hubs.NotificationHub> hubContext,
            ILogger<NotificationService> logger)
        {
            _db = db;
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task SendPublicationNotificationAsync(Publication publication, string titleKm, string titleEn, string message, string kind = "publication")
        {
            try
            {
                // Create and save notification to database
                var notification = await CreateNotificationAsync(message, kind, titleKm, titleEn, publication.Id);

                // Send real-time notification to all connected clients
                await _hubContext.Clients.All.SendAsync("ReceiveNotification", new
                {
                    id = notification.Id,
                    titleKm = titleKm,
                    titleEn = titleEn,
                    message = message,
                    kind = kind,
                    publicationId = publication.Id,
                    createdAt = notification.CreatedAt
                });

                _logger.LogInformation($"Publication notification sent for publication {publication.Id}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending publication notification");
            }
        }

        public async Task SendGeneralNotificationAsync(string titleKm, string titleEn, string message)
        {
            try
            {
                // Create and save notification to database
                var notification = await CreateNotificationAsync(message, "general", titleKm, titleEn);

                // Send real-time notification to all connected clients
                await _hubContext.Clients.All.SendAsync("ReceiveNotification", new
                {
                    id = notification.Id,
                    titleKm = titleKm,
                    titleEn = titleEn,
                    message = message,
                    kind = "general",
                    createdAt = notification.CreatedAt
                });

                _logger.LogInformation("General notification sent");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending general notification");
            }
        }

        public async Task<Notification> CreateNotificationAsync(string message, string kind, string? titleKm, string? titleEn, Guid? publicationId = null)
        {
            var notification = new Notification
            {
                Message = message,
                Kind = kind,
                TitleKm = titleKm,
                TitleEn = titleEn,
                PublicationId = publicationId,
                CreatedAt = DateTime.UtcNow
            };

            _db.Notifications.Add(notification);
            await _db.SaveChangesAsync();

            return notification;
        }
    }
}

using Backend.Models;

namespace Backend.Services
{
    public interface INotificationService
    {
        /// <summary>
        /// Sends a publication notification to all connected users
        /// </summary>
        Task SendPublicationNotificationAsync(Publication publication, string titleKm, string titleEn, string message, string kind = "publication");

        /// <summary>
        /// Sends a general notification to all connected users
        /// </summary>
        Task SendGeneralNotificationAsync(string titleKm, string titleEn, string message);

        /// <summary>
        /// Saves a notification to the database
        /// </summary>
        Task<Notification> CreateNotificationAsync(string message, string kind, string? titleKm, string? titleEn, Guid? publicationId = null);
    }
}

namespace Backend.Models
{
    public enum TelegramSyncAction
    {
        Create,
        Update,
        Delete
    }

    public enum TelegramEntityType
    {
        News,
        Law,
        Publication
    }

    public enum TelegramFileType
    {
        None,
        Photo,
        Video,
        Document
    }
}

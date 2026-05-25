namespace Backend.Security
{
    public static class PermissionConstants
    {
        // News
        public const string NewsRead = "news:read";
        public const string NewsCreate = "news:create";
        public const string NewsUpdate = "news:update";
        public const string NewsDelete = "news:delete";

        // Videos
        public const string VideoRead = "video:read";
        public const string VideoCreate = "video:create";
        public const string VideoUpdate = "video:update";
        public const string VideoDelete = "video:delete";

        // Laws
        public const string LawsRead = "laws:read";
        public const string LawsCreate = "laws:create";
        public const string LawsUpdate = "laws:update";
        public const string LawsDelete = "laws:delete";

        // Publications
        public const string PublicationsRead = "publications:read";
        public const string PublicationsCreate = "publications:create";
        public const string PublicationsUpdate = "publications:update";
        public const string PublicationsDelete = "publications:delete";

        // Social
        public const string SocialRead = "social:read";
        public const string SocialCreate = "social:create";
        public const string SocialUpdate = "social:update";
        public const string SocialDelete = "social:delete";

        // Media
        public const string MediaCreate = "media:create";

        // Contact / Messages
        public const string ContactRead = "contact:read";
        public const string ContactCreate = "contact:create";
        public const string ContactUpdate = "contact:update";
        public const string ContactDelete = "contact:delete";

        // Notifications
        public const string NotificationsRead = "notifications:read";

        // Users Management
        public const string UsersRead = "users:read";
        public const string UsersCreate = "users:create";
        public const string UsersUpdate = "users:update";
        public const string UsersDelete = "users:delete";

        // Roles & Security Settings
        public const string RolesRead = "roles:read";
        public const string RolesCreate = "roles:create";
        public const string RolesUpdate = "roles:update";
        public const string RolesDelete = "roles:delete";
    }
}

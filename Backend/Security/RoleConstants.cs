namespace Backend.Security
{
    public static class RoleConstants
    {
        public const string User = "User";
        public const string Admin = "Admin";
        public const string SuperAdmin = "SuperAdmin";

        public static bool TryNormalize(string? role, out string normalized)
        {
            normalized = User;
            if (string.IsNullOrWhiteSpace(role))
            {
                return false;
            }

            switch (role.Trim().ToLowerInvariant())
            {
                case "user":
                    normalized = User;
                    return true;
                case "admin":
                    normalized = Admin;
                    return true;
                case "superadmin":
                case "super-admin":
                case "super_admin":
                    normalized = SuperAdmin;
                    return true;
                default:
                    return false;
            }
        }

        public static string NormalizeOrDefault(string? role, string fallback = User)
        {
            return TryNormalize(role, out var normalized) ? normalized : fallback;
        }
    }
}

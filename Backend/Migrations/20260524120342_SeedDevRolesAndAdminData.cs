using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class SeedDevRolesAndAdminData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Ensure pgcrypto available for bcrypt-style crypt()
            migrationBuilder.Sql("CREATE EXTENSION IF NOT EXISTS pgcrypto;");

            // Insert roles if missing
            migrationBuilder.Sql(@"
                                INSERT INTO ""Roles"" (""Name"", ""IsSystemRole"", ""Description"")
                                VALUES
                                    ('User', true, 'Default user role'),
                                    ('Admin', true, 'Administrator role'),
                                    ('SuperAdmin', true, 'Super administrator')
                                ON CONFLICT (""Name"") DO NOTHING;");

            // Insert a dev admin (password hashed using pgcrypto)
            migrationBuilder.Sql(@"
                            INSERT INTO ""Users"" (""FullName"", ""Email"", ""Password"", ""IsEmailVerified"", ""RoleId"", ""Role"", ""CreatedAt"")
                            SELECT 'Admin User', 'admin@example.com', crypt('12345678', gen_salt('bf',10)), true, r.""Id"", r.""Name"", now()
                            FROM ""Roles"" r
                            WHERE r.""Name"" = 'Admin'
                            AND NOT EXISTS (SELECT 1 FROM ""Users"" u WHERE u.""Email"" = 'admin@example.com');
                        ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove dev admin and roles (only if they match the seeded values)
            migrationBuilder.Sql(@"
                DELETE FROM ""Users"" WHERE ""Email"" = 'admin@example.com';
                DELETE FROM ""Roles"" WHERE ""Name"" IN ('User','Admin','SuperAdmin');
            ");
        }
    }
}

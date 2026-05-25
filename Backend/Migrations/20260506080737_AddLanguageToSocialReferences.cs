using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddLanguageToSocialReferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add the column and index only if the table exists to tolerate out-of-order
            // migrations when restoring a fresh DB.
            migrationBuilder.Sql(@"
    DO $$
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'SocialReferences') THEN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'SocialReferences' AND column_name = 'Language'
            ) THEN
                ALTER TABLE ""SocialReferences"" ADD COLUMN IF NOT EXISTS ""Language"" character varying(10) NOT NULL DEFAULT 'km';
            END IF;

            PERFORM 1;

            IF NOT EXISTS (
                SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                WHERE c.relname = 'IX_SocialReferences_TopicId_Language'
            ) THEN
                CREATE INDEX IF NOT EXISTS ""IX_SocialReferences_TopicId_Language"" ON ""SocialReferences"" (""TopicId"", ""Language"");
            END IF;
        END IF;
    END
    $$;"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove column and index only if they exist
            migrationBuilder.Sql(@"
    DO $$
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'SocialReferences') THEN
            IF EXISTS (
                SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                WHERE c.relname = 'IX_SocialReferences_TopicId_Language'
            ) THEN
                DROP INDEX IF EXISTS ""IX_SocialReferences_TopicId_Language"";
            END IF;

            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'SocialReferences' AND column_name = 'Language'
            ) THEN
                ALTER TABLE ""SocialReferences"" DROP COLUMN IF EXISTS ""Language"";
            END IF;
        END IF;
    END
    $$;"
            );
        }
    }
}

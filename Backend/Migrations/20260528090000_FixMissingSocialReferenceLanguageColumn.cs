using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Backend.Data;

#nullable disable

namespace Backend.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260528090000_FixMissingSocialReferenceLanguageColumn")]
    /// <inheritdoc />
    public partial class FixMissingSocialReferenceLanguageColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
ALTER TABLE IF EXISTS ""SocialReferences""
    ADD COLUMN IF NOT EXISTS ""Language"" character varying(10) NOT NULL DEFAULT 'km';

DO $$
BEGIN
    IF to_regclass('""SocialReferences""') IS NOT NULL THEN
        CREATE INDEX IF NOT EXISTS ""IX_SocialReferences_TopicId_Language""
            ON ""SocialReferences"" (""TopicId"", ""Language"");
    END IF;
END
$$;
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DO $$
BEGIN
    IF to_regclass('""SocialReferences""') IS NOT NULL THEN
        DROP INDEX IF EXISTS ""IX_SocialReferences_TopicId_Language"";
    END IF;
END
$$;

ALTER TABLE IF EXISTS ""SocialReferences""
    DROP COLUMN IF EXISTS ""Language"";
");
        }
    }
}
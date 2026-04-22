using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPublicationTranslationCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "PublicationTranslation",
                type: "text",
                nullable: true);

            // Backfill existing translation rows with the publication-level category
            migrationBuilder.Sql(@"
                UPDATE ""PublicationTranslation"" pt
                SET ""Category"" = p.""Category""
                FROM ""Publications"" p
                WHERE p.""Id"" = pt.""PublicationId"";
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "PublicationTranslation");
        }
    }
}

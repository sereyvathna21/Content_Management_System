using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddLawTranslationCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "LawTranslation",
                type: "text",
                nullable: true);

            migrationBuilder.Sql(@"
                UPDATE ""LawTranslation"" lt
                SET ""Category"" = l.""Category""
                FROM ""Laws"" l
                WHERE l.""Id"" = lt.""LawId"";
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "LawTranslation");
        }
    }
}

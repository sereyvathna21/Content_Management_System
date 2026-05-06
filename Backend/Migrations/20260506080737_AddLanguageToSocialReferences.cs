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
            migrationBuilder.AddColumn<string>(
                name: "Language",
                table: "SocialReferences",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "km");

            migrationBuilder.CreateIndex(
                name: "IX_SocialReferences_TopicId_Language",
                table: "SocialReferences",
                columns: new[] { "TopicId", "Language" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SocialReferences_TopicId_Language",
                table: "SocialReferences");

            migrationBuilder.DropColumn(
                name: "Language",
                table: "SocialReferences");
        }
    }
}

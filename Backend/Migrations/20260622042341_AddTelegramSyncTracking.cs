using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddTelegramSyncTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPublishedSyncTriggered",
                table: "Videos",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "TelegramSyncErrorMessage",
                table: "Videos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TelegramSyncStatus",
                table: "Videos",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "TelegramSyncErrorMessage",
                table: "SocialTopics",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TelegramSyncStatus",
                table: "SocialTopics",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "TelegramSyncErrorMessage",
                table: "Publications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TelegramSyncStatus",
                table: "Publications",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "TelegramSyncErrorMessage",
                table: "NewsArticles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TelegramSyncStatus",
                table: "NewsArticles",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "TelegramSyncErrorMessage",
                table: "Laws",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TelegramSyncStatus",
                table: "Laws",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPublishedSyncTriggered",
                table: "Videos");

            migrationBuilder.DropColumn(
                name: "TelegramSyncErrorMessage",
                table: "Videos");

            migrationBuilder.DropColumn(
                name: "TelegramSyncStatus",
                table: "Videos");

            migrationBuilder.DropColumn(
                name: "TelegramSyncErrorMessage",
                table: "SocialTopics");

            migrationBuilder.DropColumn(
                name: "TelegramSyncStatus",
                table: "SocialTopics");

            migrationBuilder.DropColumn(
                name: "TelegramSyncErrorMessage",
                table: "Publications");

            migrationBuilder.DropColumn(
                name: "TelegramSyncStatus",
                table: "Publications");

            migrationBuilder.DropColumn(
                name: "TelegramSyncErrorMessage",
                table: "NewsArticles");

            migrationBuilder.DropColumn(
                name: "TelegramSyncStatus",
                table: "NewsArticles");

            migrationBuilder.DropColumn(
                name: "TelegramSyncErrorMessage",
                table: "Laws");

            migrationBuilder.DropColumn(
                name: "TelegramSyncStatus",
                table: "Laws");
        }
    }
}

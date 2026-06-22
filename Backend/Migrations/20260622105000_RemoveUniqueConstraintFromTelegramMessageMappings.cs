using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUniqueConstraintFromTelegramMessageMappings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TelegramMessageMappings_EntityType_EntityId",
                table: "TelegramMessageMappings");

            migrationBuilder.CreateIndex(
                name: "IX_TelegramMessageMappings_EntityType_EntityId",
                table: "TelegramMessageMappings",
                columns: new[] { "EntityType", "EntityId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TelegramMessageMappings_EntityType_EntityId",
                table: "TelegramMessageMappings");

            migrationBuilder.CreateIndex(
                name: "IX_TelegramMessageMappings_EntityType_EntityId",
                table: "TelegramMessageMappings",
                columns: new[] { "EntityType", "EntityId" },
                unique: true);
        }
    }
}

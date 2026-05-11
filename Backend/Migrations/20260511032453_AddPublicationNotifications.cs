using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPublicationNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PublicationId",
                table: "Notifications",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_PublicationId",
                table: "Notifications",
                column: "PublicationId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Publications_PublicationId",
                table: "Notifications",
                column: "PublicationId",
                principalTable: "Publications",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Publications_PublicationId",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_PublicationId",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "PublicationId",
                table: "Notifications");
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddSchedulingToLawsAndPublications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPublishedSyncTriggered",
                table: "Publications",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "PublishAt",
                table: "Publications",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Publications",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsPublishedSyncTriggered",
                table: "NewsArticles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsPublishedSyncTriggered",
                table: "Laws",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "PublishAt",
                table: "Laws",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
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
                table: "Publications");

            migrationBuilder.DropColumn(
                name: "PublishAt",
                table: "Publications");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Publications");

            migrationBuilder.DropColumn(
                name: "IsPublishedSyncTriggered",
                table: "NewsArticles");

            migrationBuilder.DropColumn(
                name: "IsPublishedSyncTriggered",
                table: "Laws");

            migrationBuilder.DropColumn(
                name: "PublishAt",
                table: "Laws");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Laws");
        }
    }
}

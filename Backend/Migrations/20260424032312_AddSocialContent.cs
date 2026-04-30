using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddSocialContent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Media",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StoragePath = table.Column<string>(type: "text", nullable: false),
                    PublicUrl = table.Column<string>(type: "text", nullable: false),
                    MimeType = table.Column<string>(type: "text", nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    Width = table.Column<int>(type: "integer", nullable: true),
                    Height = table.Column<int>(type: "integer", nullable: true),
                    UploadedByUserId = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Media", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SocialTopics",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Slug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TitleKm = table.Column<string>(type: "text", nullable: false),
                    TitleEn = table.Column<string>(type: "text", nullable: true),
                    SubtitleKm = table.Column<string>(type: "text", nullable: true),
                    SubtitleEn = table.Column<string>(type: "text", nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    PublishedByUserId = table.Column<int>(type: "integer", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedByUserId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SocialTopics", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SocialRevisions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TopicId = table.Column<Guid>(type: "uuid", nullable: false),
                    SnapshotJson = table.Column<string>(type: "text", nullable: false),
                    RevisionNumber = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedByUserId = table.Column<int>(type: "integer", nullable: true),
                    ActionType = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SocialRevisions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SocialRevisions_SocialTopics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "SocialTopics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SocialSections",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TopicId = table.Column<Guid>(type: "uuid", nullable: false),
                    ParentSectionId = table.Column<Guid>(type: "uuid", nullable: true),
                    SectionKey = table.Column<string>(type: "text", nullable: false),
                    TitleKm = table.Column<string>(type: "text", nullable: false),
                    TitleEn = table.Column<string>(type: "text", nullable: true),
                    ContentKm = table.Column<string>(type: "text", nullable: false),
                    ContentEn = table.Column<string>(type: "text", nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    Depth = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedByUserId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SocialSections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SocialSections_SocialSections_ParentSectionId",
                        column: x => x.ParentSectionId,
                        principalTable: "SocialSections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SocialSections_SocialTopics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "SocialTopics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SocialSectionMedia",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SectionId = table.Column<Guid>(type: "uuid", nullable: false),
                    MediaId = table.Column<Guid>(type: "uuid", nullable: false),
                    Position = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CaptionKm = table.Column<string>(type: "text", nullable: true),
                    CaptionEn = table.Column<string>(type: "text", nullable: true),
                    AltKm = table.Column<string>(type: "text", nullable: true),
                    AltEn = table.Column<string>(type: "text", nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SocialSectionMedia", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SocialSectionMedia_Media_MediaId",
                        column: x => x.MediaId,
                        principalTable: "Media",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SocialSectionMedia_SocialSections_SectionId",
                        column: x => x.SectionId,
                        principalTable: "SocialSections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SocialRevisions_RevisionNumber",
                table: "SocialRevisions",
                column: "RevisionNumber");

            migrationBuilder.CreateIndex(
                name: "IX_SocialRevisions_TopicId",
                table: "SocialRevisions",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_SocialSectionMedia_MediaId",
                table: "SocialSectionMedia",
                column: "MediaId");

            migrationBuilder.CreateIndex(
                name: "IX_SocialSectionMedia_SectionId",
                table: "SocialSectionMedia",
                column: "SectionId");

            migrationBuilder.CreateIndex(
                name: "IX_SocialSectionMedia_SortOrder",
                table: "SocialSectionMedia",
                column: "SortOrder");

            migrationBuilder.CreateIndex(
                name: "IX_SocialSections_ParentSectionId",
                table: "SocialSections",
                column: "ParentSectionId");

            migrationBuilder.CreateIndex(
                name: "IX_SocialSections_SectionKey",
                table: "SocialSections",
                column: "SectionKey");

            migrationBuilder.CreateIndex(
                name: "IX_SocialSections_SortOrder",
                table: "SocialSections",
                column: "SortOrder");

            migrationBuilder.CreateIndex(
                name: "IX_SocialSections_Status",
                table: "SocialSections",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_SocialSections_TopicId",
                table: "SocialSections",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_SocialTopics_Slug",
                table: "SocialTopics",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SocialTopics_SortOrder",
                table: "SocialTopics",
                column: "SortOrder");

            migrationBuilder.CreateIndex(
                name: "IX_SocialTopics_Status",
                table: "SocialTopics",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SocialRevisions");

            migrationBuilder.DropTable(
                name: "SocialSectionMedia");

            migrationBuilder.DropTable(
                name: "Media");

            migrationBuilder.DropTable(
                name: "SocialSections");

            migrationBuilder.DropTable(
                name: "SocialTopics");
        }
    }
}

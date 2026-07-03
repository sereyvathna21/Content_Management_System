using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddAboutUsManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AboutAuditLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Action = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    EntityType = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    EntityId = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    TopicId = table.Column<Guid>(type: "uuid", nullable: true),
                    SectionId = table.Column<Guid>(type: "uuid", nullable: true),
                    UserId = table.Column<int>(type: "integer", nullable: true),
                    MetadataJson = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AboutAuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AboutTopics",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Slug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TitleKm = table.Column<string>(type: "text", nullable: false),
                    TitleEn = table.Column<string>(type: "text", nullable: true),
                    SubtitleKm = table.Column<string>(type: "text", nullable: true),
                    SubtitleEn = table.Column<string>(type: "text", nullable: true),
                    ReferenceKm = table.Column<string>(type: "text", nullable: true),
                    ReferenceEn = table.Column<string>(type: "text", nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    PublishedByUserId = table.Column<int>(type: "integer", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedByUserId = table.Column<int>(type: "integer", nullable: true),
                    TelegramSyncStatus = table.Column<int>(type: "integer", nullable: false),
                    TelegramSyncErrorMessage = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AboutTopics", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AboutReferences",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TopicId = table.Column<Guid>(type: "uuid", nullable: false),
                    Language = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    TitleKm = table.Column<string>(type: "text", nullable: true),
                    TitleEn = table.Column<string>(type: "text", nullable: true),
                    FileName = table.Column<string>(type: "character varying(260)", maxLength: 260, nullable: false),
                    StoragePath = table.Column<string>(type: "text", nullable: false),
                    PublicUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    MimeType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    FileSizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    UploadedByUserId = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AboutReferences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AboutReferences_AboutTopics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "AboutTopics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AboutRevisions",
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
                    table.PrimaryKey("PK_AboutRevisions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AboutRevisions_AboutTopics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "AboutTopics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AboutSections",
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
                    table.PrimaryKey("PK_AboutSections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AboutSections_AboutSections_ParentSectionId",
                        column: x => x.ParentSectionId,
                        principalTable: "AboutSections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AboutSections_AboutTopics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "AboutTopics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AboutSectionMedia",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SectionId = table.Column<Guid>(type: "uuid", nullable: false),
                    MediaId = table.Column<Guid>(type: "uuid", nullable: false),
                    Position = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Language = table.Column<int>(type: "integer", nullable: false),
                    CaptionKm = table.Column<string>(type: "text", nullable: true),
                    CaptionEn = table.Column<string>(type: "text", nullable: true),
                    AltKm = table.Column<string>(type: "text", nullable: true),
                    AltEn = table.Column<string>(type: "text", nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    Width = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AboutSectionMedia", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AboutSectionMedia_AboutSections_SectionId",
                        column: x => x.SectionId,
                        principalTable: "AboutSections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AboutSectionMedia_Media_MediaId",
                        column: x => x.MediaId,
                        principalTable: "Media",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AboutAuditLogs_CreatedAt",
                table: "AboutAuditLogs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_AboutAuditLogs_SectionId",
                table: "AboutAuditLogs",
                column: "SectionId");

            migrationBuilder.CreateIndex(
                name: "IX_AboutAuditLogs_TopicId",
                table: "AboutAuditLogs",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_AboutReferences_SortOrder",
                table: "AboutReferences",
                column: "SortOrder");

            migrationBuilder.CreateIndex(
                name: "IX_AboutReferences_TopicId",
                table: "AboutReferences",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_AboutReferences_TopicId_Language",
                table: "AboutReferences",
                columns: new[] { "TopicId", "Language" });

            migrationBuilder.CreateIndex(
                name: "IX_AboutRevisions_RevisionNumber",
                table: "AboutRevisions",
                column: "RevisionNumber");

            migrationBuilder.CreateIndex(
                name: "IX_AboutRevisions_TopicId",
                table: "AboutRevisions",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_AboutSectionMedia_MediaId",
                table: "AboutSectionMedia",
                column: "MediaId");

            migrationBuilder.CreateIndex(
                name: "IX_AboutSectionMedia_SectionId",
                table: "AboutSectionMedia",
                column: "SectionId");

            migrationBuilder.CreateIndex(
                name: "IX_AboutSectionMedia_SortOrder",
                table: "AboutSectionMedia",
                column: "SortOrder");

            migrationBuilder.CreateIndex(
                name: "IX_AboutSections_ParentSectionId",
                table: "AboutSections",
                column: "ParentSectionId");

            migrationBuilder.CreateIndex(
                name: "IX_AboutSections_SectionKey",
                table: "AboutSections",
                column: "SectionKey");

            migrationBuilder.CreateIndex(
                name: "IX_AboutSections_SortOrder",
                table: "AboutSections",
                column: "SortOrder");

            migrationBuilder.CreateIndex(
                name: "IX_AboutSections_Status",
                table: "AboutSections",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_AboutSections_TopicId",
                table: "AboutSections",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_AboutTopics_Slug",
                table: "AboutTopics",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AboutTopics_SortOrder",
                table: "AboutTopics",
                column: "SortOrder");

            migrationBuilder.CreateIndex(
                name: "IX_AboutTopics_Status",
                table: "AboutTopics",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AboutAuditLogs");

            migrationBuilder.DropTable(
                name: "AboutReferences");

            migrationBuilder.DropTable(
                name: "AboutRevisions");

            migrationBuilder.DropTable(
                name: "AboutSectionMedia");

            migrationBuilder.DropTable(
                name: "AboutSections");

            migrationBuilder.DropTable(
                name: "AboutTopics");
        }
    }
}

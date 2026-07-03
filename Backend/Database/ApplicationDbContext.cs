using Microsoft.EntityFrameworkCore;
using Backend.Models;
using System.Linq;

namespace Backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<SecurityAuditLog> SecurityAuditLogs { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<Contact> Contacts { get; set; }
        public DbSet<Law> Laws { get; set; }
        public DbSet<LawTranslation> LawTranslations { get; set; }
        public DbSet<Publication> Publications { get; set; }
        public DbSet<PublicationTranslation> PublicationTranslations { get; set; }
        public DbSet<NewsArticle> NewsArticles { get; set; }
        public DbSet<NewsArticleTranslation> NewsArticleTranslations { get; set; }
        public DbSet<Video> Videos { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<TelegramMessageMapping> TelegramMessageMappings { get; set; }

        // Social Content
        public DbSet<SocialTopic> SocialTopics { get; set; }
        public DbSet<SocialSection> SocialSections { get; set; }
        public DbSet<Media> Media { get; set; }
        public DbSet<SocialSectionMedia> SocialSectionMedia { get; set; }
        public DbSet<SocialRevision> SocialRevisions { get; set; }
        public DbSet<SocialAuditLog> SocialAuditLogs { get; set; }
        public DbSet<SocialReference> SocialReferences { get; set; }

        // About Us Content
        public DbSet<AboutTopic> AboutTopics { get; set; }
        public DbSet<AboutSection> AboutSections { get; set; }
        public DbSet<AboutSectionMedia> AboutSectionMedia { get; set; }
        public DbSet<AboutRevision> AboutRevisions { get; set; }
        public DbSet<AboutAuditLog> AboutAuditLogs { get; set; }
        public DbSet<AboutReference> AboutReferences { get; set; }

        public DbSet<SystemSetting> SystemSettings { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<TelegramMessageMapping>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.EntityType, e.EntityId });
            });

            modelBuilder.Entity<Role>(b =>
            {
                b.HasKey(x => x.Id);
                b.HasIndex(x => x.Name).IsUnique();
                b.Property(x => x.Name).HasMaxLength(100).IsRequired();
                b.Property(x => x.Description).HasMaxLength(500);
            });

            modelBuilder.Entity<Permission>(b =>
            {
                b.HasKey(x => x.Id);
                b.HasIndex(x => x.Name).IsUnique();
                b.Property(x => x.Name).HasMaxLength(120).IsRequired();
                b.Property(x => x.Description).HasMaxLength(500);
            });

            modelBuilder.Entity<RolePermission>(b =>
            {
                b.HasKey(x => new { x.RoleId, x.PermissionId });
                b.HasOne(x => x.Role)
                    .WithMany(r => r.RolePermissions)
                    .HasForeignKey(x => x.RoleId)
                    .OnDelete(DeleteBehavior.Cascade);
                b.HasOne(x => x.Permission)
                    .WithMany(p => p.RolePermissions)
                    .HasForeignKey(x => x.PermissionId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<AuditLog>(b =>
            {
                b.HasKey(x => x.Id);
                b.HasIndex(x => x.CreatedAt);
                b.HasIndex(x => x.ActorUserId);
                b.HasIndex(x => x.Action);
                b.HasIndex(x => new { x.EntityType, x.EntityId });
                b.Property(x => x.Action).HasMaxLength(120).IsRequired();
                b.Property(x => x.EntityType).HasMaxLength(100).IsRequired();
                b.Property(x => x.EntityId).HasMaxLength(120);
                b.Property(x => x.Summary).HasMaxLength(500).IsRequired();
                b.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
                b.Property(x => x.ActorEmail).HasMaxLength(320).IsRequired();
                b.Property(x => x.ActorRole).HasMaxLength(100);
                b.Property(x => x.IpAddress).HasMaxLength(64);
                b.Property(x => x.UserAgent).HasMaxLength(500);
                b.Property(x => x.Metadata).HasColumnType("jsonb");
                b.Property(x => x.ErrorMessage).HasMaxLength(1000);
                b.Property(x => x.RequestId).HasMaxLength(100);
                b.Property(x => x.CorrelationId).HasMaxLength(100);
                b.Property(x => x.SessionId).HasMaxLength(100);
                b.Property(x => x.TenantId).HasMaxLength(100);
            });

            modelBuilder.Entity<SecurityAuditLog>(b =>
            {
                b.HasKey(x => x.Id);
                b.HasIndex(x => x.CreatedAt);
                b.Property(x => x.ActorEmail).HasMaxLength(320).IsRequired();
                b.Property(x => x.Action).HasMaxLength(100).IsRequired();
                b.Property(x => x.TargetId).HasMaxLength(100).IsRequired();
            });

            modelBuilder.Entity<User>(b =>
            {
                b.HasOne(x => x.Role)
                    .WithMany(r => r.Users)
                    .HasForeignKey(x => x.RoleId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Law>(b =>
            {
                b.HasKey(x => x.Id);
                b.HasMany(x => x.Translations).WithOne(t => t.Law).HasForeignKey(t => t.LawId).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<LawTranslation>(b =>
            {
                b.HasKey(x => x.Id);
                b.HasIndex(x => new { x.LawId, x.Language }).IsUnique();
                b.Property(x => x.Language).HasMaxLength(10);
            });

            modelBuilder.Entity<Publication>(b =>
            {
                b.HasKey(x => x.Id);
                b.HasMany(x => x.Translations)
                    .WithOne(t => t.Publication)
                    .HasForeignKey(t => t.PublicationId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<PublicationTranslation>(b =>
            {
                b.HasKey(x => x.Id);
                b.HasIndex(x => new { x.PublicationId, x.Language }).IsUnique();
                b.Property(x => x.Language).HasMaxLength(10);
            });

            modelBuilder.Entity<NewsArticle>(b =>
            {
                b.HasKey(x => x.Id);
                b.HasIndex(x => x.Slug).IsUnique();
                b.HasIndex(x => x.Status);
                b.HasIndex(x => x.PublishAt);
                b.Property(x => x.Slug).HasMaxLength(200).IsRequired();
                b.Property(x => x.Category).HasMaxLength(100);
                b.Property(x => x.Status).HasConversion<string>().HasMaxLength(50);

                b.HasMany(x => x.Translations)
                    .WithOne(t => t.Article)
                    .HasForeignKey(t => t.ArticleId)
                    .OnDelete(DeleteBehavior.Cascade);

                b.HasOne(x => x.ImageMedia)
                    .WithMany()
                    .HasForeignKey(x => x.ImageMediaId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<NewsArticleTranslation>(b =>
            {
                b.HasKey(x => x.Id);
                b.HasIndex(x => new { x.ArticleId, x.Language }).IsUnique();
                b.Property(x => x.Language).HasMaxLength(10).IsRequired();
                b.Property(x => x.Title).HasMaxLength(500);
                b.Property(x => x.Excerpt).HasMaxLength(2000);
                b.Property(x => x.MetaTitle).HasMaxLength(500);
                b.Property(x => x.MetaDescription).HasMaxLength(1000);
                b.Property(x => x.CanonicalUrl).HasMaxLength(500);
            });

            modelBuilder.Entity<Video>(b =>
            {
                b.HasKey(x => x.Id);
                b.HasIndex(x => x.Status);
                b.HasIndex(x => x.PublishAt);
                b.Property(x => x.EmbedUrl).HasMaxLength(1000).IsRequired();
                b.Property(x => x.Title).HasMaxLength(500).IsRequired();
                b.Property(x => x.Description).HasMaxLength(2000).IsRequired();
                b.Property(x => x.Category).HasMaxLength(100);
                b.Property(x => x.Status).HasConversion<string>().HasMaxLength(50);

                b.HasOne(x => x.ThumbnailMedia)
                    .WithMany()
                    .HasForeignKey(x => x.ThumbnailMediaId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<Notification>(b =>
            {
                b.HasKey(x => x.Id);
                b.Property(x => x.Message).HasMaxLength(1000).IsRequired();
                b.Property(x => x.Kind).HasMaxLength(30).IsRequired();
                b.Property(x => x.TitleKm).HasMaxLength(500);
                b.Property(x => x.TitleEn).HasMaxLength(500);
                b.HasIndex(x => x.CreatedAt);
                b.HasOne(x => x.Publication)
                    .WithMany()
                    .HasForeignKey(x => x.PublicationId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<SocialTopic>(b =>
            {
                b.HasKey(x => x.Id);
                b.HasIndex(x => x.Slug).IsUnique();
                b.HasIndex(x => x.Status);
                b.HasIndex(x => x.SortOrder);
                b.Property(x => x.Slug).HasMaxLength(100).IsRequired();
                b.Property(x => x.Status).HasConversion<string>().HasMaxLength(50);

                b.HasMany(x => x.Sections)
                    .WithOne(s => s.Topic)
                    .HasForeignKey(s => s.TopicId)
                    .OnDelete(DeleteBehavior.Cascade);

                b.HasMany(x => x.Revisions)
                    .WithOne(r => r.Topic)
                    .HasForeignKey(r => r.TopicId)
                    .OnDelete(DeleteBehavior.Cascade);

                b.HasMany(x => x.References)
                    .WithOne(r => r.Topic)
                    .HasForeignKey(r => r.TopicId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<SocialSection>(b =>
            {
                b.HasKey(x => x.Id);
                b.HasIndex(x => x.SortOrder);
                b.HasIndex(x => x.Status);
                b.HasIndex(x => x.SectionKey);
                b.Property(x => x.Status).HasConversion<string>().HasMaxLength(50);

                b.HasOne(x => x.ParentSection)
                    .WithMany(p => p.ChildSections)
                    .HasForeignKey(x => x.ParentSectionId)
                    .OnDelete(DeleteBehavior.Restrict);

                b.HasMany(x => x.Media)
                    .WithOne(m => m.Section)
                    .HasForeignKey(m => m.SectionId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<SocialSectionMedia>(b =>
            {
                b.HasKey(x => x.Id);
                b.HasIndex(x => x.SortOrder);
                b.Property(x => x.Position).HasConversion<string>().HasMaxLength(50);

                b.HasOne(x => x.Media)
                    .WithMany()
                    .HasForeignKey(x => x.MediaId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Media>(b =>
            {
                b.HasKey(x => x.Id);
            });

            modelBuilder.Entity<SocialRevision>(b =>
            {
                b.HasKey(x => x.Id);
                b.HasIndex(x => x.RevisionNumber);
            });

            modelBuilder.Entity<SocialReference>(b =>
            {
                b.HasKey(x => x.Id);
                b.HasIndex(x => x.TopicId);
                b.HasIndex(x => x.SortOrder);
                b.HasIndex(x => new { x.TopicId, x.Language });
                b.Property(x => x.FileName).HasMaxLength(260).IsRequired();
                b.Property(x => x.PublicUrl).HasMaxLength(500).IsRequired();
                b.Property(x => x.MimeType).HasMaxLength(100).IsRequired();
                b.Property(x => x.Language).HasMaxLength(10).IsRequired();
            });

            modelBuilder.Entity<SocialAuditLog>(b =>
            {
                b.HasKey(x => x.Id);
                b.HasIndex(x => x.CreatedAt);
                b.HasIndex(x => x.TopicId);
                b.HasIndex(x => x.SectionId);
                b.Property(x => x.Action).HasMaxLength(60).IsRequired();
                b.Property(x => x.EntityType).HasMaxLength(60).IsRequired();
                b.Property(x => x.EntityId).HasMaxLength(80);
            });

            modelBuilder.Entity<AboutTopic>(b =>
            {
                b.HasKey(x => x.Id);
                b.HasIndex(x => x.Slug).IsUnique();
                b.HasIndex(x => x.Status);
                b.HasIndex(x => x.SortOrder);
                b.Property(x => x.Slug).HasMaxLength(100).IsRequired();
                b.Property(x => x.Status).HasConversion<string>().HasMaxLength(50);

                b.HasMany(x => x.Sections)
                    .WithOne(s => s.Topic)
                    .HasForeignKey(s => s.TopicId)
                    .OnDelete(DeleteBehavior.Cascade);

                b.HasMany(x => x.Revisions)
                    .WithOne(r => r.Topic)
                    .HasForeignKey(r => r.TopicId)
                    .OnDelete(DeleteBehavior.Cascade);

                b.HasMany(x => x.References)
                    .WithOne(r => r.Topic)
                    .HasForeignKey(r => r.TopicId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<AboutSection>(b =>
            {
                b.HasKey(x => x.Id);
                b.HasIndex(x => x.SortOrder);
                b.HasIndex(x => x.Status);
                b.HasIndex(x => x.SectionKey);
                b.Property(x => x.Status).HasConversion<string>().HasMaxLength(50);

                b.HasOne(x => x.ParentSection)
                    .WithMany(p => p.ChildSections)
                    .HasForeignKey(x => x.ParentSectionId)
                    .OnDelete(DeleteBehavior.Restrict);

                b.HasMany(x => x.Media)
                    .WithOne(m => m.Section)
                    .HasForeignKey(m => m.SectionId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<AboutSectionMedia>(b =>
            {
                b.HasKey(x => x.Id);
                b.HasIndex(x => x.SortOrder);
                b.Property(x => x.Position).HasConversion<string>().HasMaxLength(50);

                b.HasOne(x => x.Media)
                    .WithMany()
                    .HasForeignKey(x => x.MediaId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<AboutRevision>(b =>
            {
                b.HasKey(x => x.Id);
                b.HasIndex(x => x.RevisionNumber);
            });

            modelBuilder.Entity<AboutReference>(b =>
            {
                b.HasKey(x => x.Id);
                b.HasIndex(x => x.TopicId);
                b.HasIndex(x => x.SortOrder);
                b.HasIndex(x => new { x.TopicId, x.Language });
                b.Property(x => x.FileName).HasMaxLength(260).IsRequired();
                b.Property(x => x.PublicUrl).HasMaxLength(500).IsRequired();
                b.Property(x => x.MimeType).HasMaxLength(100).IsRequired();
                b.Property(x => x.Language).HasMaxLength(10).IsRequired();
            });

            modelBuilder.Entity<AboutAuditLog>(b =>
            {
                b.HasKey(x => x.Id);
                b.HasIndex(x => x.CreatedAt);
                b.HasIndex(x => x.TopicId);
                b.HasIndex(x => x.SectionId);
                b.Property(x => x.Action).HasMaxLength(60).IsRequired();
                b.Property(x => x.EntityType).HasMaxLength(60).IsRequired();
                b.Property(x => x.EntityId).HasMaxLength(80);
            });
        }

        public override int SaveChanges()
        {
            ValidateUsers();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            ValidateUsers();
            return base.SaveChangesAsync(cancellationToken);
        }

        private void ValidateUsers()
        {
            var invalidUser = ChangeTracker.Entries<User>()
                .Where(entry => entry.State == EntityState.Added || entry.State == EntityState.Modified)
                .Select(entry => entry.Entity)
                .FirstOrDefault(user => string.IsNullOrWhiteSpace(user.Password));

            if (invalidUser != null)
            {
                throw new InvalidOperationException("User password is required and cannot be empty.");
            }
        }
    }
}

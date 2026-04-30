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
        public DbSet<Contact> Contacts { get; set; }
        public DbSet<Law> Laws { get; set; }
        public DbSet<LawTranslation> LawTranslations { get; set; }
        public DbSet<Publication> Publications { get; set; }
        public DbSet<PublicationTranslation> PublicationTranslations { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        // Social Content
        public DbSet<SocialTopic> SocialTopics { get; set; }
        public DbSet<SocialSection> SocialSections { get; set; }
        public DbSet<Media> Media { get; set; }
        public DbSet<SocialSectionMedia> SocialSectionMedia { get; set; }
        public DbSet<SocialRevision> SocialRevisions { get; set; }
        public DbSet<SocialAuditLog> SocialAuditLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

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

            modelBuilder.Entity<Notification>(b =>
            {
                b.HasKey(x => x.Id);
                b.Property(x => x.Message).HasMaxLength(1000).IsRequired();
                b.Property(x => x.Kind).HasMaxLength(30).IsRequired();
                b.Property(x => x.TitleKm).HasMaxLength(500);
                b.Property(x => x.TitleEn).HasMaxLength(500);
                b.HasIndex(x => x.CreatedAt);
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

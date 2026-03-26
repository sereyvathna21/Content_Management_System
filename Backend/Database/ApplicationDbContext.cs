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
        public DbSet<Models.Contact> Contacts { get; set; }
        public DbSet<Models.Law> Laws { get; set; }
        public DbSet<Models.LawTranslation> LawTranslations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Models.Law>(b =>
            {
                b.HasKey(x => x.Id);
                b.HasMany(x => x.Translations).WithOne(t => t.Law).HasForeignKey(t => t.LawId).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Models.LawTranslation>(b =>
            {
                b.HasKey(x => x.Id);
                b.HasIndex(x => new { x.LawId, x.Language }).IsUnique();
                b.Property(x => x.Language).HasMaxLength(10);
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

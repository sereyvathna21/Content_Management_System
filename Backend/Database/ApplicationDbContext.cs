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

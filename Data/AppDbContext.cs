using Microsoft.EntityFrameworkCore;
using MyPostgresApp.Models;

namespace MyPostgresApp.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().ToTable("users");
            modelBuilder.Entity<User>().HasKey(u => u.UserId);
            modelBuilder.Entity<User>().Property(u => u.Email).IsRequired().HasMaxLength(128);
            modelBuilder.Entity<User>().Property(u => u.Password).IsRequired().HasMaxLength(128);
            modelBuilder.Entity<User>().Property(u => u.Nickname).HasMaxLength(128);
            
        }
    }
}

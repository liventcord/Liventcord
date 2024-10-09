//Data/AppDbContext.cs
using Microsoft.EntityFrameworkCore;
using MyPostgresApp.Models;

namespace MyPostgresApp.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

        public DbSet<User> Users { get; set; }
        public DbSet<Friend> Friends { get; set; }
        public DbSet<UserDm> UserDms { get; set; } 
        public DbSet<TypingStatus> TypingStatuses { get; set; }
        public DbSet<Guild> Guilds { get; set; }
        public DbSet<GuildUser> GuildUsers { get; set; } 

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().ToTable("users");
            modelBuilder.Entity<User>().HasKey(u => u.UserId);
            modelBuilder.Entity<User>().Property(u => u.Email).IsRequired().HasMaxLength(128);
            modelBuilder.Entity<User>().Property(u => u.Password).IsRequired().HasMaxLength(128);
            modelBuilder.Entity<User>().Property(u => u.Nickname).HasMaxLength(128);
            
            modelBuilder.Entity<Friend>().ToTable("friends");
            modelBuilder.Entity<Friend>().HasKey(f => new { f.UserId, f.FriendId });
            modelBuilder.Entity<Friend>().Property(f => f.UserId).HasColumnName("user_id").IsRequired();
            modelBuilder.Entity<Friend>().Property(f => f.FriendId).HasColumnName("friend_id").IsRequired();
            modelBuilder.Entity<Friend>().Property(f => f.Status).HasColumnName("status").IsRequired().HasMaxLength(20);



            modelBuilder.Entity<TypingStatus>().ToTable("typing_statuses");
            modelBuilder.Entity<TypingStatus>().HasKey(ts => new { ts.UserId, ts.GuildId, ts.ChannelId });
            modelBuilder.Entity<TypingStatus>().Property(ts => ts.UserId).IsRequired();
            modelBuilder.Entity<TypingStatus>().Property(ts => ts.GuildId).IsRequired();
            modelBuilder.Entity<TypingStatus>().Property(ts => ts.ChannelId).IsRequired();

            modelBuilder.Entity<UserDm>()
                .ToTable("user_dms")
                .HasKey(ud => new { ud.UserId, ud.FriendId }); 

            modelBuilder.Entity<UserDm>()
                .HasOne<User>() 
                .WithMany()
                .HasForeignKey(ud => ud.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserDm>()
                .HasOne<User>() 
                .WithMany()
                .HasForeignKey(ud => ud.FriendId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<GuildUser>()
                .HasKey(gu => new { gu.GuildId, gu.UserId });

            modelBuilder.Entity<GuildUser>()
                .HasOne(gu => gu.Guild)
                .WithMany(g => g.GuildUsers)
                .HasForeignKey(gu => gu.GuildId);

            modelBuilder.Entity<GuildUser>()
                .HasOne(gu => gu.User)
                .WithMany(u => u.GuildUsers)
                .HasForeignKey(gu => gu.UserId);
        }
    }
}

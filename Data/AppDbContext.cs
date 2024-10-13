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
        public DbSet<Channel> Channels { get; set; }
        public DbSet<GuildUser> GuildUsers { get; set; } 
        public DbSet<GuildPermissions> GuildPermissions { get; set; }
        public DbSet<AttachmentFile> AttachmentFiles { get; set; }
        public DbSet<EmojiFile> EmojiFiles { get; set; }
        public DbSet<ProfileFile> ProfileFiles { get; set; }
        public DbSet<GuildFile> GuildFiles { get; set; }
        public DbSet<UserChannel> UserChannels { get; set; }
        
        public void RecreateDatabase()
        {
            Database.EnsureDeleted();
            Database.EnsureCreated();
        }


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

            modelBuilder.Entity<Channel>().ToTable("channels");
            modelBuilder.Entity<Channel>().HasKey(c => c.ChannelId);
            modelBuilder.Entity<Channel>()
                .HasOne(c => c.Guild)
                .WithMany(g => g.Channels)
                .HasForeignKey(c => c.GuildId);

            modelBuilder.Entity<UserDm>().ToTable("user_dms");
            modelBuilder.Entity<UserDm>().HasKey(ud => new { ud.UserId, ud.FriendId });
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

            modelBuilder.Entity<GuildUser>().ToTable("guild_users");
            modelBuilder.Entity<GuildUser>().HasKey(gu => new { gu.GuildId, gu.UserId });
            modelBuilder.Entity<GuildUser>()
                .HasOne(gu => gu.Guild)
                .WithMany(g => g.GuildUsers)
                .HasForeignKey(gu => gu.GuildId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<GuildUser>()
                .HasOne(gu => gu.User)
                .WithMany(u => u.GuildUsers)
                .HasForeignKey(gu => gu.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AttachmentFile>().ToTable("attachment_files");
            modelBuilder.Entity<AttachmentFile>().Property(a => a.FileId).HasColumnName("file_id").IsRequired();
            modelBuilder.Entity<AttachmentFile>().Property(a => a.FileName).HasColumnName("file_name").IsRequired();
            modelBuilder.Entity<AttachmentFile>().Property(a => a.GuildId).HasColumnName("guild_id").IsRequired(false);
            modelBuilder.Entity<AttachmentFile>().Property(a => a.ChannelId).HasColumnName("channel_id").IsRequired(false);
            modelBuilder.Entity<AttachmentFile>().Property(a => a.Content).HasColumnName("content").IsRequired();
            modelBuilder.Entity<AttachmentFile>().Property(a => a.Extension).HasColumnName("extension").IsRequired();
            modelBuilder.Entity<AttachmentFile>().Property(a => a.UserId).HasColumnName("user_id").IsRequired(false);
            modelBuilder.Entity<AttachmentFile>().HasKey(a => a.FileId);

            modelBuilder.Entity<EmojiFile>().ToTable("emoji_files");
            modelBuilder.Entity<EmojiFile>().Property(e => e.FileId).HasColumnName("file_id").IsRequired();
            modelBuilder.Entity<EmojiFile>().Property(e => e.FileName).HasColumnName("file_name").IsRequired();
            modelBuilder.Entity<EmojiFile>().Property(e => e.GuildId).HasColumnName("guild_id").IsRequired(false);
            modelBuilder.Entity<EmojiFile>().Property(e => e.Content).HasColumnName("content").IsRequired();
            modelBuilder.Entity<EmojiFile>().Property(e => e.Extension).HasColumnName("extension").IsRequired();
            modelBuilder.Entity<EmojiFile>().HasKey(e => e.FileId);

            modelBuilder.Entity<ProfileFile>().ToTable("profile_files");
            modelBuilder.Entity<ProfileFile>().Property(p => p.FileId).HasColumnName("file_id").IsRequired();
            modelBuilder.Entity<ProfileFile>().Property(p => p.FileName).HasColumnName("file_name").IsRequired();
            modelBuilder.Entity<ProfileFile>().Property(p => p.GuildId).HasColumnName("guild_id").IsRequired(false);
            modelBuilder.Entity<ProfileFile>().Property(p => p.Content).HasColumnName("content").IsRequired();
            modelBuilder.Entity<ProfileFile>().Property(p => p.Extension).HasColumnName("extension").IsRequired();
            modelBuilder.Entity<ProfileFile>().Property(p => p.UserId).HasColumnName("user_id").IsRequired(false);
            modelBuilder.Entity<ProfileFile>().HasKey(p => p.FileId);

            modelBuilder.Entity<GuildFile>().ToTable("guilds_files");
            modelBuilder.Entity<GuildFile>().Property(g => g.FileId).HasColumnName("file_id").IsRequired();
            modelBuilder.Entity<GuildFile>().Property(g => g.FileName).HasColumnName("file_name").IsRequired();
            modelBuilder.Entity<GuildFile>().Property(g => g.GuildId).HasColumnName("guild_id").IsRequired(false);
            modelBuilder.Entity<GuildFile>().Property(g => g.ChannelId).HasColumnName("channel_id").IsRequired(false);
            modelBuilder.Entity<GuildFile>().Property(g => g.UserId).HasColumnName("user_id").IsRequired(false);
            modelBuilder.Entity<GuildFile>().Property(g => g.Content).HasColumnName("content").IsRequired();
            modelBuilder.Entity<GuildFile>().Property(g => g.Extension).HasColumnName("extension").IsRequired();
            modelBuilder.Entity<GuildFile>().HasKey(g => g.FileId);

            modelBuilder.Entity<UserChannel>().ToTable("user_channels");
            modelBuilder.Entity<UserChannel>()
                .HasKey(uc => new { uc.UserId, uc.ChannelId });
            modelBuilder.Entity<UserChannel>()
                .HasOne(uc => uc.User)
                .WithMany(u => u.UserChannels)
                .HasForeignKey(uc => uc.UserId);
            modelBuilder.Entity<UserChannel>()
                .HasOne(uc => uc.Channel)
                .WithMany(c => c.UserChannels)
                .HasForeignKey(uc => uc.ChannelId);


            modelBuilder.Entity<GuildPermissions>()
                .ToTable("guild_permissions")
                .HasKey(gp => new { gp.GuildId, gp.UserId }); // Composite key

            modelBuilder.Entity<GuildPermissions>()
                .Property(gp => gp.GuildId) // Ensure GuildId is required
                .IsRequired();

            modelBuilder.Entity<GuildPermissions>()
                .Property(gp => gp.UserId) // Ensure UserId is required
                .IsRequired();

            // Configure the relationship between GuildPermissions and User
            modelBuilder.Entity<GuildPermissions>()
                .HasOne(gp => gp.User) // Specify the navigation property in GuildPermissions
                .WithMany(u => u.GuildPermissions) // Inverse navigation in User
                .HasForeignKey(gp => gp.UserId)
                .OnDelete(DeleteBehavior.Cascade); // Set deletion behavior

            // Configure the relationship between GuildPermissions and Guild
            modelBuilder.Entity<GuildPermissions>()
                .HasOne(gp => gp.Guild) // Specify the navigation property in GuildPermissions
                .WithMany(g => g.GuildPermissions) // Inverse navigation in Guild
                .HasForeignKey(gp => gp.GuildId)
                .OnDelete(DeleteBehavior.Cascade); // Set deletion behavior

        }

    }
}

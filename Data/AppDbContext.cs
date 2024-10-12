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
        public DbSet<Channel> Channels { get; set; }
        public DbSet<GuildUser> GuildUsers { get; set; } 
        public DbSet<AttachmentFile> AttachmentFiles { get; set; }
        public DbSet<EmojiFile> EmojiFiles { get; set; }
        public DbSet<ProfileFile> ProfileFiles { get; set; }
        public DbSet<GuildFile> GuildFiles { get; set; }


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


            modelBuilder.Entity<Channel>()
                .HasKey(c => c.ChannelId);

            modelBuilder.Entity<Channel>()
                .HasOne(c => c.Guild)
                .WithMany(g => g.Channels)
                .HasForeignKey(c => c.GuildId);



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



            
            modelBuilder.Entity<AttachmentFile>().ToTable("attachment_files");
            modelBuilder.Entity<AttachmentFile>().Property(a => a.FileId).HasColumnName("file_id").IsRequired();
            modelBuilder.Entity<AttachmentFile>().Property(a => a.FileName).HasColumnName("file_name").IsRequired();
            modelBuilder.Entity<AttachmentFile>().Property(a => a.GuildId).HasColumnName("guild_id").IsRequired(false);
            modelBuilder.Entity<AttachmentFile>().Property(a => a.ChannelId).HasColumnName("channel_id").IsRequired(false);
            modelBuilder.Entity<AttachmentFile>().Property(a => a.Content).HasColumnName("content").IsRequired();
            modelBuilder.Entity<AttachmentFile>().Property(a => a.Extension).HasColumnName("extension").IsRequired();
            modelBuilder.Entity<AttachmentFile>().Property(a => a.UserId).HasColumnName("user_id").IsRequired(false);

            modelBuilder.Entity<EmojiFile>().ToTable("emoji_files");
            modelBuilder.Entity<EmojiFile>().Property(e => e.FileId).HasColumnName("file_id").IsRequired();
            modelBuilder.Entity<EmojiFile>().Property(e => e.FileName).HasColumnName("file_name").IsRequired();
            modelBuilder.Entity<EmojiFile>().Property(e => e.GuildId).HasColumnName("guild_id").IsRequired(false);
            modelBuilder.Entity<EmojiFile>().Property(e => e.Content).HasColumnName("content").IsRequired();
            modelBuilder.Entity<EmojiFile>().Property(e => e.Extension).HasColumnName("extension").IsRequired();

            modelBuilder.Entity<ProfileFile>().ToTable("profile_files");
            modelBuilder.Entity<ProfileFile>().Property(p => p.FileId).HasColumnName("file_id").IsRequired();
            modelBuilder.Entity<ProfileFile>().Property(p => p.FileName).HasColumnName("file_name").IsRequired();
            modelBuilder.Entity<ProfileFile>().Property(p => p.GuildId).HasColumnName("guild_id").IsRequired(false);
            modelBuilder.Entity<ProfileFile>().Property(p => p.Content).HasColumnName("content").IsRequired();
            modelBuilder.Entity<ProfileFile>().Property(p => p.Extension).HasColumnName("extension").IsRequired();
            modelBuilder.Entity<ProfileFile>().Property(p => p.UserId).HasColumnName("user_id").IsRequired(false);

            modelBuilder.Entity<GuildFile>().ToTable("guilds_files");
            modelBuilder.Entity<GuildFile>().Property(g => g.FileId).HasColumnName("file_id").IsRequired();
            modelBuilder.Entity<GuildFile>().Property(g => g.FileName).HasColumnName("file_name").IsRequired();
            modelBuilder.Entity<GuildFile>().Property(g => g.GuildId).HasColumnName("guild_id").IsRequired(false);
            modelBuilder.Entity<GuildFile>().Property(g => g.ChannelId).HasColumnName("channel_id").IsRequired(false);
            modelBuilder.Entity<GuildFile>().Property(g => g.UserId).HasColumnName("user_id").IsRequired(false);
            modelBuilder.Entity<GuildFile>().Property(g => g.Content).HasColumnName("content").IsRequired();
        modelBuilder.Entity<GuildFile>().Property(g => g.Extension).HasColumnName("extension").IsRequired();


            modelBuilder.Entity<AttachmentFile>()
                .HasKey(a => a.FileId);

            modelBuilder.Entity<EmojiFile>()
                .HasKey(e => e.FileId);

            modelBuilder.Entity<ProfileFile>()
                .HasKey(p => p.FileId);

            modelBuilder.Entity<GuildFile>()
                .HasKey(g => g.FileId);
                
        }
    }
}

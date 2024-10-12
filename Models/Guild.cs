using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace MyPostgresApp.Models
{
    [Table("guilds")]
    public class Guild
    {
        [Key]
        [Column("guild_id")]
        public string GuildId { get; set; }

        [Column("owner_id")]
        public string OwnerId { get; set; }

        [Column("guild_name")]
        public string GuildName { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("root_channel")]
        public string RootChannel { get; set; }

        [Column("region")]
        public string? Region { get; set; }

        [Column("settings")]
        public string? Settings { get; set; }

        [Column("is_guild_uploaded_img")]
        public bool IsGuildUploadedImg { get; set; }

        [NotMapped]
        public string FirstChannelId => Channels.OrderBy(c => c.Order).FirstOrDefault()?.ChannelId ?? RootChannel;

        public virtual ICollection<GuildUser> GuildUsers { get; set; }
        public virtual ICollection<Channel> Channels { get; set; }

        public Guild(string ownerId, string rootChannel)
        {
            OwnerId = ownerId;
            RootChannel = rootChannel;
            GuildUsers = new List<GuildUser>
            {
                new GuildUser { UserId = ownerId, GuildId = GuildId }
            };
            Channels = new List<Channel>
            {
                new Channel
                {
                    ChannelId = rootChannel,
                    ChannelName = "general",
                    ChannelDescription = "",
                    ChannelType = false,
                    Order = 0,
                    GuildId = GuildId
                }
            };
        }
    }

    public class Channel
    {
        [Key]
        [Column("channel_id")]
        public string ChannelId { get; set; }

        [Column("channel_name")]
        public string ChannelName { get; set; }

        [Column("channel_description")]
        public string? ChannelDescription { get; set; }

        [Column("channel_type")]
        public bool ChannelType { get; set; } = false;

        [ForeignKey("Guild")]
        [Column("guild_id")]
        public string GuildId { get; set; }

        [Column("order")]
        public int Order { get; set; }

        public virtual Guild Guild { get; set; } = null!;
    }
}
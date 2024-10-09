//Models/Guild.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyPostgresApp.Models
{
    [Table("guilds")] // Specify the table name as lowercase
    public class Guild
    {
        [Key]
        [Column("guild_id")] // Specify column names as lowercase
        public string GuildId { get; set; } // Primary Key

        [Column("owner_id")] // Specify column names as lowercase
        public string OwnerId { get; set; }

        [Column("guild_name")] // Specify column names as lowercase
        public string GuildName { get; set; }

        [Column("created_at")] // Specify column names as lowercase
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Default to current timestamp

        [Column("root_channel")] // Specify column names as lowercase
        public string RootChannel { get; set; }

        [Column("region")] // Specify column names as lowercase
        public string Region { get; set; }

        [Column("settings")] // Specify column names as lowercase
        public string Settings { get; set; }

        [Column("is_guild_uploaded_img")] // Specify column names as lowercase
        public bool IsGuildUploadedImg { get; set; } // Changed to bool for better clarity

        public virtual ICollection<GuildUser> GuildUsers { get; set; } // Updated to reference GuildUser
    }
}

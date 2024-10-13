using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyPostgresApp.Models
{
    [Table("guild_permissions")]
    public class GuildPermissions
    {
        [Key]
        [Column("permission_id")]
        public int PermissionId { get; set; }

        [ForeignKey("Guild")]
        [Column("guild_id")]
        public string GuildId { get; set; }
        public virtual Guild Guild { get; set; }

        [ForeignKey("User")]
        [Column("user_id")]
        public string UserId { get; set; }
        public virtual User User { get; set; }

        public int ReadMessages { get; set; }
        public int SendMessages { get; set; }
        public int ManageRoles { get; set; }
        public int KickMembers { get; set; }
        public int BanMembers { get; set; }
        public int ManageChannels { get; set; }
        public int MentionEveryone { get; set; }
        public int AddReaction { get; set; }
        public int IsAdmin { get; set; }
        public int CanInvite { get; set; }
    }
}

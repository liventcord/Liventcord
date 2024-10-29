using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LiventCord.Models
{
    [Table("guild_users")]
    public class GuildUser
    {
        [Key]
        [Column("guild_id", Order = 1)]
        public string GuildId { get; set; }

        [Key]
        [Column("user_id", Order = 2)]
        public string UserId { get; set; }

        [ForeignKey("GuildId")]
        public virtual Guild Guild { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }
    }
}

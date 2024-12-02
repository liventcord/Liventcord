using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LiventCord.Models
{
    [Table("guild_users")]
    public class GuildUser
    {
        [Key]
        [Column("guild_id", Order = 1)]
        public required string GuildId { get; set; }

        [Key]
        [Column("user_id", Order = 2)]
        public required string MemberId { get; set; }

        [ForeignKey("guild_id")]
        public virtual required Guild Guild { get; set; }

        [ForeignKey("user_id")]
        public virtual required User User { get; set; }
    }
}

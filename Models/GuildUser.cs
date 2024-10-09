using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyPostgresApp.Models
{
    [Table("guild_users")] // Specify the table name as lowercase
    public class GuildUser
    {
        [Key]
        [Column("guild_id", Order = 1)] // Specify column names as lowercase
        public string GuildId { get; set; }

        [Key]
        [Column("user_id", Order = 2)] // Specify column names as lowercase
        public string UserId { get; set; }

        [ForeignKey("GuildId")]
        public virtual Guild Guild { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }
    }
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LiventCord.Models
{
    [Table("user_dms")]
    public class UserDm
    {
        [Key]
        [Column("user_id", Order = 0)]
        public string UserId { get; set; }
        
        [Key]
        [Column("friend_id", Order = 1)]
        public string FriendId { get; set; }
    }
}


using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
namespace MyPostgresApp.Models{
    public class UserChannel
    {
        [Key]
        [Column(Order = 0)]
        public string UserId { get; set; }

        [Key]
        [Column(Order = 1)]
        public string ChannelId { get; set; }

        [Column("last_read_datetime")]
        public DateTime? LastReadDateTime { get; set; }

        public virtual User User { get; set; }
        public virtual Channel Channel { get; set; }
    }
}
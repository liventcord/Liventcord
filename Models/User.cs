using System.ComponentModel.DataAnnotations;

namespace MyPostgresApp.Models
{
    public class User
    {
        [Key]
        public string user_id { get; set; }
        
        [Required]
        [StringLength(128)]
        public string email { get; set; }

        [Required]
        [StringLength(128)]
        public string password { get; set; }

        [StringLength(128)]
        public string nickname { get; set; }
    }
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace MyPostgresApp.Models
{
    //user_id TEXT PRIMARY KEY,
    //email TEXT UNIQUE NOT NULL,
    //password TEXT NOT NULL,
    //nickname TEXT NOT NULL,
    //discriminator TEXT NOT NULL,
    //bot INTEGER NOT NULL,
    //status TEXT NOT NULL CHECK (status IN ('offline', 'online', 'idle', 'invisible', 'do not disturb')),
    //description TEXT,
    //created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //last_login TIMESTAMP,
    //verified INTEGER DEFAULT 0,
    //location TEXT,
    //language TEXT,
    //phone_number TEXT UNIQUE,
    //social_media_links TEXT,
    //date_of_birth DATE,
    //hide_profile INTEGER DEFAULT 0,
    //preferences JSON,
    //UNIQUE (nickname, discriminator)


    public class User
    {
        [Key][Column("user_id")]
        public required string UserId { get; set; }
        public virtual ICollection<GuildUser> GuildUsers { get; set; } 
        
        [Required][StringLength(128)][Column("email")]
        [NotMapped]
        public required string Email { get; set; }

        [Required][StringLength(4)][Column("discriminator")]
        public required string Discriminator { get; set; }
        
        [Required][StringLength(128)][Column("password")]
        public required string Password { get; set; }
        [Required][StringLength(32)][Column("nickname")]
        public string? Nickname { get; set; }
        [Required][Column("bot")]
        public int Bot { get; set; }
        [Required][StringLength(128)][Column("status")]
        public string? Status { get; set; }
        
        [StringLength(256)][Column("description")]
        public string? Description { get; set; }
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
        [Column("last_login")]
        public DateTime? LastLogin { get; set; }
        [Column("date_of_birth")]
        public DateTime? DateOfBirth { get; set; }
        [Column("verified")]
        public int Verified { get; set; }
        [StringLength(256)][Column("location")]
        public string? Location { get; set; }
        [StringLength(10)][Column("language")]
        public string? Language { get; set; }
        
        [StringLength(15)][Column("phone_number")]
        public string? PhoneNumber { get; set; }
        
        [StringLength(512)][Column("social_media_links")]
        public string? SocialMediaLinks { get; set; }
        [Column("preferences")]
        public JsonElement? Preferences { get; set; }

        public PublicUser GetPublicUser()
        {
            return new PublicUser
            {
                UserId = UserId,
                Nickname = Nickname,
                Status = Status,
                CreatedAt = CreatedAt,
                Location = Location
            };
        }
        public virtual ICollection<UserChannel> UserChannels { get; set; } 
    }

    public class PublicUser
    {
        public required string UserId { get; set; }
        public string Nickname { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? Location { get; set; }
    }
}

// Models/GuildDto.cs
namespace MyPostgresApp.Models
{
    public class GuildDto
    {
        public string GuildId { get; set; }
        public string OwnerId { get; set; }
        public string GuildName { get; set; }
        public string RootChannel { get; set; }
        public string? Region { get; set; }
        public bool IsGuildUploadedImg { get; set; }
        public List<string> GuildUsers { get; set; } 
    }
}

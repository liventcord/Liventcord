using System.ComponentModel.DataAnnotations.Schema;

public class TypingStatus
{
    [Column("user_id")]
    public string UserId { get; set; }

    [Column("guild_id")]
    public string GuildId { get; set; }

    [Column("channel_id")]
    public string ChannelId { get; set; }

    [Column("timestamp")]
    public DateTime Timestamp { get; set; } 
}

public class AttachmentFile
{
    public string FileName { get; set; }
    public string FileId { get; set; }
    public string? GuildId { get; set; } // Nullable
    public string? ChannelId { get; set; } // Nullable
    public byte[] Content { get; set; }
    public string Extension { get; set; }
    public string? UserId { get; set; } // Nullable
}
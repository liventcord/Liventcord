public class EmojiFile
{
    public string FileName { get; set; }
    public string FileId { get; set; }
    public string? GuildId { get; set; } // Nullable
    public byte[] Content { get; set; }
    public string Extension { get; set; }
}
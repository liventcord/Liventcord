public class ProfileFile
{
    public string FileName { get; set; }
    public required string FileId { get; set; }
    public string? GuildId { get; set; }
    public required byte[] Content { get; set; }
    public required string Extension { get; set; }
    public string? UserId { get; set; }
}
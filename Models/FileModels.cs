public abstract class FileBase
{
    public string? FileName { get; set; }
    public required string FileId { get; set; }
    public string? GuildId { get; set; }
    public required byte[] Content { get; set; }
    public required string Extension { get; set; }
}

public class AttachmentFile : FileBase
{
    public string? ChannelId { get; set; }
    public string? UserId { get; set; }
}

public class EmojiFile : FileBase { }

public class GuildFile : FileBase
{
    public string? ChannelId { get; set; }
    public string? UserId { get; set; }
}

public class ProfileFile : FileBase
{
    public string? UserId { get; set; }
}

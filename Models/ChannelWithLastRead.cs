public class ChannelWithLastRead
{
    public string ChannelId { get; set; }
    public string ChannelName { get; set; }
    public bool IsTextChannel { get; set; }
    public DateTime? LastReadDateTime { get; set; }
}

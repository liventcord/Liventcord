namespace LiventCord.Models
{
    public enum FriendStatus
    {
        Pending = 0,
        Accepted = 1
    }

    public class Friend
    {
        public string UserId { get; set; }
        public string FriendId { get; set; }
        public FriendStatus Status { get; set; } 
    }
}

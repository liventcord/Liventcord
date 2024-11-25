using System;

namespace LiventCord.Models
{
    public class Message
    {
        public required string MessageId { get; set; } // message_id
        public required string UserId { get; set; } // user_id
        public required string Content { get; set; } // content
        public required string ChannelId { get; set; } // channel_id
        public required DateTime Date { get; set; } // date
        public DateTime? LastEdited { get; set; } // last_edited
        public string? AttachmentUrls { get; set; } // attachment_urls
        public string? ReplyToId { get; set; } // reply_to_id
        public string? ReactionEmojisIds { get; set; } // reaction_emojis_ids
    }
}

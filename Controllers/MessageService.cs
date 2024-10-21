using Microsoft.EntityFrameworkCore;
using MyPostgresApp.Data;
using MyPostgresApp.Helpers;
using MyPostgresApp.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class MessageService
{
    private readonly AppDbContext _dbContext;

    public MessageService(AppDbContext dbContext) => _dbContext = dbContext;

    public async Task<string> getOldestMessage(string guildId, string channelId)
    {
        var oldestMessageDate = await _dbContext.Messages
            .Where(m => m.ChannelId == channelId)
            .OrderBy(m => m.Date)
            .Select(m => m.Date)
            .FirstOrDefaultAsync(); 

        return oldestMessageDate == default(DateTime) ? null : oldestMessageDate.ToString("o");
    }





    public async Task<List<Message>> GetMessages(string guildId, string channelId)
    {
        var messages = await _dbContext.Messages
            .Where(m => m.ChannelId == channelId)
            .OrderByDescending(m => m.Date)
            .Take(50)
            .ToListAsync();
        
        messages.Reverse();
        return messages;
    }

    public async Task NewMessage(string userId,string guildId, string channelId, string content,string lastEdited, string attachmentUrls,string ReplyToId, string reactionEmojisIds)
    {
        string messageId = Utils.CreateRandomId();
        var message = new Message
        {
            MessageId = messageId,
            UserId = userId,
            Content = content,
            ChannelId = channelId,
            Date = DateTime.UtcNow,
            LastEdited = null,
            AttachmentUrls = attachmentUrls,
            ReplyToId = ReplyToId,
            ReactionEmojisIds = reactionEmojisIds
        };
        await _dbContext.Messages.AddAsync(message);
        await _dbContext.SaveChangesAsync();
    }
    public async Task DeleteMessagesFromUser(string userId)
    {
        var messages = await _dbContext.Messages
            .Where(m => m.UserId == userId)
            .ToListAsync();
        
        if (messages.Any())
        {
            _dbContext.Messages.RemoveRange(messages);
            await _dbContext.SaveChangesAsync();
        }
    }


    public async Task DeleteMessage(string channelId, string messageId)
    {
        var message = await _dbContext.Messages
            .FirstOrDefaultAsync(m => m.MessageId == messageId && m.ChannelId == channelId);
        if (message != null)
        {
            _dbContext.Messages.Remove(message);
            await _dbContext.SaveChangesAsync();
        }
    }

    public async Task EditMessage(string channelId, string messageId, string newContent)
    {
        var message = await _dbContext.Messages
            .FirstOrDefaultAsync(m => m.MessageId == messageId && m.ChannelId == channelId);
        if (message != null)
        {
            message.Content = newContent;
            message.LastEdited = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();
        }
    }


}

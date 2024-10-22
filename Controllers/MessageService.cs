using Microsoft.EntityFrameworkCore;
using MyPostgresApp.Data;
using MyPostgresApp.Helpers;
using MyPostgresApp.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class MessageService
{
    private readonly IDbContextFactory<AppDbContext> _contextFactory;

    public MessageService(IDbContextFactory<AppDbContext> contextFactory)
    {
        _contextFactory = contextFactory;
    }

    public async Task<string> GetOldestMessage(string guildId, string channelId)
    {
        using var context = _contextFactory.CreateDbContext();

        var oldestMessageDate = await context.Messages
            .Where(m => m.ChannelId == channelId)
            .OrderBy(m => m.Date)
            .Select(m => m.Date)
            .FirstOrDefaultAsync();

        return oldestMessageDate == default(DateTime) ? null : oldestMessageDate.ToString("o");
    }

    public async Task<List<Message>> GetMessages(string guildId, string channelId)
    {
        using var context = _contextFactory.CreateDbContext();

        var messages = await context.Messages
            .Where(m => m.ChannelId == channelId)
            .OrderByDescending(m => m.Date)
            .Take(50)
            .ToListAsync();

        messages.Reverse();
        return messages;
    }

    public async Task NewMessage(string userId, string guildId, string channelId, string content, string lastEdited, string attachmentUrls, string replyToId, string reactionEmojisIds)
    {
        using var context = _contextFactory.CreateDbContext();

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
            ReplyToId = replyToId,
            ReactionEmojisIds = reactionEmojisIds
        };

        await context.Messages.AddAsync(message);
        await context.SaveChangesAsync();
    }

    public async Task DeleteMessagesFromUser(string userId)
    {
        using var context = _contextFactory.CreateDbContext();

        var messages = await context.Messages
            .Where(m => m.UserId == userId)
            .ToListAsync();

        if (messages.Any())
        {
            context.Messages.RemoveRange(messages);
            await context.SaveChangesAsync();
        }
    }

    public async Task DeleteMessage(string channelId, string messageId)
    {
        using var context = _contextFactory.CreateDbContext();

        var message = await context.Messages
            .FirstOrDefaultAsync(m => m.MessageId == messageId && m.ChannelId == channelId);

        if (message != null)
        {
            context.Messages.Remove(message);
            await context.SaveChangesAsync();
        }
    }

    public async Task EditMessage(string channelId, string messageId, string newContent)
    {
        using var context = _contextFactory.CreateDbContext();

        var message = await context.Messages
            .FirstOrDefaultAsync(m => m.MessageId == messageId && m.ChannelId == channelId);

        if (message != null)
        {
            message.Content = newContent;
            message.LastEdited = DateTime.UtcNow;
            await context.SaveChangesAsync();
        }
    }
}

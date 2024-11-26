using Microsoft.EntityFrameworkCore;
using LiventCord.Data;
using LiventCord.Helpers;
using LiventCord.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;


namespace LiventCord.Controllers {

[Route("api/guilds/{guildId}/channels/{channelId}/messages")]
[ApiController]
[Authorize]
public class MessageController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly PermissionsController _permissionsController;

    public MessageController(AppDbContext context, PermissionsController permissionsController)
    {
        _permissionsController = permissionsController;
        _context = context;
    }


        
    // POST /api/guilds/{guildId}/channels/{channelId}/messages
    [HttpPost("")]
    public async Task<IActionResult> HandleNewMessage([FromBody] NewMessageRequest request, [FromHeader] string userId)
    {
        if (string.IsNullOrEmpty(request.GuildId) || string.IsNullOrEmpty(request.ChannelId) || string.IsNullOrEmpty(request.Content))
        {
            return BadRequest(new { Type = "error", Message = "Required properties (guildId, channelId, content) are missing." });
        }

        string? attachmentUrls = request.AttachmentUrls;
        string? replyToId = request.ReplyToId;
        string? reactionEmojisIds = request.ReactionEmojisIds;
        string? lastEdited = request.LastEdited;

        if (!await _permissionsController.CanManageChannels(userId, request.GuildId))
        {
            return Forbid();
        }

        await NewMessage(userId, request.GuildId, request.ChannelId, request.Content, attachmentUrls, replyToId, reactionEmojisIds);
        
        return Ok(new { Type = "success", Message = "Message sent." });
    }

    // GET /api/guilds/{guildId}/channels/{channelId}/messages
    [HttpGet("")]
    public async Task<IActionResult> HandleGetMessages(
        [FromQuery] GetMessagesRequest request,
        [FromHeader] string userId)
    {
        if (string.IsNullOrEmpty(request.GuildId) || string.IsNullOrEmpty(request.ChannelId))
        {
            return BadRequest(new { Type = "error", Message = "guildId and channelId must be provided." });
        }

        var messages = await GetMessages(request.GuildId, request.ChannelId);
        var oldestMessageDate = await _context.Messages
            .Where(m => m.ChannelId == request.ChannelId)
            .OrderBy(m => m.Date)
            .Select(m => m.Date)
            .FirstOrDefaultAsync();

        var messageToEmit = new
        {
            Type = "history_response",
            Data = new { messages, oldestMessageDate }
        };

        return Ok(messageToEmit);
    }


    [NonAction]
    private async Task<List<Message>> GetMessages(string guildId, string channelId)
    {
        return await _context.Messages
            .Where(m => m.ChannelId == channelId)
            .OrderByDescending(m => m.Date)
            .Take(50)
            .ToListAsync();
    }
    [NonAction]
    private async Task NewMessage(string userId, string guildId, string channelId, string content, string? attachmentUrls, string? replyToId, string? reactionEmojisIds)
    {
        var message = new Message
        {
            MessageId = Utils.CreateRandomId(),
            UserId = userId,
            Content = content,
            ChannelId = channelId,
            Date = DateTime.UtcNow,
            LastEdited = null,
            AttachmentUrls = attachmentUrls,
            ReplyToId = replyToId,
            ReactionEmojisIds = reactionEmojisIds
        };

        await _context.Messages.AddAsync(message);
        await _context.SaveChangesAsync();
    }


    
    private async Task DeleteMessagesFromUser(string userId)
    {
        var messages = await _context.Messages
            .Where(m => m.UserId == userId)
            .ToListAsync();

        if (messages.Any())
        {
            _context.Messages.RemoveRange(messages);
            await _context.SaveChangesAsync();
        }
    }

    private async Task DeleteMessage(string channelId, string messageId)
    {
        var message = await _context.Messages
            .FirstOrDefaultAsync(m => m.MessageId == messageId && m.ChannelId == channelId);

        if (message != null)
        {
            _context.Messages.Remove(message);
            await _context.SaveChangesAsync();
        }
    }

    private async Task EditMessage(string channelId, string messageId, string newContent)
    {
        var message = await _context.Messages
            .FirstOrDefaultAsync(m => m.MessageId == messageId && m.ChannelId == channelId);

        if (message != null)
        {
            message.Content = newContent;
            message.LastEdited = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}
}
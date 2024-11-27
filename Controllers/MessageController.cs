using Microsoft.EntityFrameworkCore;
using LiventCord.Data;
using LiventCord.Helpers;
using LiventCord.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore.Metadata.Internal;


namespace LiventCord.Controllers {

    [ApiController]
    [Authorize]
    [Route("/api")]
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
        [HttpPost("/guilds/{guildId}/channels/{channelId}/messages")]
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

            if (!await _permissionsController.CanSendMessages(userId, request.GuildId))
            {
                return Forbid();
            }

            await NewMessage(userId, request.GuildId, request.ChannelId, request.Content, attachmentUrls, replyToId, reactionEmojisIds);
            
            return Ok(new { Type = "success", Message = "Message sent." });
        }

        // GET /api/guilds/{guildId}/channels/{channelId}/messages
        [HttpGet("/guilds/{guildId}/channels/{channelId}/messages")]
        public async Task<IActionResult> HandleGetMessages(
            [FromQuery] GetMessagesRequest request,
            [FromHeader] string userId)
        {

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

        // PUT /api/guilds/{guildId}/channels/{channelId}/messages
        [HttpPost("/guilds/{guildId}/channels/{channelId}/messages/edit")]
        public async Task<IActionResult> HandleEditMessage([FromBody] EditMessageRequest request, [FromHeader] string userId)
        {
            if (string.IsNullOrEmpty(request.GuildId) || string.IsNullOrEmpty(request.ChannelId) || string.IsNullOrEmpty(request.Content))
            {
                return BadRequest(new { Type = "error", Message = "Required properties (guildId, channelId, content) are missing." });
            }

            string? attachmentUrls = request.AttachmentUrls;
            if (!await _permissionsController.CanManageChannels(userId, request.GuildId))
            {
                return Forbid();
            }

            await EditMessage(request.ChannelId,request.MessageId,request.Content);
            
            return Ok(new { Type = "success", Message = "Message sent." });
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Message>>> SearchMessages(string guildId, string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Query cannot be empty.");

            try
            {
                var results = await _context.Messages
                    .FromSqlInterpolated(
                        $"SELECT * FROM messages WHERE guild_id = {guildId} AND search_vector @@ to_tsquery('english', {query})")
                    .ToListAsync();

                if (results.Count == 0)
                    return NotFound("No messages found matching your query.");

                return Ok(results);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while searching: {ex.Message}");
            }
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

public class GetMessagesRequest
{
    [Required(ErrorMessage = "GuildId is required.")]
    public required string GuildId { get; set; }
    [Required(ErrorMessage = "ChannelId is required.")]
    public required string ChannelId { get; set; }
}
public class NewMessageRequest
{
    [Required(ErrorMessage = "GuildId is required.")]
    public required string GuildId { get; set; }

    [Required(ErrorMessage = "ChannelId is required.")]
    public required string ChannelId { get; set; }

    [Required(ErrorMessage = "Content is required.")]
    [StringLength(2000, ErrorMessage = "Content must not exceed 2000 characters.")]
    public required string Content { get; set; }

    public string? AttachmentUrls { get; set; }
    public string? ReplyToId { get; set; }
    public string? ReactionEmojisIds { get; set; }
    public string? LastEdited { get; set; }
}
public class EditMessageRequest
{
    [Required(ErrorMessage = "GuildId is required.")]
    public required string GuildId { get; set; }
    [Required(ErrorMessage = "MessageId is required.")]
    public required string MessageId { get; set; }

    [Required(ErrorMessage = "ChannelId is required.")]
    public required string ChannelId { get; set; }

    [Required(ErrorMessage = "Content is required.")]
    [StringLength(2000, ErrorMessage = "Content must not exceed 2000 characters.")]
    public required string Content { get; set; }

    public string? AttachmentUrls { get; set; }
}

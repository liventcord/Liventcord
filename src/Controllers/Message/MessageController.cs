using System.ComponentModel.DataAnnotations;
using LiventCord.Helpers;
using LiventCord.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LiventCord.Controllers
{
    [ApiController]
    [Authorize]
    [Route("")]
    public class MessageController : BaseController
    {
        private readonly AppDbContext _context;
        private readonly PermissionsController _permissionsController;
        private readonly MetadataService _metadataService;

        public MessageController(
            AppDbContext context,
            PermissionsController permissionsController,
            MetadataService metadataService
        )
        {
            _permissionsController = permissionsController;
            _context = context;
            _metadataService = metadataService;
        }

        [HttpGet("/api/guilds/{guildId}/channels/{channelId}/messages")]
        public async Task<IActionResult> HandleGetGuildMessages(
            [FromRoute] string guildId,
            [FromRoute] string channelId
        )
        {
            var messages = await GetMessages(channelId, guildId);
            return Ok(new { messages });
        }

        [HttpGet("/api/dms/channels/{channelId}/messages")]
        public async Task<IActionResult> HandleGetDMMessages([FromRoute] string channelId)
        {
            var messages = await GetMessages(channelId, null);
            return Ok(new { messages });
        }

        [HttpPost("/api/guilds/{guildId}/channels/{channelId}/messages")]
        public async Task<IActionResult> HandleNewGuildMessage(
            [FromRoute] string guildId,
            [FromRoute] string channelId,
            [FromBody] NewMessageRequest request
        )
        {
            return await HandleMessage("guilds", guildId, channelId, request);
        }

        [HttpPost("/api/dms/channels/{channelId}/messages")]
        public async Task<IActionResult> HandleNewDmMessage(
            [FromRoute] string channelId,
            [FromBody] NewMessageRequest request
        )
        {
            return await HandleMessage("dms", null, channelId, request);
        }

        private async Task<IActionResult> HandleMessage(
            string mode,
            string? guildId,
            string channelId,
            NewMessageRequest request
        )
        {
            if (string.IsNullOrEmpty(channelId) || string.IsNullOrEmpty(request.Content))
            {
                return BadRequest(
                    new
                    {
                        Type = "error",
                        Message = "Required properties (channelId, content) are missing.",
                    }
                );
            }

            if (mode == "guilds")
            {
                if (string.IsNullOrWhiteSpace(guildId))
                {
                    return BadRequest(new { Type = "error", Message = "Missing guildId" });
                }
                if (!await _permissionsController.CanSendMessages(UserId!, guildId))
                {
                    return Forbid();
                }
            }

            await NewMessage(
                UserId!,
                channelId,
                request.Content,
                request.AttachmentUrls,
                request.ReplyToId,
                request.ReactionEmojisIds
            );

            return Ok(new { Type = "success", Message = $"Message sent to {mode}." });
        }

        [HttpPut("/api/guilds/{guildId}/channels/{channelId}/messages/{messageId}")]
        public async Task<IActionResult> HandleEditGuildMessage(
            [FromRoute] string guildId,
            [FromRoute] string channelId,
            [FromRoute] string messageId,
            [FromBody] EditMessageRequest request
        )
        {
            if (string.IsNullOrEmpty(request.Content))
            {
                return BadRequest(new { Type = "error", Message = "Content is required." });
            }

            if (!await _permissionsController.CanManageChannels(UserId!, guildId))
            {
                return Forbid();
            }

            await EditMessage(channelId, messageId, request.Content);
            return Ok(new { Type = "success", Message = "Message edited in guild." });
        }

        [HttpPut("/api/dms/channels/{channelId}/messages/{messageId}")]
        public async Task<IActionResult> HandleEditDMMessage(
            [FromRoute] string channelId,
            [FromRoute] string messageId,
            [FromBody] EditMessageRequest request
        )
        {
            if (string.IsNullOrEmpty(request.Content))
            {
                return BadRequest(new { Type = "error", Message = "Content is required." });
            }

            await EditMessage(channelId, messageId, request.Content);
            return Ok(new { Type = "success", Message = "Message edited in DM." });
        }

        [HttpDelete("/api/guilds/{guildId}/channels/{channelId}/messages/{messageId}")]
        public async Task<IActionResult> HandleDeleteGuildMessage(
            [FromRoute] string guildId,
            [FromRoute] string channelId,
            [FromRoute] string messageId
        )
        {
            if (!await _permissionsController.CanManageChannels(UserId!, guildId))
            {
                return Forbid();
            }

            await DeleteMessage(channelId, messageId);
            return Ok(new { Type = "success", Message = "Message deleted in guild." });
        }

        [HttpDelete("/api/dms/channels/{channelId}/messages/{messageId}")]
        public async Task<IActionResult> HandleDeleteDMMessage(
            [FromRoute] string channelId,
            [FromRoute] string messageId
        )
        {
            await DeleteMessage(channelId, messageId);
            return Ok(new { Type = "success", Message = "Message deleted in DM." });
        }

        [HttpGet("/api/{type}/{id}/search")]
        public async Task<ActionResult<IEnumerable<Message>>> SearchMessages(
            [FromRoute] string type,
            [FromRoute] string id,
            [FromBody] string query
        )
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Query cannot be empty.");

            type = type.ToLower();

            try
            {
                List<Message> results;

                if (type == "guilds")
                {
                    results = await _context
                        .Messages.Where(m => m.Channel.GuildId == id)
                        .Where(m => EF.Functions.ToTsVector("english", m.Content).Matches(query))
                        .ToListAsync();
                }
                else if (type == "dms")
                {
                    results = await _context
                        .Messages.Where(m => m.ChannelId == id)
                        .Where(m => EF.Functions.ToTsVector("english", m.Content).Matches(query))
                        .ToListAsync();
                }
                else
                {
                    return BadRequest("Invalid type. It must be 'guilds' or 'dms'.");
                }

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
        private async Task<List<Message>> GetMessages(string channelId, string? guildId = null)
        {
            IQueryable<Message> query = _context.Messages.Where(m => m.ChannelId == channelId);

            if (!string.IsNullOrEmpty(guildId))
            {
                query = query.Where(m => m.Channel.GuildId == guildId);
            }

            return await query.OrderBy(m => m.Date).Take(50).ToListAsync();
        }

        [NonAction]
        private async Task NewMessage(
            string userId,
            string channelId,
            string content,
            string? attachmentUrls,
            string? replyToId,
            string? reactionEmojisIds
        )
        {
            Metadata metadata = new();

            if (Uri.IsWellFormedUriString(content, UriKind.Absolute))
            {
                var fetchedMetadata = await _metadataService.ExtractMetadataAsync(content);
                metadata = new Metadata
                {
                    Title = fetchedMetadata.Title,
                    Description = fetchedMetadata.Description,
                    SiteName = fetchedMetadata.SiteName,
                };
            }

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
                ReactionEmojisIds = reactionEmojisIds,
                Metadata = metadata,
            };

            await _context.Messages.AddAsync(message);
            await _context.SaveChangesAsync();
        }

        [NonAction]
        private async Task EditMessage(string channelId, string messageId, string newContent)
        {
            var message = await _context.Messages.FirstOrDefaultAsync(m =>
                m.MessageId == messageId && m.ChannelId == channelId
            );

            if (message != null)
            {
                message.Content = newContent;
                message.LastEdited = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        private async Task DeleteMessagesFromUser(string userId)
        {
            var messages = await _context.Messages.Where(m => m.UserId == userId).ToListAsync();

            if (messages.Any())
            {
                _context.Messages.RemoveRange(messages);
                await _context.SaveChangesAsync();
            }
        }

        private async Task DeleteMessage(string channelId, string messageId)
        {
            var message = await _context.Messages.FirstOrDefaultAsync(m =>
                m.MessageId == messageId && m.ChannelId == channelId
            );

            if (message != null)
            {
                _context.Messages.Remove(message);
                await _context.SaveChangesAsync();
            }
        }
    }
}

public class NewMessageRequest
{
    [StringLength(2000, ErrorMessage = "Content must not exceed 2000 characters.")]
    public required string? Content { get; set; }
    public string? AttachmentUrls { get; set; }
    public string? ReplyToId { get; set; }
    public string? ReactionEmojisIds { get; set; }
    public string? LastEdited { get; set; }
}

public class EditMessageRequest
{
    [IdLengthValidation]
    [Required(ErrorMessage = "GuildId is required.")]
    public required string GuildId { get; set; }

    [IdLengthValidation]
    [Required(ErrorMessage = "MessageId is required.")]
    public required string MessageId { get; set; }

    [IdLengthValidation]
    [Required(ErrorMessage = "ChannelId is required.")]
    public required string ChannelId { get; set; }

    [Required(ErrorMessage = "Content is required.")]
    [StringLength(2000, ErrorMessage = "Content must not exceed 2000 characters.")]
    public required string Content { get; set; }

    public string? AttachmentUrls { get; set; }
}

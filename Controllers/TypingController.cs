using Microsoft.EntityFrameworkCore;
using LiventCord.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;


namespace LiventCord.Controllers
{
    [Route("api/guilds")]
    [ApiController]
    [Authorize]

    public class TypingController : BaseController
    {
        private readonly AppDbContext _dbContext;
        private readonly SSEManager _sseManager;
        private readonly MembersController _membersController;
        private Dictionary<string, List<string>> writingMembersState = new();
        public TypingController(AppDbContext dbContext,SSEManager sseManager,MembersController membersController)
        {
            _dbContext = dbContext;
            _sseManager = sseManager;
            _membersController = membersController;
        }
        [NonAction]
        public async Task<List<string>?> GetTypingUsers(string guildId, string channelId)
        {
            var typingUsers = await _dbContext.TypingStatuses
                .Where(t => t.GuildId == guildId && t.ChannelId == channelId)
                .Select(t => t.UserId)
                .ToListAsync();

            return typingUsers;
        }
    

        // POST /api/guilds/{guildId}/channels/{channelId}/writing
        [HttpPost("/api/guilds/{guildId}/channels/{channelId}/writing")]
        public async Task<IActionResult> HandleStartWriting(
            [FromRoute][IdLengthValidation] string guildId,
            [FromRoute][IdLengthValidation] string channelId)
        {

            if (!writingMembersState.ContainsKey(guildId))
            {
                writingMembersState[guildId] = new List<string>();
            }

            if (!writingMembersState[guildId].Contains(UserId!))
            {
                writingMembersState[guildId].Add(UserId!);
            }

            var messageToEmit = new
            {
                Type = "start_writing",
                Data = new
                {
                    UserId,
                    guildId,
                    channelId
                }
            };

            await _sseManager.EmitToGuild(_membersController.GetGuildUsersIds(guildId),messageToEmit);
            return Ok(new { Type = "success", Message = "Writing started." });
        }
    }
}
public class StartWritingRequest
{
    public required string GuildId { get; set; }
    public required string ChannelId { get; set; }
}
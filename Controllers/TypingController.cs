using Microsoft.EntityFrameworkCore;
using LiventCord.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;


namespace LiventCord.Controllers
{
    [Route("api/guilds")]
    [ApiController]
    [Authorize]

    public class TypingController : ControllerBase
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
            [FromRoute] string guildId,
            [FromRoute] string channelId,
            [FromHeader] string userId)
        {

            if (!writingMembersState.ContainsKey(guildId))
            {
                writingMembersState[guildId] = new List<string>();
            }

            if (!writingMembersState[guildId].Contains(userId))
            {
                writingMembersState[guildId].Add(userId);
            }

            var messageToEmit = new
            {
                Type = "start_writing",
                Data = new
                {
                    userId,
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
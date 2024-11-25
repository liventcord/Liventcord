using Microsoft.EntityFrameworkCore;
using LiventCord.Data;
using LiventCord.Helpers;
using LiventCord.Models;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;


namespace LiventCord.Controllers
{
    [Route("api/guilds")]
    [ApiController]
    [Authorize]
    public class GuildController : ControllerBase
    {
        private string DEFAULT_CHANNEL_NAME = "general";
        private readonly AppDbContext _dbContext;
        private readonly UploadController _uploadController;
        private readonly MessageController _messageController;
        private readonly SSEManager _sseManager;
        private readonly GuildInviteService _guildInviteService;
        private readonly ILogger<AppLogic> _logger;
        private readonly PermissionsController _permissionsController;


        public GuildController(AppDbContext dbContext, UploadController uploadController,MessageController messageController,SSEManager sseManager,GuildInviteService guildInviteService, ILogger<AppLogic> logger, PermissionsController permissionsController)
        {
            _dbContext = dbContext;
            _sseManager = sseManager;
            this._messageController = messageController;
            _uploadController = uploadController;
            _guildInviteService = guildInviteService;
            _logger = logger;
            _permissionsController = permissionsController;


        }


  
  
        // GET /api/guilds/{guildId}/channels
        [HttpGet("guilds/{guildId}/channels")]
        public async Task<IActionResult> HandleGetChannels([FromRoute] string guildId, [FromHeader] string userId)
        {
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { Type = "error", Message = "User not authenticated." });

            var channels = await GetGuildChannels(userId, guildId);

            if (channels == null)
                return BadRequest(new { Type = "error", Message = "Unable to retrieve channels." });

            var updateChannelsMessage = new
            {
                Type = "update_channels",
                Data = new { guildId, channels }
            };

            return Ok(updateChannelsMessage);
        }


        // GET /api/guilds
        [HttpGet("guilds")]
        public async Task<IActionResult> HandleGetGuilds([FromHeader] string userId)
        {
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { Type = "error", Message = "User not authenticated." });

            var guilds = await GetUserGuilds(userId) ?? new List<GuildDto>();

            var messageToEmit = new
            {
                Type = "update_guilds",
                Data = new { guilds }
            };

            return Ok(messageToEmit);
        }



        // POST api/guilds
        [HttpPost("")]
        public async Task<IActionResult> CreateGuild([FromForm] CreateGuildRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User not authenticated.");

            string rootChannel = Utils.CreateRandomId();
            string? region = Request.Headers["Region"].ToString();
            if (string.IsNullOrEmpty(region))
                region = null;

            var newGuild = await CreateGuild(userId, request.GuildName, rootChannel, region);

            if (request.Photo != null)
            {
                var uploadResult = await _uploadController.UploadImage(request.Photo, newGuild.GuildId);
                if (uploadResult is OkObjectResult uploadResultOk)
                {
                    var fileId = ((dynamic)uploadResultOk.Value).fileId;
                }
                else
                {
                    return uploadResult; 
                }
            }

            var guildDto = new GuildDto
            {
                GuildId = newGuild.GuildId,
                OwnerId = newGuild.OwnerId,
                GuildName = newGuild.GuildName,
                RootChannel = newGuild.RootChannel,
                Region = newGuild.Region,
                IsGuildUploadedImg = newGuild.IsGuildUploadedImg,
                GuildUsers = newGuild.GuildMembers.Select(gu => gu.UserId).ToList()
            };

            return CreatedAtAction(nameof(CreateGuild), new { id = guildDto.GuildId }, guildDto);
        }

        private Dictionary<string, List<string>> writingUsersState = new();
    

        // POST /api/guilds/{guildId}/channels/{channelId}/writing
        [HttpPost("/api/guilds/{guildId}/channels/{channelId}/writing")]
        public async Task<IActionResult> HandleStartWriting(
            [FromRoute] string guildId,
            [FromRoute] string channelId,
            [FromHeader] string userId)
        {

            if (!writingUsersState.ContainsKey(guildId))
            {
                writingUsersState[guildId] = new List<string>();
            }

            if (!writingUsersState[guildId].Contains(userId))
            {
                writingUsersState[guildId].Add(userId);
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

            await _sseManager.EmitToGuild(GetGuildUsersIds(guildId),messageToEmit);
            return Ok(new { Type = "success", Message = "Writing started." });
        }

        // POST /api/guilds/{guild_id}/members
        [HttpPost("/api/guilds/{guild_id}/members")]
        public async Task<IActionResult> HandleGuildJoin([FromBody] string joinId, [FromHeader] string userId)
        {
            if (string.IsNullOrEmpty(joinId))
            {
                return BadRequest(new { message = "Join ID is required." });
            }

            var guildId = await _guildInviteService.GetGuildIdByInviteAsync(joinId);

            if (string.IsNullOrEmpty(guildId))
            {
                return NotFound(new { message = "Invalid or expired invite." });
            }

            try
            {
                await AddUserToGuild(userId, guildId);
                return Ok(new { message = "Successfully joined the guild." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

                
    

        private async Task AddUserToGuild(string userId, string guildId)
        {
            var guild = await _dbContext.Guilds
                .Include(g => g.GuildMembers)
                .FirstOrDefaultAsync(g => g.GuildId == guildId);

            if (guild == null) 
                throw new Exception("Guild not found");

            if (!guild.GuildMembers.Any(gu => gu.UserId == userId))
            {
                guild.GuildMembers.Add(new GuildUser { UserId = userId });
            }

            var permissions = PermissionFlags.ReadMessages 
                            | PermissionFlags.SendMessages 
                            | PermissionFlags.MentionEveryone;

            await _permissionsController.AssignPermissions(guildId, userId, permissions);


            await _dbContext.SaveChangesAsync();
        }
        private async Task<Guild> CreateGuild(string ownerId, string guildName, string rootChannel, string? region)
        {
            var guildId = Utils.CreateRandomId();

            var guild = new Guild(ownerId, rootChannel)
            {
                GuildId = guildId,
                GuildName = guildName,
                Region = region,
                IsGuildUploadedImg = false
            };

            guild.Channels.Add(new Channel
            {
                ChannelId = rootChannel,
                GuildId = guildId,
                ChannelName = DEFAULT_CHANNEL_NAME,
                ChannelDescription = "",
                IsTextChannel = true,
                Order = 0
            });

            guild.GuildMembers.Add(new GuildUser { UserId = ownerId });

            _dbContext.Guilds.Add(guild);
            await _dbContext.SaveChangesAsync();  

            var permissions = PermissionFlags.ReadMessages 
                            | PermissionFlags.SendMessages 
                            | PermissionFlags.MentionEveryone;
            await _permissionsController.AssignPermissions(guildId, ownerId, permissions); 

            await _dbContext.SaveChangesAsync();

            return guild; 
        }


        // DELETE /api/guilds/{guildId}
        [HttpDelete("delete_guild")]
        public async Task<IActionResult> DeleteGuildEndpoint([FromBody] DeleteGuildRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!await _permissionsController.IsUserAdmin(request.GuildId, userId))
                return Unauthorized(new { Type = "error", Message = "User is not authorized to delete this guild." });

            var guild = await _dbContext.Guilds.FindAsync(request.GuildId);
            if (guild == null)
                return NotFound(new { Type = "error", Message = "Guild not found." });

            _dbContext.Guilds.Remove(guild);
            await _dbContext.SaveChangesAsync();

            return Ok(new { Type = "success", Message = "Guild deleted successfully." });
        }

        // POST /api/guilds/{guildId}/channels
        [HttpPost("{guildId}/channels")]
        public async Task<IActionResult> CreateChannel([FromRoute] string guildId, [FromBody] CreateChannelRequest request, [FromHeader] string userId)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (!await _permissionsController.CanManageChannels(userId, guildId))
                return Unauthorized(new { Type = "error", Message = "User does not have permission to manage channels." });

            var guild = await _dbContext.Guilds
                .Include(g => g.Channels)
                .FirstOrDefaultAsync(g => g.GuildId == guildId);

            if (guild == null)
                return NotFound(new { Type = "error", Message = "Guild does not exist." });

            var newChannel = new Channel
            {
                ChannelId = Utils.CreateRandomId(),
                ChannelName = request.ChannelName,
                IsTextChannel = request.IsTextChannel,
                GuildId = guildId,
                Order = guild.Channels.Count
            };

            guild.Channels.Add(newChannel);
            await _dbContext.SaveChangesAsync();

            return Ok(new { Type = "success", Message = "Channel created.", ChannelId = newChannel.ChannelId });
        }



        

        // GET /api/guilds/{guildId}/members
        [HttpGet("{guildId}/members")]
        public async Task<IActionResult> HandleGetUsers([FromRoute] string guildId, [FromHeader] string userId)
        {
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { Type = "error", Message = "User not authenticated." });

            if (!await DoesUserExistInGuild(userId, guildId))
                return BadRequest(new { Type = "error", Message = "User not in guild." });

            var users = await GetGuildUsers(guildId).ConfigureAwait(false);
            if (users == null)
                return BadRequest(new { Type = "error", Message = "Unable to retrieve users." });

            var updateUsersMessage = new
            {
                Type = "update_users",
                Data = new { guildId, users }
            };

            return Ok(updateUsersMessage);
        }




        [NonAction]
        public async Task<List<string>> GetSharedGuilds(string guildId, string userId)
        {
            if (string.IsNullOrEmpty(guildId) || string.IsNullOrEmpty(userId))
                return new List<string>();

            var sharedGuilds = await _dbContext.GuildUsers
                .Where(gu => gu.UserId == userId)
                .Select(gu => gu.GuildId)
                .ToListAsync();

            return sharedGuilds.Where(g => g != guildId).ToList();
        }
        [NonAction]
        public async Task<List<ChannelWithLastRead>> GetGuildChannels(string userId, string guildId)
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(guildId))
                return new List<ChannelWithLastRead>();

            return await _dbContext.Channels
                .Where(c => c.GuildId == guildId)
                .Select(c => new ChannelWithLastRead
                {
                    ChannelId = c.ChannelId,
                    ChannelName = c.ChannelName,
                    IsTextChannel = c.IsTextChannel,
                    LastReadDateTime = _dbContext.UserChannels
                        .Where(uc => uc.UserId == userId && uc.ChannelId == c.ChannelId)
                        .Select(uc => uc.LastReadDatetime)
                        .FirstOrDefault()
                })
                .ToListAsync();
        }
        [NonAction]
        public async Task<List<string>> GetGuildUsersIds(string guildId)
        {
            if (string.IsNullOrEmpty(guildId))
                return new List<string>();

            return await _dbContext.GuildUsers
                .Where(gu => gu.GuildId == guildId)
                .Select(gu => gu.User.UserId)
                .ToListAsync();
        }

        [NonAction]
        public async Task<List<PublicUser>> GetGuildUsers(string guildId)
        {
            if (string.IsNullOrEmpty(guildId))
                return new List<PublicUser>();

            return await _dbContext.GuildUsers
                .Where(gu => gu.GuildId == guildId)
                .Select(gu => new PublicUser
                {
                    UserId = gu.User.UserId,
                    Nickname = gu.User.Nickname,
                    Discriminator = gu.User.Discriminator,
                    Description = gu.User.Description,
                    Status = gu.User.Status,
                    IsOnline = IsOnline(gu.User.UserId),
                    CreatedAt = gu.User.CreatedAt,
                    SocialMediaLinks = gu.User.SocialMediaLinks
                })
                .ToListAsync();
        }
        private static List<string> OnlineUsers = new();
        private static bool IsOnline(string userId){return OnlineUsers.Contains(userId);}

        [NonAction]
        public async Task SetUserOnlineStatus(string userId, bool isOnline)
        {
            var user = await _dbContext.Users.FindAsync(userId);
            if (user != null)
            {
                if(isOnline && !OnlineUsers.Contains(userId)) OnlineUsers.Add(userId);
                else if(!isOnline) OnlineUsers.Remove(userId);
                await _dbContext.SaveChangesAsync();
            }
        }
        [NonAction]
        public void DeleteChannel(string guildId, string channelId)
        {
            try
            {
                if (string.IsNullOrEmpty(guildId) || string.IsNullOrEmpty(channelId))
                {
                    throw new ArgumentException("Guild ID and Channel ID cannot be null or empty.");
                }

                var channel = _dbContext.Channels.Find(channelId);
                if (channel == null)
                {
                    throw new InvalidOperationException("Channel does not exist.");
                }

                _dbContext.Channels.Remove(channel);
                _dbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting channel: {ex.Message}");
            }
        }




        [NonAction]
        public async Task<bool> DoesUserExistInGuild(string userId, string guildId)
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(guildId))
                return false;

            return await _dbContext.GuildUsers
                .AnyAsync(gu => gu.UserId == userId && gu.GuildId == guildId);
        }


        [NonAction]
        public async Task<string?> GetGuildAuthor(string guildId)
        {
            return await _dbContext.Guilds
                .Where(g => g.GuildId == guildId)
                .Select(g => g.OwnerId)
                .FirstOrDefaultAsync();
        }


        [NonAction]
        public async Task<List<GuildDto>> GetUserGuilds(string userId)
        {
            var guilds = await _dbContext.GuildUsers
                .Where(gu => gu.UserId == userId)
                .Include(gu => gu.Guild)
                .ThenInclude(g => g.Channels)
                .Select(gu => new GuildDto
                {
                    GuildId = gu.Guild.GuildId,
                    OwnerId = gu.Guild.OwnerId,
                    GuildName = gu.Guild.GuildName,
                    RootChannel = gu.Guild.RootChannel,
                    Region = gu.Guild.Region,
                    IsGuildUploadedImg = gu.Guild.IsGuildUploadedImg,
                    GuildUsers = _dbContext.GuildUsers
                        .Where(g => g.GuildId == gu.Guild.GuildId)
                        .Select(g => g.UserId)
                        .ToList(),
                    GuildChannels = new List<ChannelWithLastRead>()
                })
                .ToListAsync();

            var allChannels = await _dbContext.Channels
                .Where(c => guilds.Select(g => g.GuildId).Contains(c.GuildId))
                .Select(c => new
                {
                    c.ChannelId,
                    c.ChannelName,
                    c.IsTextChannel,
                    LastReadDateTime = _dbContext.UserChannels
                        .Where(uc => uc.UserId == userId && uc.ChannelId == c.ChannelId)
                        .Select(uc => uc.LastReadDatetime)
                        .FirstOrDefault(),
                    c.GuildId
                })
                .ToListAsync();

            foreach (var guild in guilds)
                guild.GuildChannels = allChannels
                    .Where(c => c.GuildId == guild.GuildId)
                    .Select(c => new ChannelWithLastRead
                    {
                        ChannelId = c.ChannelId,
                        ChannelName = c.ChannelName,
                        IsTextChannel = c.IsTextChannel,
                        LastReadDateTime = c.LastReadDateTime
                    })
                    .ToList();

            return guilds;
        }
    }
}
// Request models for the API
public class StartWritingRequest
{
    public required string GuildId { get; set; }
    public required string ChannelId { get; set; }
}

public class GetChannelsRequest
{
    public required string GuildId { get; set; }
}

public class GetMessagesRequest
{
    [Required(ErrorMessage = "GuildId is required.")]
    public required string GuildId { get; set; }
    [Required(ErrorMessage = "ChannelId is required.")]
    public required string ChannelId { get; set; }
}

public class CreateChannelRequest
{
    [Required(ErrorMessage = "Channel name is required.")]
    public required string ChannelName { get; set; }
    [Required(ErrorMessage = "IsTextChannel is required.")]
    public required bool IsTextChannel { get; set; }
}

public class CreateGuildRequest
{
    public required string GuildName { get; set; }
    public IFormFile? Photo { get; set; }
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
public class GuildInvite
{
    [Key]
    public required string InviteId { get; set; }
    public required string GuildId { get; set; }
    public DateTime CreatedAt { get; set; }
}
public class GetGuildMembersRequest
{
    [Required(ErrorMessage = "Guild ID is required.")]
    public required string GuildId { get; set; }

    [Required(ErrorMessage = "User ID is required.")]
    public required string UserId { get; set; }
}

public class DeleteGuildRequest
{
    [Required(ErrorMessage = "Guild ID is required.")]
    public required string GuildId { get; set; }
}


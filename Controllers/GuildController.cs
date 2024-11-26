using Microsoft.EntityFrameworkCore;
using LiventCord.Data;
using LiventCord.Helpers;
using LiventCord.Models;
using Microsoft.AspNetCore.Mvc;
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
        private readonly MembersController _membersController;
        private readonly PermissionsController _permissionsController;


        public GuildController(AppDbContext dbContext, UploadController uploadController,MessageController messageController,MembersController membersController, PermissionsController permissionsController)
        {
            _dbContext = dbContext;
            _uploadController = uploadController;
            _permissionsController = permissionsController;
            _membersController = membersController;
        }


  
  
       


        // GET /api/guilds
        [HttpGet("")]
        public async Task<IActionResult> HandleGetGuilds([FromHeader] string userId)
        {
            var guilds = await _membersController.GetUserGuilds(userId) ?? new List<GuildDto>();

            var messageToEmit = new
            {
                Type = "update_guilds",
                Data = new { guilds }
            };

            return Ok(messageToEmit);
        }



        // POST api/guilds
        [HttpPost("")]
        public async Task<IActionResult> CreateGuild([FromForm] CreateGuildRequest request, [FromHeader] string userId)
        {
            string rootChannel = Utils.CreateRandomId();
            string? region = Request.Headers["Region"].ToString();
            if (string.IsNullOrEmpty(region))
                region = null;

            var newGuild = await CreateGuild(userId, request.GuildName, rootChannel, region);

            if (request.Photo != null)
            {
                var uploadResult = await _uploadController.UploadImage(request.Photo, newGuild.GuildId);
                if (uploadResult is not OkObjectResult uploadResultOk) return uploadResult;
                
                var value = uploadResultOk.Value;
                
                if (value == null)  return new BadRequestResult();
                dynamic dynamicValue = value;
                var fileId = dynamicValue?.fileId;

                if (fileId == null)
                    return new BadRequestResult();
                    
            }



            var guildDto = new GuildDto
            {
                GuildId = newGuild.GuildId,
                OwnerId = newGuild.OwnerId,
                GuildName = newGuild.GuildName,
                RootChannel = newGuild.RootChannel,
                Region = newGuild.Region,
                IsGuildUploadedImg = newGuild.IsGuildUploadedImg,
                GuildMembers = newGuild.GuildMembers.Select(gu => gu.MemberId).ToList()
            };

            return CreatedAtAction(nameof(CreateGuild), new { id = guildDto.GuildId }, guildDto);
        }

        

        
        private async Task<Guild> CreateGuild(string ownerId, string guildName, string rootChannel, string? region)
        {
            var guildId = Utils.CreateRandomId();

            var guild = new Guild(guildId, ownerId, guildName, rootChannel, region, false);


            guild.Channels.Add(new Channel
            {
                ChannelId = rootChannel,
                GuildId = guildId,
                ChannelName = DEFAULT_CHANNEL_NAME,
                ChannelDescription = "",
                IsTextChannel = true,
                Order = 0
            });

            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.UserId == ownerId);
            if (user == null)
                throw new Exception("User not found");

            if (guild.GuildMembers.Any(gu => gu.MemberId == ownerId)) throw new Exception("User already in guild");
                guild.GuildMembers.Add(new GuildUser { MemberId = ownerId , GuildId = guildId, Guild = guild, User=user});


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
        [HttpDelete("{guildId}")]
        public async Task<IActionResult> DeleteGuildEndpoint([FromRoute] string guildId, [FromHeader] string userId)
        {
            if (string.IsNullOrEmpty(guildId))
                return BadRequest(new { Type = "error", Message = "Guild ID is required." });



            if (!await _permissionsController.IsUserAdmin(guildId, userId))
                return Forbid("User is not authorized to delete this guild.");

            var guild = await _dbContext.Guilds.FindAsync(guildId);
            if (guild == null)
                return NotFound(new { Type = "error", Message = "Guild not found." });

            _dbContext.Guilds.Remove(guild);
            await _dbContext.SaveChangesAsync();

            return Ok(new { Type = "success", Message = "Guild deleted successfully." });
        }

        


        
    }
}




public class CreateGuildRequest
{
    public required string GuildName { get; set; }
    public IFormFile? Photo { get; set; }
}

public class GuildInvite
{
    [Key]
    public required string InviteId { get; set; }
    public required string GuildId { get; set; }
    public DateTime CreatedAt { get; set; }
}



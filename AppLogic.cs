using Microsoft.EntityFrameworkCore;
using LiventCord.Helpers;
using System.Security.Claims;
using System.Text.Json;
using LiventCord.Controllers;
using LiventCord.Models;


namespace LiventCord.Helpers
{
    
    public class AppLogic
    {
        private readonly AppDbContext _dbContext;
        private readonly GuildController _guildController;
        private readonly MembersController _membersController;
        private readonly FriendController _friendController;
        private readonly TypingController _typingController;
        private readonly ILogger<AppLogic> _logger;
        private readonly PermissionsController _permissionsController;


        public AppLogic(AppDbContext dbContext, FriendController friendController, GuildController guildController, MembersController membersController,TypingController typingController, ILogger<AppLogic> logger, PermissionsController permissionsController)
        {
            _dbContext = dbContext;
            _guildController = guildController;
            _friendController = friendController;
            _typingController = typingController;
            _logger = logger;
            _permissionsController = permissionsController;
            _membersController = membersController;
        }


        public async Task HandleChannelRequest(HttpContext context, string? guildId, string? channelId, string? friendId = null)
        {
            string? userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _logger.LogInformation("userId: {UserId}", userId);
            if (string.IsNullOrEmpty(userId)) 
            { 
                context.Response.Redirect("/login"); 
                return; 
            }

            try
            {
                _logger.LogInformation("Attempting to retrieve user from database...");
                var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.UserId == userId);
                if (user == null) 
                { 
                    context.Response.Redirect("/login"); 
                    return; 
                }

                _logger.LogInformation("Fetching guilds for user...");
                var guilds = await _membersController.GetUserGuilds(userId);
  

                _logger.LogInformation("Retrieving guild information for guildId: {GuildId}", guildId);
                var guild = await _dbContext.Guilds.FirstOrDefaultAsync(g => g.GuildId == guildId);
                
                _logger.LogInformation("Checking typing members...");
                var typingMembers = new List<string>();
                var sharedGuildsMap = new List<string>();
                var guildMembers = new List<PublicUser>();
                var permissionsMap = _permissionsController.GetPermissionsMapForUser(userId);

                if (!string.IsNullOrEmpty(guildId))
                {
                    _logger.LogInformation("Fetching guild members for guildId: {GuildId}", guildId);
                    guildMembers = await _membersController.GetGuildMembers(guildId);

                    if (!string.IsNullOrEmpty(channelId)) {
                        _logger.LogInformation("Fetching typing members...");
                        typingMembers = await _typingController.GetTypingUsers(guildId, channelId) ?? new List<string>();
                    }

                    _logger.LogInformation("Fetching shared guilds...");
                    sharedGuildsMap = await _membersController.GetSharedGuilds(guildId, userId) ?? new List<string>();
                }

                _logger.LogInformation("Fetching friends' statuses...");
                var friendsStatus = await _friendController.GetFriendsStatus(userId) ?? null;

                _logger.LogInformation("Fetching DM members...");
                var dmFriends = await _dbContext.UserDms.Where(ud => ud.UserId == userId).Select(ud => ud.FriendId).ToListAsync() ?? new List<string>();

                _logger.LogInformation("Generating JSON data...");
                var jsonData = new
                {
                    email = user.Email ?? "",
                    userId,
                    userName = user.Nickname ?? "",
                    userDiscriminator = user.Discriminator ?? "",
                    guildId,
                    channelId,
                    guildName = guild?.GuildName ?? "",
                    authorId = guild?.OwnerId ?? "",
                    guildMembers,
                    typingMembers,
                    sharedGuildsMap,
                    permissionsMap,
                    friendsStatus,
                    dmFriends,
                    guildsJson = guilds
                };

                string jsonDataScript = $@"
                    <script id='data-script' type='application/json'>
                        {JsonSerializer.Serialize(jsonData)}
                    </script>";

                var filePath = Path.Combine(context.RequestServices.GetRequiredService<IWebHostEnvironment>().WebRootPath, "app.html");
                _logger.LogInformation("Reading HTML file from path: {FilePath}", filePath);
                var htmlContent = await File.ReadAllTextAsync(filePath);
                
                var bodyCloseTagIndex = htmlContent.LastIndexOf("</body>");
                if (bodyCloseTagIndex >= 0)
                {
                    htmlContent = htmlContent.Insert(bodyCloseTagIndex, jsonDataScript);
                }

                context.Response.ContentType = "text/html";
                await context.Response.WriteAsync(htmlContent);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while processing the channel request.");
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                await context.Response.WriteAsync("An internal server error occurred.");
            }
        }


    }
}

using MyPostgresApp.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using MyPostgresApp.Helpers;
using MyPostgresApp.Services;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;

namespace MyPostgresApp.Helpers
{
    public class AppLogic
    {
        private readonly AppDbContext _dbContext;
        private readonly TypingService _typingService;
        private readonly GuildService _guildService;
        private readonly FriendHelper _friendHelper;

        public AppLogic(AppDbContext dbContext, TypingService typingService, GuildService guildService, FriendHelper friendHelper)
        {
            _dbContext = dbContext;
            _typingService = typingService;
            _guildService = guildService;
            _friendHelper = friendHelper;
        }

        public async Task HandleChannelRequest(HttpContext context, string guildId, string channelId, string friendId = null)
        {
            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) { context.Response.Redirect("/login"); return; }

            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) { context.Response.Redirect("/login"); return; }

            var email = user.Email ?? "";
            var userName = user.Nickname ?? "";
            var userDiscriminator = user.Discriminator ?? "";

            var guilds = await _guildService.GetUserGuilds(userId,guildId);
            
            var guildUsers = await _guildService.GetGuildUsers(guildId);

            var guild = await _dbContext.Guilds.FirstOrDefaultAsync(g => g.GuildId == guildId);
            var guildName = guild?.GuildName ?? "";
            var authorId = guild?.OwnerId ?? "";

            var typingUsers = new List<string>();
            var sharedGuildsMap = new List<string>();
            var permissionsMap = _guildService.GetPermissionsMapForUser(userId);

            if (!string.IsNullOrEmpty(guildId))
            {
                typingUsers = await _typingService.GetTypingUsers(guildId, channelId) ?? new List<string>();
                sharedGuildsMap = await _guildService.GetSharedGuilds(guildId, userId) ?? new List<string>();
          
            }

            var friendsStatus = await _friendHelper.GetFriendsStatus(userId) ?? null;

            var dmUsers = await _dbContext.UserDms.Where(ud => ud.UserId == userId).Select(ud => ud.FriendId).ToListAsync() ?? new List<string>();

            var jsonData = new
            {
                email,
                userId,
                userName,
                userDiscriminator,
                guildId,
                channelId,
                guildName,
                authorId,
                guildUsers,
                typingUsers,
                sharedGuildsMap,
                permissionsMap,
                friendsStatus,
                dmUsers,
                guildsJson = guilds
            };

            string jsonDataScript = $@"
                <script id='data-script' type='application/json'>
                    {JsonSerializer.Serialize(jsonData)}
                </script>";

            var filePath = Path.Combine(context.RequestServices.GetRequiredService<IWebHostEnvironment>().WebRootPath, "app.html");
            var htmlContent = await File.ReadAllTextAsync(filePath);
            var bodyCloseTagIndex = htmlContent.LastIndexOf("</body>");

            if (bodyCloseTagIndex >= 0)
            {
                htmlContent = htmlContent.Insert(bodyCloseTagIndex, jsonDataScript);
            }

            context.Response.ContentType = "text/html";
            await context.Response.WriteAsync(htmlContent);
        }

    }
}

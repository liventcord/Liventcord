using Microsoft.EntityFrameworkCore;
using MyPostgresApp.Data;
using MyPostgresApp.Helpers;
using MyPostgresApp.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class GuildService
{
    private readonly AppDbContext _dbContext;

    public GuildService(AppDbContext dbContext) => _dbContext = dbContext;

    public async Task<Guild> CreateGuild(string ownerId, string guildName, string rootChannel, string? region)
    {
        var guildId = Utils.CreateRandomId();
        var guild = new Guild(ownerId, rootChannel)
        {
            GuildId = guildId,
            GuildName = guildName,
            Region = region,
            IsGuildUploadedImg = false
        };

        _dbContext.Guilds.Add(guild);
        await _dbContext.SaveChangesAsync();
        return guild;
    }
    public void AssignPermissions(string guildId, string userId, Dictionary<string, int> permissions)
    {
        var guildPermissions = new GuildPermissions
        {
            GuildId = guildId,
            UserId = userId,
            ReadMessages = permissions["read_messages"],
            SendMessages = permissions["send_messages"],
            ManageRoles = permissions["manage_roles"],
            KickMembers = permissions["kick_members"],
            BanMembers = permissions["ban_members"],
            ManageChannels = permissions["manage_channels"],
            MentionEveryone = permissions["mention_everyone"],
            AddReaction = permissions["add_reaction"],
            IsAdmin = permissions["is_admin"],
            CanInvite = permissions["can_invite"]
        };

        _dbContext.GuildPermissions.Add(guildPermissions);
        _dbContext.SaveChanges();
    }


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
                Status = gu.User.Status,
                IsOnline = IsOnline(gu.User.UserId),
                CreatedAt = gu.User.CreatedAt,
                SocialMediaLinks = gu.User.SocialMediaLinks
            })
            .ToListAsync();
    }
    private static List<string> OnlineUsers = new();
    private static bool IsOnline(string userId){return OnlineUsers.Contains(userId);}
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

    public void DeleteGuild(string guildId)
    {
        if (string.IsNullOrEmpty(guildId)) {
            Console.WriteLine("Guild ID cannot be null or empty.", nameof(guildId));
            return;
        }

        var guild = _dbContext.Guilds.Find(guildId);
        if (guild == null) {
            Console.WriteLine("Guild does not exist.");
            return;
        }

        _dbContext.Guilds.Remove(guild);
        _dbContext.SaveChanges();
    }






    public bool DoesUserExistInGuild(string userId, string guildId)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(guildId))
            return false;

        return _dbContext.GuildUsers
            .Any(gu => gu.UserId == userId && gu.GuildId == guildId);
    }





    public async Task<string?> GetGuildAuthor(string guildId)
    {
        return await _dbContext.Guilds
            .Where(g => g.GuildId == guildId)
            .Select(g => g.OwnerId)
            .FirstOrDefaultAsync();
    }

    public Dictionary<string, Dictionary<string, int>> GetPermissionsMapForUser(string userId)
    {
        var permissionsMap = new Dictionary<string, Dictionary<string, int>>();

        var userPermissions = _dbContext.GuildPermissions
            .Where(gp => gp.UserId == userId)
            .Include(gp => gp.Guild)
            .ToList();

        foreach (var perm in userPermissions)
        {
            var guildId = perm.GuildId;

            if (!permissionsMap.ContainsKey(guildId))
            {
                permissionsMap[guildId] = new Dictionary<string, int>
                {
                    { "read_messages", perm.ReadMessages },
                    { "send_messages", perm.SendMessages },
                    { "manage_roles", perm.ManageRoles },
                    { "kick_members", perm.KickMembers },
                    { "ban_members", perm.BanMembers },
                    { "manage_channels", perm.ManageChannels },
                    { "mention_everyone", perm.MentionEveryone },
                    { "add_reaction", perm.AddReaction },
                    { "is_admin", perm.IsAdmin },
                    { "can_invite", perm.CanInvite }
                };
            }
        }

        return permissionsMap;
    }




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
                FirstChannelId = gu.Guild.Channels
                    .OrderBy(c => c.Order)
                    .Select(c => c.ChannelId)
                    .FirstOrDefault()
            })
            .ToListAsync();

        return guilds;
    }

    public async Task<string?> GetGuildName(string guildId)
    {
        var guild = await _dbContext.Guilds
            .FirstOrDefaultAsync(g => g.GuildId == guildId);

        return guild?.GuildName;
    }


}

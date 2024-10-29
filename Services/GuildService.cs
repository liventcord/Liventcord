using Microsoft.EntityFrameworkCore;
using LiventCord.Data;
using LiventCord.Helpers;
using LiventCord.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class GuildService
{
    private readonly AppDbContext _dbContext;

    public GuildService(AppDbContext dbContext) => _dbContext = dbContext;
    public async void AddUserToGuild(string userId, string guildId)
    {
        var guild = await _dbContext.Guilds
            .Include(g => g.GuildUsers)
            .FirstOrDefaultAsync(g => g.GuildId == guildId);

        if (guild == null) 
            throw new Exception("Guild not found");

        if (!guild.GuildUsers.Any(gu => gu.UserId == userId))
        {
            guild.GuildUsers.Add(new GuildUser { UserId = userId });
        }

        var permissions = new Dictionary<string, int>
        {
            {"read_messages", 1}, 
            {"send_messages", 1}, 
            {"mention_everyone", 1}, 
            {"manage_roles", 0},
            {"kick_members", 0}, 
            {"ban_members", 0}, 
            {"manage_channels", 0},
            {"add_reaction", 0}, 
            {"is_admin", 0}, 
            {"can_invite", 0}
        };

        AssignPermissions(guildId, userId, permissions);

        await _dbContext.SaveChangesAsync();
    }
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

        guild.Channels.Add(new Channel
        {
            ChannelId = rootChannel,
            ChannelName = "general",
            ChannelDescription = "",
            IsTextChannel = true,
            Order = 0
        });

        guild.GuildUsers.Add(new GuildUser { UserId = ownerId });

        _dbContext.Guilds.Add(guild);
        await _dbContext.SaveChangesAsync();  

        var permissions = new Dictionary<string, int>
        {
            {"read_messages", 1}, {"send_messages", 1}, {"manage_roles", 1},
            {"kick_members", 1}, {"ban_members", 1}, {"manage_channels", 1},
            {"mention_everyone", 1}, {"add_reaction", 1}, {"is_admin", 1},
            {"can_invite", 1}
        };
        AssignPermissions(guildId, ownerId, permissions); 

        await _dbContext.SaveChangesAsync();

        return guild; 
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


    public async Task CreateChannel(string guildId, string channelName, bool isTextChannel)
    {
        if (string.IsNullOrEmpty(guildId))
        {
            throw new ArgumentException("Guild ID cannot be null or empty.", nameof(guildId));
        }

        if (string.IsNullOrEmpty(channelName))
        {
            throw new ArgumentException("Channel name cannot be null or empty.", nameof(channelName));
        }

        var guild = await _dbContext.Guilds
            .Include(g => g.Channels)
            .FirstOrDefaultAsync(g => g.GuildId == guildId);

        if (guild == null)
        {
            throw new InvalidOperationException("Guild does not exist.");
        }

        var newChannel = new Channel
        {
            ChannelId = Utils.CreateRandomId(),
            ChannelName = channelName,
            IsTextChannel = isTextChannel,
            GuildId = guildId,
            Order = guild.Channels.Count 
        };

        guild.Channels.Add(newChannel);

        await _dbContext.SaveChangesAsync();
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
    public async Task<List<string>> GetGuildUsersIds(string guildId)
    {
        if (string.IsNullOrEmpty(guildId))
            return new List<string>();

        return await _dbContext.GuildUsers
            .Where(gu => gu.GuildId == guildId)
            .Select(gu => gu.User.UserId)
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

    public async Task<bool> CanManageChannels(string userId, string guildId)
    {
        var authorId = await GetGuildAuthor(guildId);
        return authorId == userId || await HasPermission(userId, guildId, "manage_channels");
    }

    public async Task<bool> IsUserAdmin(string guildId, string userId)
    {
        var authorId = await GetGuildAuthor(guildId);
        return authorId == userId || await HasPermission(userId, guildId, "is_admin");
    }

    public async Task<bool> HasPermission(string userId, string guildId, string permission)
    {
        var userPermissions = await _dbContext.GuildPermissions
            .Where(gp => gp.UserId == userId && gp.GuildId == guildId)
            .Select(gp => new
            {
                ReadMessages = gp.ReadMessages != 0,
                SendMessages = gp.SendMessages != 0,
                ManageRoles = gp.ManageRoles != 0,
                KickMembers = gp.KickMembers != 0,
                BanMembers = gp.BanMembers != 0,
                ManageChannels = gp.ManageChannels != 0,
                MentionEveryone = gp.MentionEveryone != 0,
                AddReaction = gp.AddReaction != 0,
                IsAdmin = gp.IsAdmin != 0,
                CanInvite = gp.CanInvite != 0
            })
            .FirstOrDefaultAsync();

        if (userPermissions == null) return false;

        if (userPermissions.IsAdmin)
        {
            return true; 
        }

        return permission switch
        {
            "read_messages" => userPermissions.ReadMessages,
            "send_messages" => userPermissions.SendMessages,
            "manage_roles" => userPermissions.ManageRoles,
            "kick_members" => userPermissions.KickMembers,
            "ban_members" => userPermissions.BanMembers,
            "manage_channels" => userPermissions.ManageChannels,
            "mention_everyone" => userPermissions.MentionEveryone,
            "add_reaction" => userPermissions.AddReaction,
            "can_invite" => userPermissions.CanInvite,
            _ => false
        };
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
            if (!permissionsMap.TryGetValue(perm.GuildId, out var permDict))
            {
                permDict = new Dictionary<string, int>
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
                permissionsMap[perm.GuildId] = permDict;
            }
        }

        return permissionsMap;
    }

    public void AssignPermissions(string guildId, string userId, Dictionary<string, int> permissions)
    {
        var existingPermissions = _dbContext.GuildPermissions
            .FirstOrDefault(gp => gp.GuildId == guildId && gp.UserId == userId);
        
        if (existingPermissions != null)
        {
            existingPermissions.ReadMessages = permissions["read_messages"];
            existingPermissions.SendMessages = permissions["send_messages"];
            existingPermissions.ManageRoles = permissions["manage_roles"];
            existingPermissions.KickMembers = permissions["kick_members"];
            existingPermissions.BanMembers = permissions["ban_members"];
            existingPermissions.ManageChannels = permissions["manage_channels"];
            existingPermissions.MentionEveryone = permissions["mention_everyone"];
            existingPermissions.AddReaction = permissions["add_reaction"];
            existingPermissions.IsAdmin = permissions["is_admin"];
            existingPermissions.CanInvite = permissions["can_invite"];
            _dbContext.GuildPermissions.Update(existingPermissions);
        }
        else
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
        }
        _dbContext.SaveChanges();
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
                    .FirstOrDefault(),
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
                .Where(c => c.GuildId == guild.GuildId) // Filter channels by guild
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




    public async Task<string?> GetGuildName(string guildId)
    {
        var guild = await _dbContext.Guilds
            .FirstOrDefaultAsync(g => g.GuildId == guildId);

        return guild?.GuildName;
    }


}

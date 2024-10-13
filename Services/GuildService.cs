// Services/GuildService.cs
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

    public async Task<string?> GetGuildAuthor(string guildId)
    {
        return await _dbContext.Guilds
            .Where(g => g.GuildId == guildId)
            .Select(g => g.OwnerId)
            .FirstOrDefaultAsync();
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
                    .OrderBy(c => c.Order) // Order by the Order property
                    .Select(c => c.ChannelId) // Select the ChannelId
                    .FirstOrDefault() // Get the first channel ID or null if none exists
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
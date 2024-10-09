using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyPostgresApp.Data;

public class GuildService
{
    private readonly AppDbContext _dbContext;

    public GuildService(AppDbContext dbContext) => _dbContext = dbContext;

    public async Task<List<string>> GetSharedGuilds(string guildId, string userId)
    {
        if(string.IsNullOrEmpty(guildId) || string.IsNullOrEmpty(userId)) 
            return new List<string>();
        
        var sharedGuilds = await _dbContext.GuildUsers
            .Where(gu => gu.UserId == userId)
            .Select(gu => gu.GuildId)
            .ToListAsync();

        return sharedGuilds.Where(g => g != guildId).ToList();
    }


    public async Task<string> GetGuildAuthor(string guildId)
    {
        return await _dbContext.Guilds
            .Where(g => g.GuildId == guildId)
            .Select(g => g.OwnerId)
            .FirstOrDefaultAsync();
    }

}

using LiventCord.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

public class GuildInviteService
{
    private readonly AppDbContext _dbContext;

    public GuildInviteService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // Generate a random invite ID
    private string CreateRandomInviteId()
    {
        const int length = 8;
        const string characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var random = new Random();
        return new string(Enumerable.Range(0, length)
            .Select(_ => characters[random.Next(characters.Length)])
            .ToArray());
    }

    public async Task AddInviteAsync(string guildId)
    {
        var inviteId = CreateRandomInviteId();

        var guildInvite = new GuildInvite
        {
            GuildId = guildId,
            InviteId = inviteId,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.GuildInvites.Add(guildInvite);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<string> GetGuildIdByInviteAsync(string inviteId)
    {
        var guildInvite = await _dbContext.GuildInvites
            .FirstOrDefaultAsync(g => g.InviteId == inviteId);

        return guildInvite?.GuildId;
    }
}

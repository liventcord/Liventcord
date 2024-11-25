using Microsoft.EntityFrameworkCore;
using LiventCord.Models;
using LiventCord.Data;

namespace LiventCord.Controllers
{
    public class TypingController
    {
        private readonly AppDbContext _dbContext;

        public TypingController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<string>?> GetTypingUsers(string guildId, string channelId)
        {
            var typingUsers = await _dbContext.TypingStatuses
                .Where(t => t.GuildId == guildId && t.ChannelId == channelId)
                .Select(t => t.UserId)
                .ToListAsync();

            return typingUsers;
        }
    }
}

using Microsoft.EntityFrameworkCore;
using MyPostgresApp.Data;
using MyPostgresApp.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MyPostgresApp.Services
{
    public class TypingService
    {
        private readonly AppDbContext _dbContext;
        public TypingService(AppDbContext dbContext) => _dbContext = dbContext;

        public async Task<List<string>> GetTypingUsers(string guildId, string channelId)
        {
            return await _dbContext.TypingStatuses
                .Where(ts => ts.GuildId == guildId && ts.ChannelId == channelId)
                .Select(ts => ts.UserId)
                .ToListAsync();
        }
    }
}

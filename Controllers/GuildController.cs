using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyPostgresApp.Data;
using MyPostgresApp.Models;

namespace MyPostgresApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GuildController : ControllerBase
    {
        private readonly AppDbContext _dbContext;

        public GuildController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IActionResult> GetUserGuilds(string userId)
        {
            var guilds = await _dbContext.GuildUsers
                .Where(gu => gu.UserId == userId)
                .Include(gu => gu.Guild)
                .Select(gu => gu.Guild)
                .ToListAsync();

            if (guilds == null || !guilds.Any())
            {
                return NotFound(new { Message = "No guilds found for this user." });
            }

            return Ok(guilds);
        }

        public async Task<IActionResult> GetGuildName(string guildId)
        {
            var guild = await _dbContext.Guilds
                .FirstOrDefaultAsync(g => g.GuildId == guildId);

            if (guild == null)
            {
                return NotFound(new { Message = "Guild not found." });
            }

            return Ok(new { GuildName = guild.GuildName });
        }

        public async Task<List<string>> GetSharedGuilds(string guildId, string userId)
        {
            var sharedGuilds = await _dbContext.GuildUsers
                .Where(gu => gu.UserId == userId)
                .Select(gu => gu.GuildId)
                .ToListAsync();

            sharedGuilds = sharedGuilds.Where(g => g != guildId).ToList();

            return sharedGuilds;
        }
    }
}

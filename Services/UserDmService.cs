using Microsoft.EntityFrameworkCore;
using LiventCord.Data;
using LiventCord.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LiventCord.Services
{
    public class UserDmService
    {
        private readonly AppDbContext _dbContext;

        public UserDmService(AppDbContext dbContext) => _dbContext = dbContext;

        public async Task<List<string>> GetUsersDmAsync(string userId)
        {
            return await _dbContext.UserDms
                .Where(ud => ud.UserId == userId)
                .Select(ud => ud.FriendId) 
                .ToListAsync();
        }
    }
}

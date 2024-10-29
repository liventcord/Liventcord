using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using LiventCord.Data;
using LiventCord.Models;

namespace LiventCord.Helpers
{
    public class FriendHelper
    {
        private readonly AppDbContext _dbContext;

        public FriendHelper(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<string> QueryFriendName(string friendId)
        {
            var friend = await _dbContext.Users.SingleOrDefaultAsync(u => u.UserId == friendId);
            return friend?.Nickname ?? "Friend not found"; 
        }

        public async Task<string> QueryFriendDiscriminator(string friendId)
        {
            var friend = await _dbContext.Users.SingleOrDefaultAsync(u => u.UserId == friendId);
            return friend?.Discriminator ?? "Discriminator not found"; 
        }

        public async Task<List<string>> GetFriendsNames(string userId)
        {
            var friendsNames = await _dbContext.Friends
                .Where(f => f.UserId == userId)
                .Join(_dbContext.Users, 
                      friend => friend.FriendId, 
                      user => user.UserId,
                      (friend, user) => user.Nickname)
                .ToListAsync();
                
            return friendsNames;
        }

        public async Task<List<PublicUser>> GetFriendsStatus(string userId)
        {
            var publicFriend = await _dbContext.Friends
                .Where(f => f.UserId == userId)
                .Join(_dbContext.Users,
                    friend => friend.FriendId,
                    user => user.UserId,
                    (friend, user) => user.GetPublicUser())
                .ToListAsync();
                
            return publicFriend;
        }

    }
}

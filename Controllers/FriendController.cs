using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LiventCord.Models;
using LiventCord.Data;
using Microsoft.AspNetCore.Authorization;

namespace LiventCord.Controllers
{
    [ApiController]
    [Route("api/friends")]
    [Authorize]
    public class FriendController : ControllerBase
    {

        private readonly AppDbContext _dbContext;

        public FriendController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }


        
        [NonAction] 
        public async Task<List<PublicUser>> GetFriendsStatus(string userId)
        {
            var publicFriends = await _dbContext.Friends
                .Where(f => f.UserId == userId && f.Status == FriendStatus.Accepted)  // No cast needed for UserId
                .Join(_dbContext.Users,
                    friend => friend.FriendId,
                    user => user.UserId,
                    (friend, user) => user.GetPublicUser())
                .ToListAsync();

            return publicFriends;
        }



        [HttpPost("")]
        public async Task<IActionResult> AddFriendEndpoint([FromQuery] string userId, [FromQuery] string friendName, [FromQuery] string friendDiscriminator)
        {
            if (string.IsNullOrWhiteSpace(friendName) || string.IsNullOrWhiteSpace(friendDiscriminator))
            {
                return BadRequest(new { Type = "error", Message = "Friend name and discriminator must be provided." });
            }

            await AddFriend(userId, friendName, friendDiscriminator);
            return Ok(new { Type = "success", Message = "Friend request sent." });
        }

        private async Task AddFriend(string userId, string friendName, string friendDiscriminator)
        {
            var friend = await _dbContext.Users
                .FirstOrDefaultAsync(u => u.Nickname == friendName && u.Discriminator == friendDiscriminator);

            if (friend != null)
            {
                var existingFriendship = await _dbContext.Friends
                    .FirstOrDefaultAsync(f => f.UserId == userId && f.FriendId == friend.UserId);

                if (existingFriendship == null)
                {
                    var newFriendship = new Friend
                    {
                        UserId = userId,
                        FriendId = friend.UserId,
                        Status = FriendStatus.Pending
                    };

                    _dbContext.Friends.Add(newFriendship);
                    await _dbContext.SaveChangesAsync();
                }
            }
            else
            {
                throw new ArgumentException("Friend not found.");
            }
        }




    }
}

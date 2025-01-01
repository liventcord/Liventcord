using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LiventCord.Models;
using Microsoft.AspNetCore.Authorization;


namespace LiventCord.Controllers
{

    [ApiController]
    [Route("api/dm")]
    [Authorize]
    public class DmController : BaseController
    {
        private readonly AppDbContext _dbContext;
        public DmController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        [HttpGet("")]
        public async Task<IActionResult> GetDmEndpoint()
        {
            if (string.IsNullOrEmpty(UserId))
                return Unauthorized("User ID is missing.");

            var publicDmUsers = await _dbContext.Friends
                .Where(f => f.UserId == UserId && f.Status == FriendStatus.Accepted)
                .Join(
                    _dbContext.Users,
                    friend => friend.FriendId,
                    user => user.UserId,
                    (friend, user) => user.GetPublicUser()
                )
                .ToListAsync();

            return Ok(publicDmUsers);
        }

        [HttpPost("")]
        public async Task<IActionResult> AddDmEndpoint([FromRoute][IdLengthValidation] string friendId)
        {
            var result = await AddDmUser(UserId!, friendId);

            if (result.IsSuccess)
            {
                return Ok(new { Type = "success", Message = result.Message });
            }
            else
            {
                return BadRequest(new { Type = "error", Message = result.Message });
            }
        }


        private async Task<Result> AddDmUser(string userId, string friendId)
        {
            var friend = await _dbContext.Users
                .Where(u => u.UserId == friendId)
                .Select(u => new { u.UserId})
                .FirstOrDefaultAsync();

            if (friend == null)
                return Result.Failure("Friend not found.");

            if (friend.UserId == userId)
                return Result.Failure("You cannot add yourself as a friend.");

            var existingFriendship = await _dbContext.Friends
                .AnyAsync(f => (f.UserId == userId && f.FriendId == friend.UserId) || 
                            (f.UserId == friend.UserId && f.FriendId == userId));

            if (existingFriendship)
                return Result.Failure("You are already friends with this user.");

            using (var transaction = await _dbContext.Database.BeginTransactionAsync())
            {
                var newFriendship = new Friend
                {
                    UserId = userId,
                    FriendId = friend.UserId,
                    Status = FriendStatus.Pending
                };

                var reverseFriendship = new Friend
                {
                    UserId = friend.UserId,
                    FriendId = userId,
                    Status = FriendStatus.Pending
                };

                _dbContext.Friends.Add(newFriendship);
                _dbContext.Friends.Add(reverseFriendship);

                await _dbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                return Result.Success("Friend request sent.");
            }
        }





    }

}

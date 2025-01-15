using LiventCord.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LiventCord.Controllers
{
    [ApiController]
    [Route("api/friends")]
    [Authorize]
    public class FriendController : BaseController
    {
        private readonly AppDbContext _dbContext;

        public FriendController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("")]
        public async Task<IActionResult> GetFriendEndpoint()
        {
            if (string.IsNullOrEmpty(UserId))
                return Unauthorized("User ID is missing.");

            var friends = await GetFriends(UserId);
            return Ok(friends);
        }

        [HttpPost("")]
        public async Task<IActionResult> AddFriendEndpoint([FromBody] AddFriendRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Invalid request data.");
            }
            if (string.IsNullOrEmpty(UserId))
                return Unauthorized("User ID is missing.");


            var friend = await _dbContext
                .Users.Where(u =>
                    u.Nickname == request.FriendName
                    && u.Discriminator == request.FriendDiscriminator
                )
                .Select(u => new { u.UserId })
                .FirstOrDefaultAsync();

            if (friend == null)
            {
                return NotFound("Friend not found.");
            }

            if (friend.UserId == UserId)
            {
                return BadRequest("You cannot add yourself as a friend.");
            }

            var existingFriendship = await _dbContext.Friends.AnyAsync(f =>
                (f.UserId == UserId && f.FriendId == friend.UserId)
                || (f.UserId == friend.UserId && f.FriendId == UserId)
            );

            if (existingFriendship)
            {
                return Conflict("You are already friends with this user.");
            }

            using (var transaction = await _dbContext.Database.BeginTransactionAsync())
            {
                var newFriendship = new Friend
                {
                    UserId = UserId,
                    FriendId = friend.UserId,
                    Status = FriendStatus.Pending,
                };

                var reverseFriendship = new Friend
                {
                    UserId = friend.UserId,
                    FriendId = UserId,
                    Status = FriendStatus.Pending,
                };

                _dbContext.Friends.Add(newFriendship);
                _dbContext.Friends.Add(reverseFriendship);

                await _dbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok("Friend request sent.");
            }
        }

        [NonAction]
        public async Task<List<PublicUserWithStatus>> GetFriendsStatus(string userId)
        {
            var friends = await _dbContext
                .Friends.Where(f =>
                    f.UserId == userId
                    && (f.Status == FriendStatus.Accepted || f.Status == FriendStatus.Pending)
                )
                .Join(
                    _dbContext.Users,
                    friend => friend.FriendId,
                    user => user.UserId,
                    (friend, user) =>
                        new PublicUserWithStatus
                        {
                            PublicUser = user.GetPublicUser(),
                            Status = friend.Status,
                        }
                )
                .ToListAsync();

            return friends;
        }

        public class PublicUserWithStatus
        {
            public required PublicUser PublicUser { get; set; }
            public FriendStatus Status { get; set; }
        }

        private async Task<List<FriendDto>> GetFriends(string userId)
        {
            var friends = await _dbContext
                .Friends.Where(f => f.UserId == userId || f.FriendId == userId)
                .Select(f => new
                {
                    FriendId = f.UserId == userId ? f.FriendId : f.UserId,
                    Status = f.Status,
                })
                .ToListAsync();

            var friendIds = friends.Select(fr => fr.FriendId).ToList();

            var friendDetails = await _dbContext
                .Users.Where(u => friendIds.Contains(u.UserId))
                .ToDictionaryAsync(u => u.UserId, u => u);

            var result = friends
                .Select(fr =>
                {
                    if (
                        !friendDetails.TryGetValue(fr.FriendId, out var userDetails)
                        || userDetails == null
                    )
                    {
                        throw new InvalidOperationException(
                            $"User details for FriendId {fr.FriendId} not found."
                        );
                    }

                    return new FriendDto
                    {
                        UserId = fr.FriendId,
                        Nickname = userDetails.Nickname,
                        Discriminator = userDetails.Discriminator,
                        Status = fr.Status,
                    };
                })
                .ToList();

            return result;
        }
    }
}

public enum AddFriendErrorCode
{
    None,
    UserNotFound,
    CannotAddSelf,
    AlreadyFriends,
    UnknownError,
}

public class AddFriendRequest
{
    public required string FriendName { get; set; }
    public required string FriendDiscriminator { get; set; }
}

public class FriendDto
{
    public required string UserId { get; set; }
    public required string Nickname { get; set; }
    public required string Discriminator { get; set; }
    public FriendStatus Status { get; set; }
}

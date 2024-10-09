using Microsoft.AspNetCore.Mvc;
using MyPostgresApp.Helpers;

namespace MyPostgresApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FriendController : ControllerBase
    {
        private readonly FriendHelper _friendHelper;

        public FriendController(FriendHelper friendService)
        {
            _friendHelper = friendService;
        }

        private IActionResult GetFriendName(string friendId)
        {
            var friendName = _friendHelper.QueryFriendName(friendId);
            return Ok(new { friendId, friendName });
        }

        private IActionResult GetFriendDiscriminator(string friendId)
        {
            var friendDiscriminator = _friendHelper.QueryFriendDiscriminator(friendId);
            return Ok(new { friendId, friendDiscriminator });
        }
    }
}

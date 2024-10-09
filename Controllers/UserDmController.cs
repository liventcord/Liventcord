using Microsoft.AspNetCore.Mvc;
using MyPostgresApp.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MyPostgresApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserDmController : ControllerBase
    {
        private readonly UserDmService _userDmService;

        public UserDmController(UserDmService userDmService)
        {
            _userDmService = userDmService;
        }

        public async Task<ActionResult<List<string>>> GetUsersDm(string userId)
        {
            var friends = await _userDmService.GetUsersDmAsync(userId);

            if (friends.Count == 0)
            {
                return NotFound("No friends found.");
            }

            return Ok(friends);
        }
    }
}

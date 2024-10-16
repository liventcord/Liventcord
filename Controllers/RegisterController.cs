using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using MyPostgresApp.Data;
using MyPostgresApp.Models;
using MyPostgresApp.Helpers; 
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace MyPostgresApp.Controllers
{
    [Route("auth")]
    [ApiController]
    public class RegisterController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMemoryCache _cache;

        public RegisterController(AppDbContext context, IMemoryCache cache)
        {
            _context = context;
            _cache = cache;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterAuth([FromForm] string email, [FromForm] string password, [FromForm] string nickname)
        {
            if (string.IsNullOrEmpty(nickname) || nickname.Length > 32)
                return BadRequest(new { message = "Nickname must be between 1 and 32 characters." });

            if (string.IsNullOrEmpty(password) || password.Length > 128)
                return BadRequest(new { message = "Password must be between 1 and 128 characters." });

            if (string.IsNullOrEmpty(email) || email.Length > 240)
                return BadRequest(new { message = "Email must be between 1 and 240 characters." });

            if (!ValidationHelper.ValidateEmail(email))
                return BadRequest(new { error = "Invalid email format." });

            var existingUser = await _context.Users.SingleOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
            if (existingUser != null)
                return Conflict(new { error = "Email already exists." });

            var existingNick = await _context.Users.SingleOrDefaultAsync(u => u.Nickname.ToLower() == nickname.ToLower());
            string discriminator;

            if (existingNick == null)
            {
                discriminator = "0000";
                await _context.Discriminators.AddAsync(new Discriminator { Nickname = nickname, Value = discriminator });
            }
            else
            {
                // Call GetNickDiscriminator with the nickname string directly
                var nextDiscriminatorResult = await GetNickDiscriminator(nickname);

                if (nextDiscriminatorResult is OkObjectResult okResult)
                {
                    discriminator = ((dynamic)okResult.Value).result; 
                }
                else
                {
                    return BadRequest(new { error = "Failed to retrieve discriminator." });
                }
            }

            string userId = Utils.CreateRandomId();
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

            var newUser = new User
            {
                UserId = userId,
                Email = email,
                Password = hashedPassword,
                Nickname = nickname,
                Discriminator = discriminator,
                Bot = 0,
                Status = "offline"
            };

            await _context.Users.AddAsync(newUser);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Registration successful." });
        }

        [HttpPost("get_nick_discriminator")]
        public async Task<IActionResult> GetNickDiscriminator([FromForm] string nick)
        {
            if (string.IsNullOrEmpty(nick) || nick.Length > 32)
                return BadRequest(new { message = "Nickname must be between 1 and 32 characters." });

            var existingUsers = await _context.Users
                .Where(u => u.Nickname.ToLower() == nick.ToLower())
                .Select(u => u.Discriminator)
                .ToListAsync();

            if (existingUsers.Count == 0)
            {
                return Ok(new { result = "0000" });
            }

            // Get the next available random discriminator
            string nextAvailableDiscriminator = GenerateNextAvailableDiscriminator(existingUsers);

            return Ok(new { result = nextAvailableDiscriminator });
        }

        private string GenerateNextAvailableDiscriminator(List<string> existingDiscriminators)
        {
            Random random = new Random();
            string newDiscriminator;

            do
            {
                newDiscriminator = random.Next(1000, 10000).ToString(); // Generates numbers from 1000 to 9999
            } while (existingDiscriminators.Contains(newDiscriminator));

            return newDiscriminator; // Return the next available discriminator
        }
    }
}

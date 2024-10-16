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

            var existingNickUsers = await _context.Users
                .Where(u => u.Nickname.ToLower() == nickname.ToLower())
                .ToListAsync();

            string discriminator;

            if (!existingNickUsers.Any())
            {
                discriminator = "0000";
                await _context.Discriminators.AddAsync(new Discriminator { Nickname = nickname, Value = discriminator });
            }
            else
            {
                var existingDiscriminators = existingNickUsers.Select(u => u.Discriminator).ToList();
                
                // Check if all discriminator combinations are taken
                if (existingDiscriminators.Count >= 9999)
                    return BadRequest(new { error = "Too many users have taken all possible discriminator combinations." });

                discriminator = SelectRandomDiscriminator(existingDiscriminators);
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
                .ToListAsync();

            if (!existingUsers.Any())
            {
                return Ok(new { result = "0000" });
            }

            var existingDiscriminators = existingUsers.Select(u => u.Discriminator).ToList();

            // Check if all discriminator combinations are taken
            if (existingDiscriminators.Count >= 9999)
                return BadRequest(new { error = "Too many users have taken all possible discriminator combinations." });

            string nextAvailableDiscriminator = SelectRandomDiscriminator(existingDiscriminators);
            return Ok(new { result = nextAvailableDiscriminator });
        }

        private string SelectRandomDiscriminator(List<string> existingDiscriminators)
        {
            Random random = new Random();
            List<string> availableDiscriminators = new List<string>();

            for (int i = 0; i <= 9999; i++)
            {
                string discriminator = i.ToString("D4"); // Format as 4 digits
                if (!existingDiscriminators.Contains(discriminator))
                {
                    availableDiscriminators.Add(discriminator);
                }
            }

            if (availableDiscriminators.Count == 0)
                throw new InvalidOperationException("No available discriminators.");

            // Select a random available discriminator
            return availableDiscriminators[random.Next(availableDiscriminators.Count)];
        }
    }
}

using Microsoft.AspNetCore.Mvc;
using LiventCord.Data;
using LiventCord.Models;
using Microsoft.EntityFrameworkCore;
using LiventCord.Helpers;
using System.ComponentModel.DataAnnotations;

namespace LiventCord.Controllers
{
    [Route("auth")]
    [ApiController]
    public class RegisterController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RegisterController(AppDbContext context) => _context = context;

        [HttpPost("register")]
        public async Task<IActionResult> RegisterAuth([FromForm] RegisterRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower()))
                return Conflict(new { error = "Email already exists." });

            var discriminator = await GetOrCreateDiscriminator(request.Nickname);
            if (discriminator == null)
                return BadRequest(new { error = "No available discriminators." });

            await _context.Users.AddAsync(new User
            {
                UserId = Utils.CreateRandomId(),
                Email = request.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Nickname = request.Nickname,
                Discriminator = discriminator,
                Bot = 0,
                Status = "offline"
            });
            await _context.SaveChangesAsync();

            return Ok(new { message = "Registration successful." });
        }

        [HttpPost("get_nick_discriminator")]
        public async Task<IActionResult> GetNickDiscriminator([FromForm] NickDiscriminatorRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var existingDiscriminators = await _context.Users
                .Where(u => u.Nickname.ToLower() == request.Nick.ToLower())
                .Select(u => u.Discriminator)
                .ToListAsync();

            if (existingDiscriminators.Count >= 9999)
                return BadRequest(new { error = "Too many users have taken all possible discriminator combinations." });

            return Ok(new { result = SelectDiscriminator(existingDiscriminators) });
        }

        private async Task<string?> GetOrCreateDiscriminator(string nickname)
        {
            var existingDiscriminators = await _context.Users
                .Where(u => u.Nickname.ToLower() == nickname.ToLower())
                .Select(u => u.Discriminator)
                .ToListAsync();

            return existingDiscriminators.Count < 9999 
                ? SelectDiscriminator(existingDiscriminators) 
                : null;
        }

        private string SelectDiscriminator(IEnumerable<string> existing)
        {
            var set = new HashSet<string>(existing);
            var random = new Random();
            return Enumerable.Range(0, 10000)
                .Select(_ => random.Next(0, 10000).ToString("D4"))
                .FirstOrDefault(d => !set.Contains(d)) ?? throw new InvalidOperationException();
        }
    }
}
public class NickDiscriminatorRequest
{
    [Required(ErrorMessage = "Nickname is required.")]
    [StringLength(32, MinimumLength = 1, ErrorMessage = "Nickname must be between 1 and 32 characters.")]
    public required string Nick { get; set; }
}


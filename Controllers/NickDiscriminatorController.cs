using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using MyPostgresApp.Data;
using MyPostgresApp.Models;
using System.Collections.Generic;
using System.Linq;

namespace MyPostgresApp.Controllers
{
    [Route("api")]
    [ApiController]
    public class NickDiscriminatorController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMemoryCache _cache;

        public NickDiscriminatorController(AppDbContext context, IMemoryCache cache)
        {
            _context = context;
            _cache = cache;
        }

        [HttpPost("get_nick_discriminator")]
        public IActionResult IsNickUnique([FromForm] string nick)
        {
            if (string.IsNullOrWhiteSpace(nick))
                return BadRequest(new { error = "Invalid parameters" });

            bool isUnique = !_context.Users.Any(u => u.Nickname == nick);
            _cache.TryGetValue("random_discriminators", out Dictionary<string, string> randomDiscriminators);
            if (randomDiscriminators == null)
            {
                randomDiscriminators = new Dictionary<string, string>();
                _cache.Set("random_discriminators", randomDiscriminators);
            }

            if (!randomDiscriminators.ContainsKey(nick))
            {
                randomDiscriminators[nick] = CreateDiscriminator(nick);
                _cache.Set("random_discriminators", randomDiscriminators);
            }

            string result = isUnique ? "#0000" : $"#{randomDiscriminators[nick]}";

            return Ok(new { result, nick });
        }

        private string CreateDiscriminator(string nick)
        {
            // Here you can implement your logic to create a discriminator
            // For demonstration, returning a simple hash code as a string
            return (nick.GetHashCode() % 10000).ToString("D4"); // Ensures 4-digit format
        }
    }
}

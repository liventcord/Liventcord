using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using LiventCord.Data;

namespace LiventCord.Controllers
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
            _cache.TryGetValue("random_discriminators", out Dictionary<string, string>? randomDiscriminators);
            randomDiscriminators ??= new Dictionary<string, string>();

      
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
            return (nick.GetHashCode() % 10000).ToString("D4");
        }
    }
}

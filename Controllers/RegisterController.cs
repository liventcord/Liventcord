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
                return BadRequest(new { message = "Kullanıcı adı geçersiz, 1 ile 32 karakter arasında olmalıdır" });
            
            if (string.IsNullOrEmpty(password) || password.Length > 128)
                return BadRequest(new { message = "Şifre geçersiz, 1 ile 128 karakter arasında olmalıdır" });
            
            if (string.IsNullOrEmpty(email) || email.Length > 240)
                return BadRequest(new { message = "E-posta geçersiz, 1 ile 240 karakter arasında olmalıdır" });

            if (!ValidationHelper.ValidateRegistrationParameters(email, password, nickname))
                return BadRequest(new { error = "Invalid parameters" });

            if (!ValidationHelper.ValidateEmail(email))
                return BadRequest(new { error = "Invalid email" });

            var existing_user = await _context.Users.SingleOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
            if (existing_user != null)
                return Conflict(new { error = "Email already exists" });

            try
            {
                _cache.TryGetValue("random_discriminators", out Dictionary<string, string> randomDiscriminators);
                if (randomDiscriminators == null)
                {
                    randomDiscriminators = new Dictionary<string, string>();
                    _cache.Set("random_discriminators", randomDiscriminators);
                }

                var discriminator = randomDiscriminators.ContainsKey(nickname) ? randomDiscriminators[nickname] : "0000";
                string user_id = Utils.CreateRandomId();
                DateTime currentDate = DateTime.Now;

                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

                var newUser = new User
                {
                    UserId = user_id,
                    Email = email,
                    Password = hashedPassword,
                    Nickname = nickname,
                    Discriminator = discriminator,
                    Bot = 0,
                    Status = "offline"
                };
                
                await _context.Users.AddAsync(newUser);
                await _context.SaveChangesAsync();

                if (randomDiscriminators.ContainsKey(nickname))
                {
                    randomDiscriminators.Remove(nickname);
                    _cache.Set("random_discriminators", randomDiscriminators);
                }

                return Ok(new { message = "Registration successful" });
            }
            catch (Exception ex)
            {
                var errorDetails = ex.InnerException != null ? 
                ex.InnerException.Message : 
                ex.Message;

                return StatusCode(500, new { error = "An unexpected error occurred", details = errorDetails });
            }
        }
    }
}

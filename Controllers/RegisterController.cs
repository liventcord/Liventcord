using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using MyPostgresApp.Data;
using MyPostgresApp.Models;
using MyPostgresApp.Helpers; 
using Microsoft.EntityFrameworkCore;


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
            
            if (string.IsNullOrEmpty(password) || password.Length > 20)
                return BadRequest(new { message = "Şifre geçersiz, 1 ile 20 karakter arasında olmalıdır" });
            
            if (string.IsNullOrEmpty(email) || email.Length > 240)
                return BadRequest(new { message = "E-posta geçersiz, 1 ile 240 karakter arasında olmalıdır" });

           if (!ValidationHelper.ValidateRegistrationParameters(email, password, nickname))
                return BadRequest(new { error = "Invalid parameters" });

            if (!ValidationHelper.ValidateEmail(email))
                return BadRequest(new { error = "Invalid email" });

            var existing_user = await _context.Users.SingleOrDefaultAsync(u => u.email == email);
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

                var discriminator = randomDiscriminators.ContainsKey(nickname) ? randomDiscriminators[nickname] : null;
                string user_id = Utils.CreateRandomId();
                var newUser = new User
                {
                    user_id = user_id,
                    email = email,
                    password = password,
                    nickname = nickname
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
            catch (DbUpdateException)
            {
                return Conflict(new { error = "Email already exists" });
            }
        }
    }
}

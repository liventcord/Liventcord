using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using MyPostgresApp.Data;
using MyPostgresApp.Models;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace MyPostgresApp.Controllers
{
    [Route("auth")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LoginController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> LoginAuth([FromForm] string email, [FromForm] string password)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
                return Unauthorized(new { message = "Authentication failed!" });

            if (IsEmailInvalid(email))
                return BadRequest(new { message = "E posta geçersiz" });

            if (IsPasswordInvalid(password))
                return BadRequest(new { message = "Şifre geçersiz" });

            var user = await AuthenticateUser(email, password);
            if (user != null)
            {
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Email, email),
                    new Claim(ClaimTypes.NameIdentifier, user.user_id.ToString())
                };

                var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                var authProperties = new AuthenticationProperties
                {
                    IsPersistent = true // This will create a persistent cookie
                };

                await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity), authProperties);

                return Ok(new { message = "Login successful!" });
            }
            return Unauthorized(new { message = "Authentication failed!" });
        }

        private bool IsEmailInvalid(string email) => 
            email.Length < 5 || email.Length > 128;

        private bool IsPasswordInvalid(string password) => 
            password.Length < 5 || password.Length > 128;

        private async Task<User> AuthenticateUser(string email, string password)
        {
            return await _context.Users.SingleOrDefaultAsync(u => u.email == email && u.password == password);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new { message = "Logout successful!" });
        }
    }
}

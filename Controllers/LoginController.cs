using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using MyPostgresApp.Data;
using MyPostgresApp.Models;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Configuration;

namespace MyPostgresApp.Controllers
{
    [Route("auth")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly string _secretKey;

        public LoginController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _secretKey = configuration["AppSettings:SecretKey"]; // Get the secret key from configuration
        }

        [HttpPost("login")]
        public async Task<IActionResult> LoginAuth([FromForm] string email, [FromForm] string password)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
                return Unauthorized(new { message = "Authentication failed!" });

            if (IsEmailInvalid(email))
                return BadRequest(new { message = "Email is invalid." });

            if (IsPasswordInvalid(password))
                return BadRequest(new { message = "Password is invalid." });

            var user = await AuthenticateUser(email, password);
            if (user != null)
            {
                var claims = new List<Claim>
                {
                    new(ClaimTypes.Email, email),
                    new(ClaimTypes.NameIdentifier, user.UserId.ToString())
                };

                var token = GenerateToken(claims);

                var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                var authProperties = new AuthenticationProperties
                {
                    IsPersistent = true
                };

                await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity), authProperties);

                return Ok(new { message = "Login successful!", token });
            }

            return Unauthorized(new { message = "Authentication failed!" });
        }

        private static bool IsEmailInvalid(string email) =>
            email.Length < 5 || email.Length > 128;

        private static bool IsPasswordInvalid(string password) =>
            password.Length < 5 || password.Length > 128;

        private async Task<User> AuthenticateUser(string email, string password)
        {
            return await _context.Users.SingleOrDefaultAsync(u => u.Email == email && u.Password == password);
        }

        private string GenerateToken(IEnumerable<Claim> claims)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_secretKey);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new { message = "Logout successful!" });
        }
    }
}

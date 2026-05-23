// AuthController.cs — versión completa actualizada
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using anDora.Api.Data;
using anDora.Api.Models;
using anDora.Api.Services;
using MongoDB.Driver;
using BCrypt.Net;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using OtpNet;

namespace anDora.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly MongoContext _context;
        private readonly IConfiguration _config;
        private readonly EmailService _emailService;

        public AuthController(MongoContext context, IConfiguration config, EmailService emailService)
        {
            _context = context;
            _config = config;
            _emailService = emailService;
        }

        // ===============================
        // 🔹 REGISTER
        // ===============================
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var existingUser = await _context.Users
                .Find(u => u.Username == request.Username)
                .FirstOrDefaultAsync();

            if (existingUser != null)
                return Conflict(new { message = "Username already exists" });

            // Generar token de verificación
            var token = Convert.ToHexString(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32));

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Roles = new List<string> { "User" },
                IsActive = false,                                          // ← bloqueado hasta verificar
                EmailVerificationToken = token,
                EmailVerificationExpires = DateTime.UtcNow.AddHours(24)   // ← expira en 24h
            };

            await _context.Users.InsertOneAsync(user);

            // Enviar email
            await _emailService.SendVerificationEmailAsync(user.Email, user.Username, token);

            return Ok(new { message = "Revisa tu correo para activar tu cuenta." });
        }

        // ===============================
        // 🔹 VERIFY EMAIL
        // ===============================
        // AuthController.cs — endpoint VerifyEmail
        [HttpGet("verify")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string token)
        {
            var appUrl = _config["EmailSettings:AppUrl"];

            var user = await _context.Users
                .Find(u => u.EmailVerificationToken == token)
                .FirstOrDefaultAsync();

            if (user == null)
                return Redirect($"{appUrl}/verify?status=invalid");

            if (user.EmailVerificationExpires < DateTime.UtcNow)
                return Redirect($"{appUrl}/verify?status=expired");

            var update = Builders<User>.Update
                .Set(u => u.IsActive, true)
                .Unset(u => u.EmailVerificationToken)
                .Unset(u => u.EmailVerificationExpires);

            await _context.Users.UpdateOneAsync(u => u.Id == user.Id, update);

            return Redirect($"{appUrl}/verify?status=success");
        }   
       
        // ===============================
        // 🔹 USER EXISTS
        // ===============================
        [HttpGet("exists/{username}")]
        public async Task<IActionResult> UserExists(string username)
        {
            var exists = await _context.Users
                .Find(u => u.Username == username)
                .AnyAsync();

            return Ok(new { exists });
        }

        // ===============================
        // 🔹 LOGIN
        // ===============================
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users
                .Find(u => u.Username == request.Username)
                .FirstOrDefaultAsync();

            if (user == null)
                return Unauthorized(new { message = "Invalid credentials" });

            var isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            if (!isPasswordValid)
                return Unauthorized(new { message = "Invalid credentials" });

            if (!user.IsActive)
                return StatusCode(403, new
                {
                    message = "Debes activar tu cuenta. Revisa tu correo.",
                    code = "EMAIL_NOT_VERIFIED"
                });

            // If 2FA is enabled, return a flag — no JWT yet
            if (user.TwoFactorEnabled)
                return Ok(new
                {
                    requiresTwoFactor = true,
                    username = user.Username
                });

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                message = "Login successful",
                token,
                username = user.Username,
                roles = user.Roles
            });
        }

        // ===============================
        // 🔹 VERIFY 2FA CODE
        // ===============================
        [HttpPost("2fa/verify")]
        public async Task<IActionResult> VerifyTwoFactor([FromBody] TwoFactorLoginRequest request)
        {
            var user = await _context.Users
                .Find(u => u.Username == request.Username)
                .FirstOrDefaultAsync();

            if (user == null || !user.TwoFactorEnabled || string.IsNullOrEmpty(user.TwoFactorSecret))
                return Unauthorized(new { message = "Invalid request" });

            var totp = new Totp(Base32Encoding.ToBytes(user.TwoFactorSecret));
            if (!totp.VerifyTotp(request.Code, out _, VerificationWindow.RfcSpecifiedNetworkDelay))
                return Unauthorized(new { message = "Invalid or expired code" });

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                message = "Login successful",
                token,
                username = user.Username,
                roles = user.Roles
            });
        }

        // ===============================
        // 🔹 VERIFY CURRENT USER
        // ===============================
        [Authorize]
        [HttpGet("me")]
        public IActionResult Me()
        {
            return Ok(new
            {
                username = User.Identity?.Name,
                authenticated = true
            });
        }

        // ===============================
        // 🔹 GENERATE JWT TOKEN
        // ===============================
        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _config.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim> { new Claim(ClaimTypes.Name, user.Username) };
            foreach (var role in user.Roles)
                claims.Add(new Claim(ClaimTypes.Role, role));

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(int.Parse(jwtSettings["ExpiryMinutes"])),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class TwoFactorLoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
    }
}
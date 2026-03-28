// ProfileController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using anDora.Api.Data;
using anDora.Api.Models;
using MongoDB.Driver;
using BCrypt.Net;

namespace anDora.Api.Controllers
{
    [ApiController]
    [Route("api/profile")]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly MongoContext _context;

        public ProfileController(MongoContext context)
        {
            _context = context;
        }

        // ===============================
        // GET /api/profile
        // ===============================
        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var username = User.Identity?.Name;
            var user = await _context.Users
                .Find(u => u.Username == username)
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(new
            {
                username = user.Username,
                email = user.Email,
                roles = user.Roles,
                createdAt = user.CreatedAt,
                profilePhoto = user.ProfilePhoto
            });
        }

        // ===============================
        // PUT /api/profile/password
        // ===============================
        [HttpPut("password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var username = User.Identity?.Name;
            var user = await _context.Users
                .Find(u => u.Username == username)
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound(new { message = "User not found" });

            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                return BadRequest(new { message = "La contraseña actual es incorrecta" });

            var newHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            var update = Builders<User>.Update.Set(u => u.PasswordHash, newHash);
            await _context.Users.UpdateOneAsync(u => u.Id == user.Id, update);

            return Ok(new { message = "Contraseña actualizada correctamente" });
        }

        // ===============================
        // PUT /api/profile/email
        // ===============================
        [HttpPut("email")]
        public async Task<IActionResult> ChangeEmail([FromBody] ChangeEmailRequest request)
        {
            var username = User.Identity?.Name;
            var user = await _context.Users
                .Find(u => u.Username == username)
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound(new { message = "User not found" });

            var emailInUse = await _context.Users
                .Find(u => u.Email == request.NewEmail && u.Id != user.Id)
                .AnyAsync();

            if (emailInUse)
                return Conflict(new { message = "Este correo ya está en uso" });

            var update = Builders<User>.Update.Set(u => u.Email, request.NewEmail);
            await _context.Users.UpdateOneAsync(u => u.Id == user.Id, update);

            return Ok(new { message = "Correo actualizado correctamente" });
        }

        // ===============================
        // PUT /api/profile/photo
        // ===============================
        [HttpPut("photo")]
        public async Task<IActionResult> UpdatePhoto([FromBody] UpdatePhotoRequest request)
        {
            if (string.IsNullOrEmpty(request.PhotoBase64))
                return BadRequest(new { message = "No se recibió ninguna imagen" });

            var username = User.Identity?.Name;
            var user = await _context.Users
                .Find(u => u.Username == username)
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound(new { message = "User not found" });

            var update = Builders<User>.Update.Set(u => u.ProfilePhoto, request.PhotoBase64);
            await _context.Users.UpdateOneAsync(u => u.Id == user.Id, update);

            return Ok(new { message = "Foto actualizada correctamente", profilePhoto = request.PhotoBase64 });
        }
    }

    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class ChangeEmailRequest
    {
        public string NewEmail { get; set; } = string.Empty;
    }

    public class UpdatePhotoRequest
    {
        public string PhotoBase64 { get; set; } = string.Empty;
    }
}

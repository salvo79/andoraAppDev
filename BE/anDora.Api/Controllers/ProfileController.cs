// ProfileController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using anDora.Api.Data;
using anDora.Api.Models;
using anDora.Api.Services;
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
        private readonly GcsService _gcs;

        public ProfileController(MongoContext context, GcsService gcs)
        {
            _context = context;
            _gcs = gcs;
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
                return BadRequest(new { message = "Current password is incorrect" });

            var newHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            var update = Builders<User>.Update.Set(u => u.PasswordHash, newHash);
            await _context.Users.UpdateOneAsync(u => u.Id == user.Id, update);

            return Ok(new { message = "Password updated successfully" });
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
                return Conflict(new { message = "This email is already in use" });

            var update = Builders<User>.Update.Set(u => u.Email, request.NewEmail);
            await _context.Users.UpdateOneAsync(u => u.Id == user.Id, update);

            return Ok(new { message = "Email updated successfully" });
        }

        // ===============================
        // PUT /api/profile/photo
        // ===============================
        [HttpPut("photo")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdatePhoto(IFormFile photo)
        {
            if (photo == null || photo.Length == 0)
                return BadRequest(new { message = "No image received" });

            if (photo.Length > 2 * 1024 * 1024)
                return BadRequest(new { message = "Image must not exceed 2MB" });

            var username = User.Identity?.Name;
            var user = await _context.Users
                .Find(u => u.Username == username)
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound(new { message = "User not found" });

            // Delete old photo from GCS if it exists
            if (!string.IsNullOrEmpty(user.ProfilePhoto))
                await _gcs.DeleteObjectAsync(user.ProfilePhoto);

            // Upload new photo to GCS
            using var stream = photo.OpenReadStream();
            var photoUrl = await _gcs.UploadProfilePhotoAsync(username!, stream, photo.ContentType);

            // Save URL in MongoDB
            var update = Builders<User>.Update.Set(u => u.ProfilePhoto, photoUrl);
            await _context.Users.UpdateOneAsync(u => u.Id == user.Id, update);

            return Ok(new { message = "Profile photo updated", profilePhoto = photoUrl });
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
}

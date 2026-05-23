// ProfileController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using anDora.Api.Data;
using anDora.Api.Models;
using anDora.Api.Services;
using MongoDB.Driver;
using BCrypt.Net;
using OtpNet;

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
                profilePhoto = user.ProfilePhoto,
                twoFactorEnabled = user.TwoFactorEnabled
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

            if (!string.IsNullOrEmpty(user.ProfilePhoto))
                await _gcs.DeleteObjectAsync(user.ProfilePhoto);

            using var stream = photo.OpenReadStream();
            var photoUrl = await _gcs.UploadProfilePhotoAsync(username!, stream, photo.ContentType);

            var update = Builders<User>.Update.Set(u => u.ProfilePhoto, photoUrl);
            await _context.Users.UpdateOneAsync(u => u.Id == user.Id, update);

            return Ok(new { message = "Profile photo updated", profilePhoto = photoUrl });
        }

        // ===============================
        // POST /api/profile/2fa/setup
        // Genera un nuevo secret y devuelve el URI para el QR
        // ===============================
        [HttpPost("2fa/setup")]
        public async Task<IActionResult> Setup2FA()
        {
            var username = User.Identity?.Name;
            var user = await _context.Users
                .Find(u => u.Username == username)
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound(new { message = "User not found" });

            var secretBytes = KeyGeneration.GenerateRandomKey(20);
            var secret = Base32Encoding.ToString(secretBytes);

            var update = Builders<User>.Update.Set(u => u.TwoFactorSecret, secret);
            await _context.Users.UpdateOneAsync(u => u.Id == user.Id, update);

            var uri = $"otpauth://totp/anDora:{username}?secret={secret}&issuer=anDora&algorithm=SHA1&digits=6&period=30";

            return Ok(new { secret, uri });
        }

        // ===============================
        // POST /api/profile/2fa/enable
        // Verifica el primer código y activa 2FA
        // ===============================
        [HttpPost("2fa/enable")]
        public async Task<IActionResult> Enable2FA([FromBody] TwoFactorCodeRequest request)
        {
            var username = User.Identity?.Name;
            var user = await _context.Users
                .Find(u => u.Username == username)
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound(new { message = "User not found" });

            if (string.IsNullOrEmpty(user.TwoFactorSecret))
                return BadRequest(new { message = "Run /2fa/setup first" });

            var totp = new Totp(Base32Encoding.ToBytes(user.TwoFactorSecret));
            if (!totp.VerifyTotp(request.Code, out _, VerificationWindow.RfcSpecifiedNetworkDelay))
                return BadRequest(new { message = "Invalid code. Try again." });

            var update = Builders<User>.Update.Set(u => u.TwoFactorEnabled, true);
            await _context.Users.UpdateOneAsync(u => u.Id == user.Id, update);

            return Ok(new { message = "2FA enabled successfully" });
        }

        // ===============================
        // DELETE /api/profile/2fa
        // Desactiva 2FA (requiere código actual)
        // ===============================
        [HttpDelete("2fa")]
        public async Task<IActionResult> Disable2FA([FromBody] TwoFactorCodeRequest request)
        {
            var username = User.Identity?.Name;
            var user = await _context.Users
                .Find(u => u.Username == username)
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound(new { message = "User not found" });

            if (!user.TwoFactorEnabled)
                return BadRequest(new { message = "2FA is not enabled" });

            var totp = new Totp(Base32Encoding.ToBytes(user.TwoFactorSecret!));
            if (!totp.VerifyTotp(request.Code, out _, VerificationWindow.RfcSpecifiedNetworkDelay))
                return BadRequest(new { message = "Invalid code" });

            var update = Builders<User>.Update
                .Set(u => u.TwoFactorEnabled, false)
                .Unset(u => u.TwoFactorSecret);
            await _context.Users.UpdateOneAsync(u => u.Id == user.Id, update);

            return Ok(new { message = "2FA disabled" });
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

    public class TwoFactorCodeRequest
    {
        public string Code { get; set; } = string.Empty;
    }
}

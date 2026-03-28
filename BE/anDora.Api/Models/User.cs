//User.cs
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
namespace anDora.Api.Models
{
    [BsonIgnoreExtraElements]
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("username")]
        public string Username { get; set; }

        [BsonElement("email")]
        public string Email { get; set; }

        [BsonElement("passwordHash")]
        public string PasswordHash { get; set; }

        [BsonElement("isActive")]
        public bool IsActive { get; set; } = false;

        [BsonElement("roles")]
        public List<string> Roles { get; set; } = new();

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("failedAttempts")]
        public int FailedAttempts { get; set; } = 0;

        [BsonElement("lockUntil")]
        public DateTime? LockUntil { get; set; }

        // 🔹 FALTABAN ESTOS
        [BsonElement("lastLogin")]
        public DateTime? LastLogin { get; set; }

        [BsonElement("lastIp")]
        public string? LastIp { get; set; }

        // User.cs — agrega al final de la clase
        [BsonElement("tenantSlug")]
        public string? TenantSlug { get; set; }

        // User.cs - agrega al final de la clase, antes del último }
        [BsonElement("emailVerificationToken")]
        public string? EmailVerificationToken { get; set; }

        [BsonElement("emailVerificationExpires")]
        public DateTime? EmailVerificationExpires { get; set; }

        [BsonElement("profilePhoto")]
        public string? ProfilePhoto { get; set; }
    }
}
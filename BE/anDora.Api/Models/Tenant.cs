// Models/Tenant.cs
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace anDora.Api.Models
{
    public class Tenant
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        [BsonElement("slug")]
        public string Slug { get; set; } = string.Empty;

        [BsonElement("name")]
        public string Name { get; set; } = string.Empty;

        [BsonElement("allowedDomains")]
        public List<string> AllowedDomains { get; set; } = new();

        [BsonElement("maxUsers")]
        public int? MaxUsers { get; set; }

        [BsonElement("emailProvider")]
        public TenantEmailConfig? EmailProvider { get; set; }
    }

    public class TenantEmailConfig
    {
        [BsonElement("smtpHost")]
        public string SmtpHost { get; set; } = string.Empty;

        [BsonElement("smtpPort")]
        public int SmtpPort { get; set; } = 587;

        [BsonElement("smtpUser")]
        public string SmtpUser { get; set; } = string.Empty;

        [BsonElement("smtpPass")]
        public string SmtpPass { get; set; } = string.Empty;

        [BsonElement("fromEmail")]
        public string FromEmail { get; set; } = string.Empty;

        [BsonElement("fromName")]
        public string FromName { get; set; } = "AnDora";

        [BsonElement("enableSsl")]
        public bool EnableSsl { get; set; } = true;
    }
}
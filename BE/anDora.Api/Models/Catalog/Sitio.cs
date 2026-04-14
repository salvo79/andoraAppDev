using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace anDora.Api.Models.Catalog
{
    public class Sitio
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string Clave { get; set; } = "";
        public string Nombre { get; set; } = "";
        public string? Descripcion { get; set; }
        public string? Ubicacion { get; set; }
        public string? Estado { get; set; }       // Jalisco, Veracruz, etc.
        public bool Activo { get; set; } = true;

        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreadoEn { get; set; } = DateTime.UtcNow;
    }
}

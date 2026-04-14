using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace anDora.Api.Models.Catalog
{
    public class Trabajador
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string NumEmpleado { get; set; } = "";
        public string Nombre { get; set; } = "";
        public string Apellido { get; set; } = "";
        public string? Puesto { get; set; }
        public string? Departamento { get; set; }
        public string? PlantaId { get; set; }
        public string? PlantaNombre { get; set; }
        public string? SitioId { get; set; }
        public string? SitioNombre { get; set; }
        public string? Email { get; set; }
        public string? Telefono { get; set; }
        public bool Activo { get; set; } = true;

        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreadoEn { get; set; } = DateTime.UtcNow;
    }
}

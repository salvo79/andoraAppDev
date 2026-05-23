using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace anDora.Api.Models.Catalog
{
    public class Tanque
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string Clave { get; set; } = "";
        public string Nombre { get; set; } = "";
        public string? PlantaId { get; set; }
        public string? PlantaNombre { get; set; }
        public double? CapacidadM3 { get; set; }
        public string? TipoProducto { get; set; }  // Crudo, Intermedio, Final, Residuo
        public string? Material { get; set; }       // Acero, Polietileno, Fibra
        public bool Activo { get; set; } = true;

        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreadoEn { get; set; } = DateTime.UtcNow;
    }
}

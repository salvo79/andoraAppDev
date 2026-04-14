using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace anDora.Api.Models.Catalog
{
    public class Planta
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string Clave { get; set; } = "";
        public string Nombre { get; set; } = "";
        public string? SitioId { get; set; }
        public string? SitioNombre { get; set; }
        public string? Tipo { get; set; }          // Producción, Mezclado, Almacén
        public double? CapacidadTon { get; set; }
        public string? Unidad { get; set; }        // Ton, Kg, Lt
        public bool Activo { get; set; } = true;

        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreadoEn { get; set; } = DateTime.UtcNow;
    }
}

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace anDora.Api.Models.Catalog
{
    public class Ruta
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string Clave { get; set; } = "";
        public string Nombre { get; set; } = "";
        public string? Origen { get; set; }
        public string? Destino { get; set; }
        public double? DistanciaKm { get; set; }
        public string? ProveedorId { get; set; }
        public string? ProveedorNombre { get; set; }
        public string? TipoTransporte { get; set; }  // Pipa, Camión, Ferrocarril, Ducto
        public bool Activo { get; set; } = true;

        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreadoEn { get; set; } = DateTime.UtcNow;
    }
}

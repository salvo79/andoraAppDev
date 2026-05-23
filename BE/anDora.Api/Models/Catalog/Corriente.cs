using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace anDora.Api.Models.Catalog
{
    public class Corriente
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string Clave { get; set; } = "";
        public string Nombre { get; set; } = "";
        public string? TipoCorriente { get; set; }  // Entrada, Intermedia, Salida, Residuo
        public string? Descripcion { get; set; }
        public string? Unidad { get; set; }          // Ton, Kg, Lt, Bbl, Nm3
        public string? ProductoId { get; set; }
        public string? ProductoNombre { get; set; }
        public bool Activo { get; set; } = true;

        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreadoEn { get; set; } = DateTime.UtcNow;
    }
}

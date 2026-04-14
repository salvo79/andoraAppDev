using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace anDora.Api.Models.Catalog
{
    public class PrecioCatalogo
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string Nombre { get; set; } = "";
        public string? Categoria { get; set; }       // Venta, Compra, Referencia
        public string? ProductoId { get; set; }
        public string? ProductoNombre { get; set; }
        public string? Unidad { get; set; }
        public double PrecioNetoMxn { get; set; }
        public double? CostoMxn { get; set; }
        public double? MargenPct { get; set; }

        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime? VigenciaDesde { get; set; }

        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime? VigenciaHasta { get; set; }

        public bool Activo { get; set; } = true;

        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreadoEn { get; set; } = DateTime.UtcNow;
    }
}

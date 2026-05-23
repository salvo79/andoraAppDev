using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace anDora.Api.Models.Operations
{
    [BsonIgnoreExtraElements]
    public class ResumenPreciosReales
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = default!;

        [BsonElement("fecha")]
        public DateTime Fecha { get; set; }

        [BsonElement("anio")]
        public int Anio { get; set; }

        [BsonElement("mes")]
        public int Mes { get; set; }

        [BsonElement("nombre")]
        public string Nombre { get; set; } = default!;

        [BsonElement("categoria")]
        public string Categoria { get; set; } = default!;

        [BsonElement("precio_neto_mxn")]
        public double PrecioNetoMxn { get; set; }

        [BsonElement("costo_mxn")]
        public double CostoMxn { get; set; }

        [BsonElement("margen_pct")]
        public double MargenPct { get; set; }

        [BsonElement("indice_base100")]
        public double IndiceBase100 { get; set; }
    }
}

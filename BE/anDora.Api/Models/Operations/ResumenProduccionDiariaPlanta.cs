using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace anDora.Api.Models.Operations
{
    [BsonIgnoreExtraElements]
    public class ResumenProduccionDiariaPlanta
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = default!;

        [BsonElement("fecha_dia")]
        public DateTime FechaDia { get; set; }

        [BsonElement("anio")]
        public int Anio { get; set; }

        [BsonElement("mes")]
        public int Mes { get; set; }

        [BsonElement("planta_id")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string PlantaId { get; set; } = default!;

        [BsonElement("planta_clave")]
        public string PlantaClave { get; set; } = default!;

        [BsonElement("planta_nombre")]
        public string PlantaNombre { get; set; } = default!;

        [BsonElement("es_producto_final")]
        public bool EsProductoFinal { get; set; }

        [BsonElement("cantidad")]
        public double Cantidad { get; set; }

        [BsonElement("unidad")]
        public string Unidad { get; set; } = default!;

        [BsonElement("costo_total_mxn")]
        public double CostoTotalMxn { get; set; }

        [BsonElement("cantidad_merma")]
        public double CantidadMerma { get; set; }

        [BsonElement("merma_pct")]
        public double MermaPct { get; set; }

        [BsonElement("calidad_aprobado")]
        public bool CalidadAprobado { get; set; }

        [BsonElement("site_id")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string SiteId { get; set; } = default!;
    }
}

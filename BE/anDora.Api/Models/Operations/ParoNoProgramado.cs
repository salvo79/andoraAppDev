using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace anDora.Api.Models.Operations
{
    [BsonIgnoreExtraElements]
    public class ParoNoProgramado
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

        [BsonElement("planta_id")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string PlantaId { get; set; } = default!;

        [BsonElement("planta_clave")]
        public string PlantaClave { get; set; } = default!;

        [BsonElement("planta_nombre")]
        public string PlantaNombre { get; set; } = default!;

        [BsonElement("causa")]
        public string Causa { get; set; } = default!;

        [BsonElement("duracion_horas")]
        public double DuracionHoras { get; set; }

        [BsonElement("impacto_produccion_pct")]
        public double ImpactoProduccionPct { get; set; }

        [BsonElement("produccion_perdida_kg")]
        public double ProduccionPerdidaKg { get; set; }

        [BsonElement("costo_paro_mxn")]
        public double CostoParoMxn { get; set; }

        [BsonElement("paro_resuelto")]
        public bool ParoResuelto { get; set; }
    }
}

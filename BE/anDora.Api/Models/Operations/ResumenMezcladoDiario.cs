using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace anDora.Api.Models.Operations
{
    [BsonIgnoreExtraElements]
    public class ResumenMezcladoDiario
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = default!;

        [BsonElement("fecha_dia")]
        public DateTime FechaDia { get; set; }

        [BsonElement("planta_id")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string PlantaId { get; set; } = default!;

        [BsonElement("planta_clave")]
        public string PlantaClave { get; set; } = default!;

        [BsonElement("tipo_corriente")]
        public string TipoCorriente { get; set; } = default!;

        [BsonElement("cantidad_kg")]
        public double CantidadKg { get; set; }

        [BsonElement("calidad_ok")]
        public bool CalidadOk { get; set; }
    }
}

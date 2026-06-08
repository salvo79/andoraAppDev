using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace anDora.Api.Models.Catalog
{
    [BsonIgnoreExtraElements]
    public class Tanque
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("clave")]
        public string Clave { get; set; } = "";

        [BsonElement("nombre")]
        public string Nombre { get; set; } = "";

        [BsonElement("planta_id")]
        public string? PlantaId { get; set; }

        [BsonElement("planta_nombre")]
        public string? PlantaNombre { get; set; }

        [BsonElement("planta_clave")]
        public string? PlantaClave { get; set; }

        [BsonElement("tipo_tanque")]
        public string? TipoProducto { get; set; }

        [BsonElement("estatus")]
        public string? Estatus { get; set; }

        public double? CapacidadM3 { get; set; }
        public string? Material { get; set; }
    }
}

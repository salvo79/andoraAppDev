using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace anDora.Api.Models.Catalog
{
    [BsonIgnoreExtraElements]
    public class Planta
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("clave")]
        public string Clave { get; set; } = "";

        [BsonElement("nombre")]
        public string Nombre { get; set; } = "";

        [BsonElement("tipo_equipo")]
        public string? Tipo { get; set; }

        [BsonElement("site_id")]
        public string? SitioId { get; set; }

        [BsonElement("site_nombre")]
        public string? SitioNombre { get; set; }

        [BsonElement("grupo_nombre")]
        public string? GrupoNombre { get; set; }

        [BsonElement("estatus")]
        public string? Estatus { get; set; }

        public double? CapacidadTon { get; set; }
        public string? Unidad { get; set; }
    }
}

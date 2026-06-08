using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace anDora.Api.Models.Catalog
{
    [BsonIgnoreExtraElements]
    public class Sitio
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("codigo")]
        public string Clave { get; set; } = "";

        [BsonElement("nombre")]
        public string Nombre { get; set; } = "";

        [BsonElement("nombre_corto")]
        public string? NombreCorto { get; set; }

        [BsonElement("tipo_site")]
        public string? TipoSite { get; set; }

        [BsonElement("estado_nombre")]
        public string? Estado { get; set; }

        [BsonElement("pais_iso2")]
        public string? Pais { get; set; }

        [BsonElement("estatus")]
        public string? Estatus { get; set; }

        public string? Descripcion { get; set; }
        public string? Ubicacion { get; set; }
    }
}

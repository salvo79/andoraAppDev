using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace anDora.Api.Models.Catalog
{
    [BsonIgnoreExtraElements]
    public class Proveedor
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("codigo")]
        public string Clave { get; set; } = "";

        [BsonElement("razon_social")]
        public string Nombre { get; set; } = "";

        [BsonElement("nombre_comercial")]
        public string? NombreComercial { get; set; }

        [BsonElement("tipo_proveedor")]
        public string? TipoServicio { get; set; }

        [BsonElement("rfc")]
        public string? RFC { get; set; }

        [BsonElement("estatus")]
        public string? Estatus { get; set; }

        public string? Contacto { get; set; }
        public string? Email { get; set; }
        public string? Telefono { get; set; }
        public string? Direccion { get; set; }
    }
}

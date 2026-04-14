using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace anDora.Api.Models.Catalog
{
    public class Producto
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string Clave { get; set; } = "";
        public string Nombre { get; set; } = "";
        public string? Categoria { get; set; }       // Petroquímico, Fertilizante, Intermedio, etc.
        public string? Unidad { get; set; }          // Ton, Kg, Lt, Bbl
        public string? Descripcion { get; set; }
        public bool EsProductoFinal { get; set; } = false;
        public bool Activo { get; set; } = true;

        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreadoEn { get; set; } = DateTime.UtcNow;
    }
}

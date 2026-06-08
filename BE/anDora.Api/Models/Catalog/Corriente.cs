using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace anDora.Api.Models.Catalog
{
    [BsonIgnoreExtraElements]
    public class Corriente
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("clave")]
        public string Clave { get; set; } = "";

        [BsonElement("nombre")]
        public string Nombre { get; set; } = "";

        [BsonElement("tipo")]
        public string? TipoCorriente { get; set; }

        [BsonElement("unidad_venta")]
        public string? Unidad { get; set; }

        [BsonElement("es_producto_final")]
        public bool EsProductoFinal { get; set; }

        [BsonElement("precio_lista")]
        public double? PrecioLista { get; set; }

        [BsonElement("costo_produccion")]
        public double? CostoProduccion { get; set; }

        [BsonElement("sku")]
        public string? Sku { get; set; }

        [BsonElement("subfamilia")]
        public string? Subfamilia { get; set; }
    }
}

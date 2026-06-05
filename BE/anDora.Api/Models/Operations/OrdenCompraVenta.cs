using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace anDora.Api.Models.Operations;

[BsonIgnoreExtraElements]
public class OrdenCompraVenta
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = default!;

    [BsonElement("tipo")]
    public string Tipo { get; set; } = default!;  // "compra" | "venta"

    [BsonElement("fecha")]
    public DateTime Fecha { get; set; }

    [BsonElement("proveedor_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? ProveedorId { get; set; }

    [BsonElement("planta_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? PlantaId { get; set; }

    [BsonElement("planta_clave")]
    public string? PlantaClave { get; set; }

    [BsonElement("producto_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? ProductoId { get; set; }

    [BsonElement("producto_codigo")]
    public string ProductoCodigo { get; set; } = string.Empty;

    [BsonElement("producto_nombre")]
    public string ProductoNombre { get; set; } = default!;

    [BsonElement("cantidad")]
    public double Cantidad { get; set; }

    [BsonElement("unidad")]
    public string Unidad { get; set; } = "kg";

    [BsonElement("precio_unitario")]
    public double PrecioUnitario { get; set; }

    [BsonElement("subtotal")]
    public double Subtotal { get; set; }

    [BsonElement("iva_mxn")]
    public double IvaMxn { get; set; }

    [BsonElement("total")]
    public double Total { get; set; }

    [BsonElement("estatus")]
    public string Estatus { get; set; } = default!;  // "recibida" | "pendiente" | "cancelada"
}

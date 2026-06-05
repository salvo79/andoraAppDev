using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace anDora.Api.Models.Operations;

[BsonIgnoreExtraElements]
public class Transaccion
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = default!;

    [BsonElement("tipo")]
    public string Tipo { get; set; } = default!;  // "venta"

    [BsonElement("fecha")]
    public DateTime Fecha { get; set; }

    [BsonElement("anio")]
    public int Anio { get; set; }

    [BsonElement("mes")]
    public int Mes { get; set; }

    [BsonElement("semana")]
    public int Semana { get; set; }

    [BsonElement("cliente_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? ClienteId { get; set; }

    [BsonElement("cliente_codigo")]
    public string ClienteCodigo { get; set; } = string.Empty;

    [BsonElement("cliente_nombre")]
    public string ClienteNombre { get; set; } = default!;

    [BsonElement("punto_entrega")]
    public string? PuntoEntrega { get; set; }

    [BsonElement("producto_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? ProductoId { get; set; }

    [BsonElement("producto_codigo")]
    public string ProductoCodigo { get; set; } = string.Empty;

    [BsonElement("producto_nombre")]
    public string ProductoNombre { get; set; } = default!;

    [BsonElement("unidad")]
    public string Unidad { get; set; } = "ton";

    [BsonElement("cantidad")]
    public double Cantidad { get; set; }

    [BsonElement("precio_lista")]
    public double PrecioLista { get; set; }

    [BsonElement("descuento_pct")]
    public double DescuentoPct { get; set; }

    [BsonElement("descuento_mxn")]
    public double DescuentoMxn { get; set; }

    [BsonElement("precio_neto")]
    public double PrecioNeto { get; set; }

    [BsonElement("subtotal")]
    public double Subtotal { get; set; }

    [BsonElement("iva_mxn")]
    public double IvaMxn { get; set; }

    [BsonElement("total_mxn")]
    public double TotalMxn { get; set; }

    [BsonElement("costo_unitario")]
    public double CostoUnitario { get; set; }

    [BsonElement("costo_total")]
    public double CostoTotal { get; set; }

    [BsonElement("margen_mxn")]
    public double MargenMxn { get; set; }

    [BsonElement("margen_pct")]
    public double MargenPct { get; set; }

    [BsonElement("flete_mxn")]
    public double FleteMxn { get; set; }

    [BsonElement("numero_lote")]
    public string? NumeroLote { get; set; }

    [BsonElement("estatus")]
    public string Estatus { get; set; } = default!;  // "entregada" | "facturada"
}

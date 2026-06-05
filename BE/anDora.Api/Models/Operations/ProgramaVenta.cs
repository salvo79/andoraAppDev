using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace anDora.Api.Models.Operations;

[BsonIgnoreExtraElements]
public class ProgramaVenta
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

    [BsonElement("trimestre")]
    public int Trimestre { get; set; }

    [BsonElement("semana")]
    public int Semana { get; set; }

    [BsonElement("version_forecast")]
    public string VersionForecast { get; set; } = string.Empty;

    [BsonElement("sesgo_forecast_mes")]
    public double SesgoPct { get; set; }

    // Producto
    [BsonElement("producto_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? ProductoId { get; set; }

    [BsonElement("producto_codigo")]
    public string ProductoCodigo { get; set; } = string.Empty;

    [BsonElement("producto_nombre")]
    public string ProductoNombre { get; set; } = string.Empty;

    [BsonElement("unidad")]
    public string Unidad { get; set; } = "kg";

    // Cliente
    [BsonElement("cliente_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? ClienteId { get; set; }

    [BsonElement("cliente_codigo")]
    public string ClienteCodigo { get; set; } = string.Empty;

    [BsonElement("cliente_nombre")]
    public string ClienteNombre { get; set; } = string.Empty;

    // Vendedor
    [BsonElement("vendedor_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? VendedorId { get; set; }

    [BsonElement("vendedor_codigo")]
    public string VendedorCodigo { get; set; } = string.Empty;

    [BsonElement("vendedor_nombre")]
    public string VendedorNombre { get; set; } = string.Empty;

    // Canal
    [BsonElement("canal")]
    public string Canal { get; set; } = string.Empty;  // directo|distribuidor|exportacion|mostrador

    // Plan financiero
    [BsonElement("plan_ventas_kg")]
    public double PlanVentasKg { get; set; }

    [BsonElement("plan_ventas_ton")]
    public double PlanVentasTon { get; set; }

    [BsonElement("precio_lista_mxn_ton")]
    public double PrecioListaMxnTon { get; set; }

    [BsonElement("descuento_pct")]
    public double DescuentoPct { get; set; }

    [BsonElement("plan_subtotal_mxn")]
    public double PlanSubtotalMxn { get; set; }

    [BsonElement("plan_iva_mxn")]
    public double PlanIvaMxn { get; set; }

    [BsonElement("plan_total_mxn")]
    public double PlanTotalMxn { get; set; }

    [BsonElement("plan_costo_mxn")]
    public double PlanCostoMxn { get; set; }

    [BsonElement("plan_margen_mxn")]
    public double PlanMargenMxn { get; set; }

    [BsonElement("plan_margen_pct")]
    public double PlanMargenPct { get; set; }

    [BsonElement("plan_comision_pct")]
    public double PlanComisionPct { get; set; }

    [BsonElement("plan_comision_mxn")]
    public double PlanComisionMxn { get; set; }

    [BsonElement("plan_flete_mxn")]
    public double PlanFleteMxn { get; set; }
}

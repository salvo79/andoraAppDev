using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace anDora.Api.Models.Operations;

[BsonIgnoreExtraElements]
public class ResumenDiarioOrdenes
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = default!;

    [BsonElement("fecha_dia")]
    public DateTime FechaDia { get; set; }

    [BsonElement("anio")]
    public int Anio { get; set; }

    [BsonElement("mes")]
    public int Mes { get; set; }

    [BsonElement("semana")]
    public int Semana { get; set; }

    [BsonElement("ordenes_venta")]
    public int OrdenesVenta { get; set; }

    [BsonElement("ordenes_compra")]
    public int OrdenesCompra { get; set; }

    [BsonElement("ventas_ton")]
    public double VentasTon { get; set; }

    [BsonElement("ingresos_mxn")]
    public double IngresosMxn { get; set; }

    [BsonElement("costo_mp_mxn")]
    public double CostoMpMxn { get; set; }

    [BsonElement("margen_mxn")]
    public double MargenMxn { get; set; }
}

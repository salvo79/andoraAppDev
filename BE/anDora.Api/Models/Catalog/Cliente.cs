using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace anDora.Api.Models.Catalog;

[BsonIgnoreExtraElements]
public class Cliente
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("codigo")]
    public string Codigo { get; set; } = string.Empty;

    [BsonElement("nombre")]
    public string? Nombre { get; set; }

    [BsonElement("razon_social")]
    public string? RazonSocial { get; set; }

    [BsonElement("rfc")]
    public string? Rfc { get; set; }

    [BsonElement("email")]
    public string? Email { get; set; }

    [BsonElement("telefono")]
    public string? Telefono { get; set; }

    [BsonElement("estado")]
    public string? Estado { get; set; }

    [BsonElement("canal")]
    public string? Canal { get; set; }  // directo|distribuidor|exportacion|mostrador

    [BsonElement("activo")]
    public bool Activo { get; set; } = true;
}

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace anDora.Api.Models.Catalog;

[BsonIgnoreExtraElements]
public class Vendedor
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("codigo")]
    public string Codigo { get; set; } = string.Empty;

    [BsonElement("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [BsonElement("nombre_completo")]
    public string? NombreCompleto { get; set; }

    [BsonElement("email")]
    public string? Email { get; set; }

    [BsonElement("telefono")]
    public string? Telefono { get; set; }

    [BsonElement("zona")]
    public string? Zona { get; set; }

    [BsonElement("activo")]
    public bool Activo { get; set; } = true;
}

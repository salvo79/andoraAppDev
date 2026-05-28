using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;

namespace anDora.Api.Models
{
    [BsonIgnoreExtraElements]
    public class HistorianAnalysis
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [BsonElement("ownerUsername")]
        [JsonPropertyName("ownerUsername")]
        public string OwnerUsername { get; set; } = string.Empty;

        [BsonElement("tenantSlug")]
        [JsonPropertyName("tenantSlug")]
        public string TenantSlug { get; set; } = string.Empty;

        [BsonElement("name")]
        [JsonPropertyName("name")]
        public string Name { get; set; } = "Nuevo Análisis";

        [BsonElement("description")]
        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;

        [BsonElement("tags")]
        [JsonPropertyName("tags")]
        public List<HistorianTag> Tags { get; set; } = new();

        [BsonElement("calcVars")]
        [JsonPropertyName("calcVars")]
        public List<HistorianCalcVar> CalcVars { get; set; } = new();

        [BsonElement("range")]
        [JsonPropertyName("range")]
        public string Range { get; set; } = "1d";

        [BsonElement("status")]
        [JsonPropertyName("status")]
        public string Status { get; set; } = "draft"; // "draft" | "published"

        [BsonElement("isShared")]
        [JsonPropertyName("isShared")]
        public bool IsShared { get; set; } = false;

        // Usuarios específicos con acceso (además del propietario y tenant si isShared=true)
        [BsonElement("sharedWith")]
        [JsonPropertyName("sharedWith")]
        public List<string> SharedWith { get; set; } = new();

        [BsonElement("createdAt")]
        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        [JsonPropertyName("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    [BsonIgnoreExtraElements]
    public class HistorianTag
    {
        [BsonElement("key")]
        [JsonPropertyName("key")]
        public string Key { get; set; } = string.Empty;

        [BsonElement("label")]
        [JsonPropertyName("label")]
        public string Label { get; set; } = string.Empty;

        [BsonElement("type")]
        [JsonPropertyName("type")]
        public string Type { get; set; } = "tag";

        [BsonElement("data")]
        [JsonPropertyName("data")]
        public HistorianTagData? Data { get; set; }

        // Presente sólo cuando type == "operacion"
        [BsonElement("operData")]
        [JsonPropertyName("operData")]
        public HistorianOperData? OperData { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class HistorianOperData
    {
        [BsonElement("source")]
        [JsonPropertyName("source")]
        public string Source { get; set; } = string.Empty;   // "produccion" | "precios"

        [BsonElement("planta_id")]
        [JsonPropertyName("planta_id")]
        public string? PlantaId { get; set; }

        [BsonElement("nombre")]
        [JsonPropertyName("nombre")]
        public string? Nombre { get; set; }

        [BsonElement("metrica")]
        [JsonPropertyName("metrica")]
        public string Metrica { get; set; } = string.Empty;  // "cantidad" | "precio_neto_mxn" | etc.

        [BsonElement("unidad")]
        [JsonPropertyName("unidad")]
        public string Unidad { get; set; } = string.Empty;
    }

    [BsonIgnoreExtraElements]
    public class HistorianTagData
    {
        [BsonElement("tag")]
        [JsonPropertyName("tag")]
        public string Tag { get; set; } = string.Empty;

        [BsonElement("desc")]
        [JsonPropertyName("desc")]
        public string Desc { get; set; } = string.Empty;

        [BsonElement("unidad")]
        [JsonPropertyName("unidad")]
        public string Unidad { get; set; } = string.Empty;

        [BsonElement("min")]
        [JsonPropertyName("min")]
        public double Min { get; set; }

        [BsonElement("max")]
        [JsonPropertyName("max")]
        public double Max { get; set; }

        [BsonElement("tipo")]
        [JsonPropertyName("tipo")]
        public string Tipo { get; set; } = string.Empty;

        [BsonElement("alarmaHi")]
        [JsonPropertyName("alarmaHi")]
        public double? AlarmaHi { get; set; }

        [BsonElement("alarmaLo")]
        [JsonPropertyName("alarmaLo")]
        public double? AlarmaLo { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class HistorianCalcVar
    {
        [BsonElement("key")]
        [JsonPropertyName("key")]
        public string Key { get; set; } = string.Empty;

        [BsonElement("label")]
        [JsonPropertyName("label")]
        public string Label { get; set; } = string.Empty;

        [BsonElement("formula")]
        [JsonPropertyName("formula")]
        public string Formula { get; set; } = string.Empty;

        [BsonElement("unit")]
        [JsonPropertyName("unit")]
        public string? Unit { get; set; }
    }

    public class SaveAnalysisRequest
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;

        [JsonPropertyName("status")]
        public string Status { get; set; } = "draft";

        [JsonPropertyName("isShared")]
        public bool IsShared { get; set; }

        [JsonPropertyName("sharedWith")]
        public List<string> SharedWith { get; set; } = new();

        [JsonPropertyName("range")]
        public string Range { get; set; } = "1d";

        [JsonPropertyName("tags")]
        public List<HistorianTag> Tags { get; set; } = new();

        [JsonPropertyName("calcVars")]
        public List<HistorianCalcVar> CalcVars { get; set; } = new();
    }
}

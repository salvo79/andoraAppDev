using System.Text.Json.Serialization;

namespace anDora.Api.Models.Advisor;

public class AdvisorChatRequest
{
    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("history")]
    public List<AdvisorMessageDto> History { get; set; } = new();
}

public class AdvisorChatResponse
{
    [JsonPropertyName("reply")]
    public string Reply { get; set; } = string.Empty;
}

public class AdvisorMessageDto
{
    [JsonPropertyName("role")]
    public string Role { get; set; } = string.Empty;  // "user" | "assistant"

    [JsonPropertyName("content")]
    public string Content { get; set; } = string.Empty;
}

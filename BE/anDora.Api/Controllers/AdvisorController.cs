using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using anDora.Api.Models.Advisor;
using anDora.Api.Services;

namespace anDora.Api.Controllers;

[ApiController]
[Route("api/advisor")]
[Authorize]
public class AdvisorController : ControllerBase
{
    private readonly AdvisorService _advisor;

    public AdvisorController(AdvisorService advisor) => _advisor = advisor;

    /// <summary>POST /api/advisor/chat  — envía un mensaje y recibe la respuesta del agente.</summary>
    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] AdvisorChatRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { error = "El campo 'message' es obligatorio." });

        try
        {
            var reply = await _advisor.ChatAsync(request.Message, request.History ?? []);
            return Ok(new AdvisorChatResponse { Reply = reply });
        }
        catch (Exception ex)
        {
            // Al retornar un resultado controlado, la respuesta pasa por el pipeline normal
            // y el middleware CORS agrega los headers correctamente (en lugar de que Kestrel
            // genere un 500 crudo que descarta los headers CORS).
            return StatusCode(500, new AdvisorChatResponse
            {
                Reply = $"⚠️ Error interno del Advisor: {ex.Message}"
            });
        }
    }
}

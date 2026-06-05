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

        var reply = await _advisor.ChatAsync(request.Message, request.History ?? []);
        return Ok(new AdvisorChatResponse { Reply = reply });
    }
}

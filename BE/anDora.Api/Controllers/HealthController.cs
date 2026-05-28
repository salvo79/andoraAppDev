using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using anDora.Api.Data;
using anDora.Api.Models.Operations;

namespace anDora.Api.Controllers
{
    [ApiController]
    [Route("api/health")]
    [Authorize]
    public class HealthController : ControllerBase
    {
        private readonly OperationsContext _ops;

        public HealthController(OperationsContext ops)
        {
            _ops = ops;
        }

        // GET /api/health/atlas
        // Hace un ping real a MongoDB Atlas con timeout de 5s.
        [HttpGet("atlas")]
        public async Task<IActionResult> CheckAtlas()
        {
            try
            {
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));

                // Consulta mínima: sólo el _id de 1 documento
                await _ops.ResumenProduccion
                    .Find(FilterDefinition<ResumenProduccionDiariaPlanta>.Empty)
                    .Limit(1)
                    .Project(Builders<ResumenProduccionDiariaPlanta>.Projection.Include("_id"))
                    .FirstOrDefaultAsync(cts.Token);

                return Ok(new { status = "connected", ts = DateTime.UtcNow });
            }
            catch (OperationCanceledException)
            {
                return StatusCode(503, new { status = "timeout" });
            }
            catch
            {
                return StatusCode(503, new { status = "error" });
            }
        }
    }
}

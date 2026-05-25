using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using anDora.Api.Data;
using anDora.Api.Models;

namespace anDora.Api.Controllers
{
    [ApiController]
    [Route("api/historian")]
    [Authorize]
    public class HistorianController : ControllerBase
    {
        private readonly MongoContext _ctx;

        public HistorianController(MongoContext ctx) => _ctx = ctx;

        private async Task<User?> CurrentUser()
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username)) return null;
            return await _ctx.Users.Find(u => u.Username == username).FirstOrDefaultAsync();
        }

        // GET /api/historian
        // Devuelve: propios + compartidos con toda la empresa + compartidos específicamente con el usuario
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var user = await CurrentUser();
            if (user == null) return Unauthorized();

            var tenantSlug = user.TenantSlug ?? string.Empty;

            // Filtro 1: propios (todos los estados, incluyendo drafts)
            var ownFilter = Builders<HistorianAnalysis>.Filter.Eq(a => a.OwnerUsername, user.Username);

            // Filtro 2: compartidos con toda la empresa (solo publicados)
            var tenantFilter = !string.IsNullOrEmpty(tenantSlug)
                ? Builders<HistorianAnalysis>.Filter.And(
                    Builders<HistorianAnalysis>.Filter.Eq(a => a.IsShared, true),
                    Builders<HistorianAnalysis>.Filter.Eq(a => a.TenantSlug, tenantSlug),
                    Builders<HistorianAnalysis>.Filter.Eq(a => a.Status, "published"))
                : Builders<HistorianAnalysis>.Filter.Empty;

            // Filtro 3: compartidos específicamente con este usuario (solo publicados)
            var sharedWithFilter = Builders<HistorianAnalysis>.Filter.And(
                Builders<HistorianAnalysis>.Filter.AnyEq(a => a.SharedWith, user.Username),
                Builders<HistorianAnalysis>.Filter.Eq(a => a.Status, "published"));

            var filter = !string.IsNullOrEmpty(tenantSlug)
                ? Builders<HistorianAnalysis>.Filter.Or(ownFilter, tenantFilter, sharedWithFilter)
                : Builders<HistorianAnalysis>.Filter.Or(ownFilter, sharedWithFilter);

            var list = await _ctx.HistorianAnalyses
                .Find(filter)
                .SortByDescending(a => a.UpdatedAt)
                .ToListAsync();

            return Ok(list);
        }

        // POST /api/historian — crear análisis
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SaveAnalysisRequest req)
        {
            var user = await CurrentUser();
            if (user == null) return Unauthorized();

            var analysis = new HistorianAnalysis
            {
                OwnerUsername = user.Username,
                TenantSlug    = user.TenantSlug ?? string.Empty,
                Name          = req.Name,
                Description   = req.Description,
                Status        = req.Status,
                IsShared      = req.IsShared,
                SharedWith    = req.SharedWith,
                Range         = req.Range,
                Tags          = req.Tags,
                CalcVars      = req.CalcVars,
                CreatedAt     = DateTime.UtcNow,
                UpdatedAt     = DateTime.UtcNow,
            };

            await _ctx.HistorianAnalyses.InsertOneAsync(analysis);
            return Ok(analysis);
        }

        // PUT /api/historian/{id} — actualizar contenido y metadatos (solo propietario)
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] SaveAnalysisRequest req)
        {
            var user = await CurrentUser();
            if (user == null) return Unauthorized();

            var exists = await _ctx.HistorianAnalyses
                .Find(a => a.Id == id && a.OwnerUsername == user.Username)
                .AnyAsync();

            if (!exists) return NotFound();

            var update = Builders<HistorianAnalysis>.Update
                .Set(a => a.Name,        req.Name)
                .Set(a => a.Description, req.Description)
                .Set(a => a.Status,      req.Status)
                .Set(a => a.IsShared,    req.IsShared)
                .Set(a => a.SharedWith,  req.SharedWith)
                .Set(a => a.Range,       req.Range)
                .Set(a => a.Tags,        req.Tags)
                .Set(a => a.CalcVars,    req.CalcVars)
                .Set(a => a.UpdatedAt,   DateTime.UtcNow);

            await _ctx.HistorianAnalyses.UpdateOneAsync(a => a.Id == id, update);

            var updated = await _ctx.HistorianAnalyses.Find(a => a.Id == id).FirstAsync();
            return Ok(updated);
        }

        // PATCH /api/historian/{id}/publish — cambiar draft → published
        [HttpPatch("{id}/publish")]
        public async Task<IActionResult> Publish(string id)
        {
            var user = await CurrentUser();
            if (user == null) return Unauthorized();

            var result = await _ctx.HistorianAnalyses.UpdateOneAsync(
                a => a.Id == id && a.OwnerUsername == user.Username,
                Builders<HistorianAnalysis>.Update
                    .Set(a => a.Status,    "published")
                    .Set(a => a.UpdatedAt, DateTime.UtcNow));

            if (result.MatchedCount == 0) return NotFound();
            return Ok(new { status = "published" });
        }

        // DELETE /api/historian/{id} — eliminar (solo propietario)
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var user = await CurrentUser();
            if (user == null) return Unauthorized();

            var result = await _ctx.HistorianAnalyses
                .DeleteOneAsync(a => a.Id == id && a.OwnerUsername == user.Username);

            if (result.DeletedCount == 0) return NotFound();
            return NoContent();
        }
    }
}

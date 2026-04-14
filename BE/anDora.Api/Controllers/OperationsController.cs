// OperationsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using anDora.Api.Data;
using anDora.Api.Models.Operations;

namespace anDora.Api.Controllers
{
    [ApiController]
    [Route("api/operations")]
    [Authorize]
    public class OperationsController : ControllerBase
    {
        private readonly OperationsContext _ops;

        public OperationsController(OperationsContext ops)
        {
            _ops = ops;
        }

        // GET /api/operations/kpis?dias=30
        [HttpGet("kpis")]
        public async Task<IActionResult> GetKpis([FromQuery] int dias = 30)
        {
            // Usamos el rango de fechas disponible en la BD
            var maxFecha = await _ops.ResumenProduccion
                .Find(_ => true)
                .SortByDescending(x => x.FechaDia)
                .Project(x => x.FechaDia)
                .FirstOrDefaultAsync();

            if (maxFecha == default)
                return Ok(new OperationsKpiDto { Kpis = new() });

            var desde = maxFecha.AddDays(-dias + 1).Date;
            var hasta = maxFecha.Date.AddDays(1); // exclusive upper bound

            // ── Periodo anterior (para calcular delta) ────────────────────
            var desdeAnterior = desde.AddDays(-dias);
            var hastaAnterior = desde;

            var kpis = new List<KpiItem>();

            // ── 1. PRODUCCIÓN ─────────────────────────────────────────────
            kpis.Add(await BuildProduccionKpi(desde, hasta, desdeAnterior, hastaAnterior));

            // ── 2. CALIDAD ────────────────────────────────────────────────
            kpis.Add(await BuildCalidadKpi(desde, hasta, desdeAnterior, hastaAnterior));

            // ── 3. PAROS (como proxy de disponibilidad) ───────────────────
            kpis.Add(await BuildParosKpi(desde, hasta, desdeAnterior, hastaAnterior));

            // ── 4-6. Sin datos aún → placeholders ─────────────────────────
            kpis.Add(new KpiItem { Key = "compras",   Label = "Compras del Mes",   Value = "—", Delta = 0, Sub = "Sin datos", HasData = false });
            kpis.Add(new KpiItem { Key = "inventario",Label = "Cobertura Stock",   Value = "—", Delta = 0, Sub = "Sin datos", HasData = false });
            kpis.Add(new KpiItem { Key = "ventas",    Label = "Ventas del Mes",    Value = "—", Delta = 0, Sub = "Sin datos", HasData = false });

            return Ok(new OperationsKpiDto
            {
                Kpis = kpis,
                PeriodoDesde = desde,
                PeriodoHasta = maxFecha
            });
        }

        // ── Producción ────────────────────────────────────────────────────
        private async Task<KpiItem> BuildProduccionKpi(
            DateTime desde, DateTime hasta,
            DateTime desdeAnt, DateTime hastaAnt)
        {
            var filter = Builders<ResumenProduccionDiariaPlanta>.Filter;

            var docs = await _ops.ResumenProduccion
                .Find(filter.Gte(x => x.FechaDia, desde) & filter.Lt(x => x.FechaDia, hasta))
                .ToListAsync();

            var docsAnt = await _ops.ResumenProduccion
                .Find(filter.Gte(x => x.FechaDia, desdeAnt) & filter.Lt(x => x.FechaDia, hastaAnt))
                .ToListAsync();

            var finalDocs = docs.Where(d => d.EsProductoFinal).ToList();
            var totalKg = finalDocs.Sum(d => d.Cantidad);
            var plantasActivas = docs.Select(d => d.PlantaId).Distinct().Count();

            var totalKgAnt = docsAnt.Where(d => d.EsProductoFinal).Sum(d => d.Cantidad);
            var delta = totalKgAnt > 0 ? Math.Round((totalKg - totalKgAnt) / totalKgAnt * 100, 1) : 0;

            return new KpiItem
            {
                Key = "produccion",
                Label = "Producción Total",
                Value = FormatKg(totalKg),
                Delta = delta,
                Sub = $"{plantasActivas} plantas operando",
                HasData = true
            };
        }

        // ── Calidad ───────────────────────────────────────────────────────
        private async Task<KpiItem> BuildCalidadKpi(
            DateTime desde, DateTime hasta,
            DateTime desdeAnt, DateTime hastaAnt)
        {
            var filter = Builders<ResumenMezcladoDiario>.Filter;

            var docs = await _ops.ResumenMezclado
                .Find(filter.Gte(x => x.FechaDia, desde) & filter.Lt(x => x.FechaDia, hasta))
                .ToListAsync();

            var docsAnt = await _ops.ResumenMezclado
                .Find(filter.Gte(x => x.FechaDia, desdeAnt) & filter.Lt(x => x.FechaDia, hastaAnt))
                .ToListAsync();

            double indice = docs.Count > 0
                ? Math.Round(docs.Count(d => d.CalidadOk) * 100.0 / docs.Count, 1)
                : 0;

            double indiceAnt = docsAnt.Count > 0
                ? Math.Round(docsAnt.Count(d => d.CalidadOk) * 100.0 / docsAnt.Count, 1)
                : 0;

            var delta = Math.Round(indice - indiceAnt, 1);
            var noConformidades = docs.Count(d => !d.CalidadOk);

            return new KpiItem
            {
                Key = "calidad",
                Label = "Índice de Calidad",
                Value = $"{indice}%",
                Delta = delta,
                Sub = $"{noConformidades} no conformidades",
                HasData = true
            };
        }

        // ── Paros ─────────────────────────────────────────────────────────
        private async Task<KpiItem> BuildParosKpi(
            DateTime desde, DateTime hasta,
            DateTime desdeAnt, DateTime hastaAnt)
        {
            var filter = Builders<ParoNoProgramado>.Filter;

            var docs = await _ops.ParosNoProgramados
                .Find(filter.Gte(x => x.Fecha, desde) & filter.Lt(x => x.Fecha, hasta))
                .ToListAsync();

            var docsAnt = await _ops.ParosNoProgramados
                .Find(filter.Gte(x => x.Fecha, desdeAnt) & filter.Lt(x => x.Fecha, hastaAnt))
                .ToListAsync();

            // Disponibilidad = 1 - (horas perdidas / horas totales del periodo)
            // Horas totales = días × 24 (suma de todas las plantas)
            var plantas = docs.Select(d => d.PlantaId).Distinct().Count();
            var dias = (hasta - desde).TotalDays;
            var horasTotales = dias * 24 * Math.Max(plantas, 1);
            var horasPerdidas = docs.Sum(d => d.DuracionHoras);
            var disponibilidad = Math.Round((1 - horasPerdidas / horasTotales) * 100, 1);

            var horasPerdidasAnt = docsAnt.Sum(d => d.DuracionHoras);
            var delta = Math.Round(horasPerdidas - horasPerdidasAnt, 1);
            // Delta negativo = mejora (menos horas perdidas)
            var deltaKpi = delta == 0 ? 0 : Math.Round(-delta / Math.Max(horasPerdidasAnt, 1) * 100, 1);

            var costoTotal = docs.Sum(d => d.CostoParoMxn);

            return new KpiItem
            {
                Key = "paros",
                Label = "Disponibilidad",
                Value = $"{disponibilidad}%",
                Delta = deltaKpi,
                Sub = $"{docs.Count} paros · {Math.Round(horasPerdidas, 1)}h perdidas",
                HasData = true
            };
        }

        // GET /api/operations/precios
        [HttpGet("precios")]
        public async Task<IActionResult> GetPrecios()
        {
            var docs = await _ops.ResumenPrecios
                .Find(_ => true)
                .SortBy(x => x.Nombre)
                .ThenBy(x => x.Fecha)
                .ToListAsync();

            var result = docs.Select(d => new
            {
                nombre        = d.Nombre,
                categoria     = d.Categoria,
                anio          = d.Anio,
                mes           = d.Mes,
                fecha         = d.Fecha,
                precioNetoMxn = d.PrecioNetoMxn,
                costoMxn      = d.CostoMxn,
                margenPct     = d.MargenPct,
                indiceBase100 = d.IndiceBase100
            });

            return Ok(result);
        }

        // ── Helpers ───────────────────────────────────────────────────────
        private static string FormatKg(double kg)
        {
            if (kg >= 1_000_000) return $"{kg / 1_000_000:F1}M kg";
            if (kg >= 1_000)     return $"{kg / 1_000:F1}K kg";
            return $"{kg:F0} kg";
        }
    }
}

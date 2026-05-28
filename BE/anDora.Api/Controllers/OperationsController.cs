// OperationsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
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

        // GET /api/operations/process-tree
        [HttpGet("process-tree")]
        public async Task<IActionResult> GetProcessTree()
        {
            // ── 1. PRODUCCIÓN: plantas distintas ──────────────────────────
            var prodPipeline = new[]
            {
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", new BsonDocument
                        {
                            { "planta_id",     "$planta_id"     },
                            { "planta_nombre", "$planta_nombre" },
                            { "planta_clave",  "$planta_clave"  }
                        }
                    },
                    { "unidad", new BsonDocument("$first", "$unidad") }
                }),
                new BsonDocument("$sort", new BsonDocument("_id.planta_nombre", 1))
            };

            var plantasDocs = await _ops.ResumenProduccion
                .Aggregate<BsonDocument>(PipelineDefinition<ResumenProduccionDiariaPlanta, BsonDocument>.Create(prodPipeline))
                .ToListAsync();

            var prodItems = plantasDocs.Select(p =>
            {
                var plantaId     = p["_id"]["planta_id"].AsString;
                var plantaNombre = p["_id"]["planta_nombre"].AsString;
                var unidad       = p.Contains("unidad") && !p["unidad"].IsBsonNull ? p["unidad"].AsString : "ton";
                return new
                {
                    id   = $"prod-{plantaId}",
                    text = plantaNombre,
                    type = "planta",
                    items = new object[]
                    {
                        new { id = $"prod-{plantaId}-cantidad",    text = "Producción Final",  type = "metric", isLeaf = true,
                              operData = new { source = "produccion", planta_id = plantaId, metrica = "cantidad",        unidad } },
                        new { id = $"prod-{plantaId}-merma",       text = "Merma",             type = "metric", isLeaf = true,
                              operData = new { source = "produccion", planta_id = plantaId, metrica = "cantidad_merma",  unidad } },
                        new { id = $"prod-{plantaId}-costo",       text = "Costo Total",       type = "metric", isLeaf = true,
                              operData = new { source = "produccion", planta_id = plantaId, metrica = "costo_total_mxn", unidad = "MXN" } },
                    }
                };
            }).ToList<object>();

            // ── 2. PRECIOS: items distintos por categoria ─────────────────
            var precioPipeline = new[]
            {
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", new BsonDocument
                        {
                            { "nombre",    "$nombre"    },
                            { "categoria", "$categoria" },
                            { "codigo",    "$codigo"    },
                            { "unidad",    "$unidad"    }
                        }
                    }
                }),
                new BsonDocument("$sort", new BsonDocument("_id.categoria", 1).Add("_id.nombre", 1))
            };

            var preciosDocs = await _ops.ResumenPrecios
                .Aggregate<BsonDocument>(PipelineDefinition<ResumenPreciosReales, BsonDocument>.Create(precioPipeline))
                .ToListAsync();

            static string SafeStr(BsonDocument d, string field) =>
                d.Contains(field) && !d[field].IsBsonNull ? d[field].AsString : string.Empty;

            // ── 3. COMPRAS (Materia Prima, Servicio, Corriente Interna) ───
            var comprasCats = new[] { "Materia Prima", "Servicio", "Corriente Interna" };
            var comprasItems = preciosDocs
                .Where(p => comprasCats.Contains(SafeStr(p["_id"].AsBsonDocument, "categoria")))
                .GroupBy(p => SafeStr(p["_id"].AsBsonDocument, "categoria"))
                .OrderBy(g => g.Key)
                .Select(g => new
                {
                    id   = $"compras-{g.Key.ToLower().Replace(" ", "-")}",
                    text = g.Key,
                    type = "categoria",
                    items = g.Select(item =>
                    {
                        var d      = item["_id"].AsBsonDocument;
                        var nombre = SafeStr(d, "nombre");
                        var codigo = SafeStr(d, "codigo");
                        var uni    = SafeStr(d, "unidad");
                        return (object)new
                        {
                            id       = $"compras-{(string.IsNullOrEmpty(codigo) ? nombre.Replace(" ", "-") : codigo)}",
                            text     = nombre,
                            type     = "metric",
                            isLeaf   = true,
                            operData = new { source = "precios", nombre, metrica = "costo_mxn", unidad = uni }
                        };
                    }).ToList()
                }).ToList<object>();

            // ── 4. VENTAS (Producto Final) ─────────────────────────────────
            var ventasItems = preciosDocs
                .Where(p => SafeStr(p["_id"].AsBsonDocument, "categoria") == "Producto Final")
                .Select(item =>
                {
                    var d      = item["_id"].AsBsonDocument;
                    var nombre = SafeStr(d, "nombre");
                    var codigo = SafeStr(d, "codigo");
                    var uni    = SafeStr(d, "unidad");
                    return (object)new
                    {
                        id       = $"ventas-{(string.IsNullOrEmpty(codigo) ? nombre.Replace(" ", "-") : codigo)}",
                        text     = nombre,
                        type     = "metric",
                        isLeaf   = true,
                        operData = new { source = "precios", nombre, metrica = "precio_neto_mxn", unidad = uni }
                    };
                }).ToList();

            var tree = new object[]
            {
                new { id = "produccion", text = "Producción", type = "section", items = prodItems },
                new { id = "compras",    text = "Compras",    type = "section", items = comprasItems },
                new { id = "ventas",     text = "Ventas",     type = "section", items = ventasItems },
            };

            return Ok(tree);
        }

        // GET /api/operations/series?source=produccion&planta_id=X&metrica=cantidad&range=1mo
        [HttpGet("series")]
        public async Task<IActionResult> GetSeries(
            [FromQuery] string source,
            [FromQuery] string? planta_id,
            [FromQuery] string? nombre,
            [FromQuery] string metrica  = "cantidad",
            [FromQuery] string range    = "1mo")
        {
            var until = DateTime.UtcNow;
            var desde = range switch
            {
                "1d"  => until.AddDays(-1),
                "7d"  => until.AddDays(-7),
                "1mo" => until.AddMonths(-1),
                "1y"  => until.AddYears(-1),
                _     => DateTime.MinValue   // "all"
            };

            if (source == "produccion")
            {
                var f = Builders<ResumenProduccionDiariaPlanta>.Filter.Empty;
                if (!string.IsNullOrEmpty(planta_id))
                    f &= Builders<ResumenProduccionDiariaPlanta>.Filter.Eq(x => x.PlantaId, planta_id);
                if (desde != DateTime.MinValue)
                    f &= Builders<ResumenProduccionDiariaPlanta>.Filter.Gte(x => x.FechaDia, desde);
                if (metrica == "cantidad")
                    f &= Builders<ResumenProduccionDiariaPlanta>.Filter.Eq(x => x.EsProductoFinal, true);

                var docs = await _ops.ResumenProduccion.Find(f).SortBy(x => x.FechaDia).ToListAsync();

                var series = docs
                    .GroupBy(x => x.FechaDia.ToString("yyyy-MM-dd"))
                    .Select(g =>
                    {
                        var valor = metrica switch
                        {
                            "cantidad"        => g.Sum(d => d.Cantidad),
                            "cantidad_merma"  => g.Sum(d => d.CantidadMerma),
                            "costo_total_mxn" => g.Sum(d => d.CostoTotalMxn),
                            _                 => 0
                        };
                        return new { fecha = g.Key, valor = Math.Round(valor, 2) };
                    })
                    .OrderBy(x => x.fecha)
                    .ToList();

                return Ok(series);
            }

            if (source == "precios")
            {
                var f = Builders<ResumenPreciosReales>.Filter.Empty;
                if (!string.IsNullOrEmpty(nombre))
                    f &= Builders<ResumenPreciosReales>.Filter.Eq(x => x.Nombre, nombre);
                if (desde != DateTime.MinValue)
                    f &= Builders<ResumenPreciosReales>.Filter.Gte(x => x.Fecha, desde);

                var docs = await _ops.ResumenPrecios.Find(f).SortBy(x => x.Fecha).ToListAsync();

                var series = docs.Select(d =>
                {
                    var valor = metrica switch
                    {
                        "precio_neto_mxn" => d.PrecioNetoMxn,
                        "costo_mxn"       => d.CostoMxn,
                        "margen_pct"      => d.MargenPct,
                        "indice_base100"  => d.IndiceBase100,
                        _                 => d.PrecioNetoMxn
                    };
                    return new { fecha = d.Fecha.ToString("yyyy-MM-dd"), valor = Math.Round(valor, 2) };
                }).ToList();

                return Ok(series);
            }

            return BadRequest(new { error = "source inválido. Use 'produccion' o 'precios'." });
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

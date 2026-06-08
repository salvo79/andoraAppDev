using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using MongoDB.Bson;
using MongoDB.Bson.IO;
using MongoDB.Driver;
using anDora.Api.Data;
using anDora.Api.Models.Advisor;
using anDora.Api.Models.Operations;
using anDora.Api.Models.Catalog;

namespace anDora.Api.Services;

public class AdvisorService
{
    private readonly HttpClient _http;
    private readonly OperationsContext _ops;
    private readonly CatalogContext _catalog;
    private readonly IMongoDatabase _db;
    private readonly string _geminiEndpoint;
    private const int MaxIterations = 8;

    private static readonly HashSet<string> _allowedCollections = new(StringComparer.OrdinalIgnoreCase)
    {
        "resumen_produccion_diaria_planta", "paros_no_programados", "resumen_mezclado_diario",
        "resumen_precios_reales", "transacciones", "ordenes_compra_venta",
        "resumen_diario_ordenes", "programa_ventas",
        "cat_sitios", "cat_plantas", "cat_trabajadores", "cat_proveedores",
        "cat_tanques", "cat_rutas", "cat_productos", "cat_corrientes",
        "cat_precios", "vendedores", "cat_clientes"
    };

    private static readonly HashSet<string> _blockedPipelineStages = new(StringComparer.OrdinalIgnoreCase)
    {
        "$out", "$merge", "$currentOp", "$listLocalSessions", "$listSessions"
    };

    private const string SystemPrompt = """
        Eres anDora Advisor, el agente inteligente de análisis operacional de la plataforma anDora.
        Tienes acceso a datos reales de operaciones industriales de plantas de proceso (2020–2025).

        Colecciones disponibles mediante herramientas:
        - Producción diaria por planta: cantidad producida, costo MXN, % merma, calidad aprobada/rechazada
        - Paros no programados: causa, duración horas, impacto en producción %, costo del paro MXN, kg perdidos
        - Mezclado diario: corrientes de materia prima por tipo, cantidad kg, calidad OK/NOK
        - Precios reales de productos: precio neto MXN, costo MXN, margen %, índice base 100
        - Ventas (transacciones OV): cliente, producto, cantidad ton, ingresos, margen, descuento, flete, estatus
        - Compras (órdenes OC): proveedor, materia prima, cantidad kg, precio unitario, total+IVA, planta destino
        - Resumen diario de órdenes: OV y OC por día/semana/mes, ingresos, costo MP, margen consolidado
        - Programa de ventas (forecast): plan por vendedor×cliente×canal×producto, con plan_total_mxn, plan_kg, plan_margen y plan_comision. Permite cruzar plan vs real para calcular cumplimiento % y desviación MXN
        - Catálogos: plantas, productos, corrientes, proveedores, tanques, rutas, vendedores, clientes

        Instrucciones:
        1. Usa las herramientas para obtener los datos antes de responder; no inventes cifras
        2. Correlaciona información de distintas colecciones para dar análisis completos
        3. Indica cifras concretas, porcentajes y tendencias cuando los datos lo permitan
        4. Detecta patrones, anomalías y sugiere oportunidades de mejora cuando sea relevante
        5. Responde en español (o el idioma que use el usuario); usa listas y tablas cuando ayuden
        6. Si el usuario pregunta por una planta específica, busca su clave en el catálogo primero
        7. Para preguntas ad-hoc o análisis que las herramientas fijas no cubran, usa query_libre con el pipeline de agregación adecuado
        """;

    private readonly string? _apiKey;

    public AdvisorService(IConfiguration config, OperationsContext ops, CatalogContext catalog)
    {
        _ops    = ops;
        _catalog = catalog;

        var mongoClient = new MongoClient(config["MongoSettings:ConnectionString"]);
        _db = mongoClient.GetDatabase(config["MongoSettings:OperationsDb"]);

        _apiKey = config["Gemini:ApiKey"];
        var model = config["Gemini:Model"] ?? "gemini-1.5-flash";

        _geminiEndpoint = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent";

        _http = new HttpClient { Timeout = TimeSpan.FromSeconds(120) };
        _http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    public async Task<string> ChatAsync(string userMessage, List<AdvisorMessageDto> history)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
            return "⚠️ El Advisor no está disponible: configura `Gemini:ApiKey` con tu API key de Google AI Studio (aistudio.google.com).";

        // Construir el array de contents en formato Gemini
        var contents = new JsonArray();

        foreach (var h in history)
        {
            // Gemini usa "model" donde Anthropic usaba "assistant"
            var geminiRole = h.Role == "assistant" ? "model" : "user";
            contents.Add(new JsonObject
            {
                ["role"]  = geminiRole,
                ["parts"] = new JsonArray { new JsonObject { ["text"] = h.Content } }
            });
        }
        contents.Add(new JsonObject
        {
            ["role"]  = "user",
            ["parts"] = new JsonArray { new JsonObject { ["text"] = userMessage } }
        });

        for (int iter = 0; iter < MaxIterations; iter++)
        {
            JsonObject response;
            try { response = await CallGeminiAsync(contents); }
            catch (Exception ex)
            {
                return $"⚠️ Error al llamar a Gemini API: {ex.Message}\n\n" +
                       "Verifica que la API key de Google AI Studio sea válida (aistudio.google.com/app/apikey).";
            }
            var candidate = response["candidates"]?.AsArray().FirstOrDefault();
            if (candidate == null) return "Sin respuesta del modelo.";

            var parts = candidate["content"]?["parts"]?.AsArray() ?? [];

            // Verificar si hay function calls
            var functionCalls = parts.Where(p => p?["functionCall"] != null).ToList();

            if (functionCalls.Count == 0)
            {
                // Sin function calls → extraer texto y retornar
                var sb = new StringBuilder();
                foreach (var part in parts)
                    if (part?["text"] != null)
                        sb.Append(part["text"]!.GetValue<string>());
                return sb.ToString();
            }

            // Agregar respuesta del modelo al historial
            contents.Add(new JsonObject
            {
                ["role"]  = "model",
                ["parts"] = JsonNode.Parse(parts.ToJsonString())!
            });

            // Ejecutar cada function call y construir la respuesta
            var responseParts = new JsonArray();
            foreach (var fcPart in functionCalls)
            {
                var fc       = fcPart!["functionCall"]!.AsObject();
                var toolName = fc["name"]?.GetValue<string>() ?? string.Empty;
                var toolArgs = fc["args"]?.AsObject();

                var result = await ExecuteToolAsync(toolName, toolArgs);

                responseParts.Add(new JsonObject
                {
                    ["functionResponse"] = new JsonObject
                    {
                        ["name"]     = toolName,
                        ["response"] = new JsonObject { ["output"] = result }
                    }
                });
            }

            contents.Add(new JsonObject
            {
                ["role"]  = "user",
                ["parts"] = responseParts
            });
        }

        return "No pude completar el análisis en el número máximo de pasos. Por favor reformula tu pregunta.";
    }

    // ── Google AI Studio (Gemini) call ──────────────────────────────────────

    private async Task<JsonObject> CallGeminiAsync(JsonArray contents)
    {
        var body = new JsonObject
        {
            ["contents"] = JsonNode.Parse(contents.ToJsonString()),
            ["system_instruction"] = new JsonObject
            {
                ["parts"] = new JsonArray { new JsonObject { ["text"] = SystemPrompt } }
            },
            ["tools"] = new JsonArray
            {
                new JsonObject
                {
                    ["function_declarations"] = JsonNode.Parse(JsonSerializer.Serialize(BuildGeminiTools()))
                }
            },
            ["generation_config"] = new JsonObject
            {
                ["max_output_tokens"] = 4096,
                ["temperature"]       = 0.1
            }
        };

        var url = $"{_geminiEndpoint}?key={_apiKey}";
        var req = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = new StringContent(body.ToJsonString(), Encoding.UTF8, "application/json")
        };

        var resp = await _http.SendAsync(req);
        var json = await resp.Content.ReadAsStringAsync();

        if (!resp.IsSuccessStatusCode)
            throw new Exception($"Gemini API error {resp.StatusCode}: {json}");

        return JsonNode.Parse(json)!.AsObject();
    }

    // ── Tool dispatcher ──────────────────────────────────────────────────────

    private async Task<string> ExecuteToolAsync(string toolName, JsonObject? input)
    {
        try
        {
            return toolName switch
            {
                "query_produccion" => await QueryProduccionAsync(input),
                "query_paros"      => await QueryParosAsync(input),
                "query_mezclado"   => await QueryMezcladoAsync(input),
                "query_precios"    => await QueryPreciosAsync(input),
                "query_catalog"    => await QueryCatalogAsync(input),
                "query_ventas"     => await QueryVentasAsync(input),
                "query_compras"    => await QueryComprasAsync(input),
                "query_ordenes"         => await QueryOrdenesAsync(input),
                "query_programa_ventas" => await QueryProgramaVentasAsync(input),
                "query_libre"           => await QueryLibreAsync(input),
                _                       => $"Herramienta desconocida: {toolName}"
            };
        }
        catch (Exception ex)
        {
            return $"Error ejecutando {toolName}: {ex.Message}";
        }
    }

    // ── Tool: Producción ─────────────────────────────────────────────────────

    private async Task<string> QueryProduccionAsync(JsonObject? input)
    {
        var plantaClave  = input?["planta_clave"]?.GetValue<string>();
        var fechaInicio  = ParseDate(input?["fecha_inicio"]?.GetValue<string>(), DateTime.UtcNow.AddDays(-30));
        var fechaFin     = ParseDate(input?["fecha_fin"]?.GetValue<string>(),    DateTime.UtcNow);
        var agruparPor   = input?["agrupar_por"]?.GetValue<string>() ?? "planta";

        var fb = Builders<ResumenProduccionDiariaPlanta>.Filter;
        var filter = fb.And(
            fb.Gte(x => x.FechaDia, fechaInicio),
            fb.Lte(x => x.FechaDia, fechaFin)
        );
        if (!string.IsNullOrWhiteSpace(plantaClave))
            filter &= fb.Eq(x => x.PlantaClave, plantaClave);

        var docs = await _ops.ResumenProduccion.Find(filter).ToListAsync();
        if (!docs.Any()) return "Sin datos para los filtros indicados.";

        object result = agruparPor switch
        {
            "mes" => docs
                .GroupBy(d => new { d.PlantaClave, d.PlantaNombre, d.Anio, d.Mes })
                .Select(g => new
                {
                    planta_clave      = g.Key.PlantaClave,
                    planta_nombre     = g.Key.PlantaNombre,
                    periodo           = $"{g.Key.Anio}-{g.Key.Mes:D2}",
                    total_cantidad    = Math.Round(g.Sum(x => x.Cantidad), 1),
                    unidad            = g.First().Unidad,
                    total_costo_mxn   = Math.Round(g.Sum(x => x.CostoTotalMxn), 0),
                    promedio_merma_pct= Math.Round(g.Average(x => x.MermaPct), 2),
                    lotes_aprobados   = g.Count(x => x.CalidadAprobado),
                    lotes_rechazados  = g.Count(x => !x.CalidadAprobado)
                })
                .OrderBy(x => x.planta_clave).ThenBy(x => x.periodo)
                .Take(60).ToList(),

            "dia" => docs
                .GroupBy(d => new { d.PlantaClave, d.PlantaNombre, Fecha = d.FechaDia.Date })
                .Select(g => new
                {
                    planta_clave      = g.Key.PlantaClave,
                    planta_nombre     = g.Key.PlantaNombre,
                    fecha             = g.Key.Fecha.ToString("yyyy-MM-dd"),
                    total_cantidad    = Math.Round(g.Sum(x => x.Cantidad), 1),
                    unidad            = g.First().Unidad,
                    total_costo_mxn   = Math.Round(g.Sum(x => x.CostoTotalMxn), 0),
                    promedio_merma_pct= Math.Round(g.Average(x => x.MermaPct), 2),
                    lotes_aprobados   = g.Count(x => x.CalidadAprobado),
                    lotes_rechazados  = g.Count(x => !x.CalidadAprobado)
                })
                .OrderByDescending(x => x.fecha)
                .Take(60).ToList(),

            _ => docs  // "planta" (default)
                .GroupBy(d => new { d.PlantaClave, d.PlantaNombre })
                .Select(g => new
                {
                    planta_clave      = g.Key.PlantaClave,
                    planta_nombre     = g.Key.PlantaNombre,
                    periodo           = $"{fechaInicio:yyyy-MM-dd} / {fechaFin:yyyy-MM-dd}",
                    total_cantidad    = Math.Round(g.Sum(x => x.Cantidad), 1),
                    unidad            = g.First().Unidad,
                    total_costo_mxn   = Math.Round(g.Sum(x => x.CostoTotalMxn), 0),
                    promedio_merma_pct= Math.Round(g.Average(x => x.MermaPct), 2),
                    lotes_aprobados   = g.Count(x => x.CalidadAprobado),
                    lotes_rechazados  = g.Count(x => !x.CalidadAprobado)
                })
                .OrderBy(x => x.planta_clave).ToList()
        };

        return JsonSerializer.Serialize(result);
    }

    // ── Tool: Paros ──────────────────────────────────────────────────────────

    private async Task<string> QueryParosAsync(JsonObject? input)
    {
        var plantaClave = input?["planta_clave"]?.GetValue<string>();
        var fechaInicio = ParseDate(input?["fecha_inicio"]?.GetValue<string>(), DateTime.UtcNow.AddDays(-90));
        var fechaFin    = ParseDate(input?["fecha_fin"]?.GetValue<string>(),    DateTime.UtcNow);
        var agruparPor  = input?["agrupar_por"]?.GetValue<string>() ?? "causa";

        var fb = Builders<ParoNoProgramado>.Filter;
        var filter = fb.And(
            fb.Gte(x => x.Fecha, fechaInicio),
            fb.Lte(x => x.Fecha, fechaFin)
        );
        if (!string.IsNullOrWhiteSpace(plantaClave))
            filter &= fb.Eq(x => x.PlantaClave, plantaClave);

        var docs = await _ops.ParosNoProgramados.Find(filter).ToListAsync();
        if (!docs.Any()) return "Sin paros registrados para los filtros indicados.";

        object result = agruparPor == "planta"
            ? docs
                .GroupBy(d => new { d.PlantaClave, d.PlantaNombre })
                .Select(g => new
                {
                    planta_clave          = g.Key.PlantaClave,
                    planta_nombre         = g.Key.PlantaNombre,
                    total_paros           = g.Count(),
                    total_horas           = Math.Round(g.Sum(x => x.DuracionHoras), 1),
                    total_costo_mxn       = Math.Round(g.Sum(x => x.CostoParoMxn), 0),
                    total_kg_perdidos     = Math.Round(g.Sum(x => x.ProduccionPerdidaKg), 0),
                    promedio_impacto_pct  = Math.Round(g.Average(x => x.ImpactoProduccionPct), 2),
                    paros_resueltos       = g.Count(x => x.ParoResuelto),
                    paros_abiertos        = g.Count(x => !x.ParoResuelto),
                    causa_principal       = g.GroupBy(x => x.Causa).OrderByDescending(c => c.Count()).First().Key
                })
                .OrderByDescending(x => x.total_horas).ToList()
            : (object)docs
                .GroupBy(d => d.Causa)
                .Select(g => new
                {
                    causa                = g.Key,
                    total_paros          = g.Count(),
                    total_horas          = Math.Round(g.Sum(x => x.DuracionHoras), 1),
                    total_costo_mxn      = Math.Round(g.Sum(x => x.CostoParoMxn), 0),
                    total_kg_perdidos    = Math.Round(g.Sum(x => x.ProduccionPerdidaKg), 0),
                    promedio_impacto_pct = Math.Round(g.Average(x => x.ImpactoProduccionPct), 2),
                    plantas_afectadas    = g.Select(x => x.PlantaClave).Distinct().ToList()
                })
                .OrderByDescending(x => x.total_horas).Take(20).ToList();

        return JsonSerializer.Serialize(result);
    }

    // ── Tool: Mezclado ───────────────────────────────────────────────────────

    private async Task<string> QueryMezcladoAsync(JsonObject? input)
    {
        var plantaClave = input?["planta_clave"]?.GetValue<string>();
        var fechaInicio = ParseDate(input?["fecha_inicio"]?.GetValue<string>(), DateTime.UtcNow.AddDays(-30));
        var fechaFin    = ParseDate(input?["fecha_fin"]?.GetValue<string>(),    DateTime.UtcNow);

        var fb = Builders<ResumenMezcladoDiario>.Filter;
        var filter = fb.And(
            fb.Gte(x => x.FechaDia, fechaInicio),
            fb.Lte(x => x.FechaDia, fechaFin)
        );
        if (!string.IsNullOrWhiteSpace(plantaClave))
            filter &= fb.Eq(x => x.PlantaClave, plantaClave);

        var docs = await _ops.ResumenMezclado.Find(filter).ToListAsync();
        if (!docs.Any()) return "Sin datos de mezclado para los filtros indicados.";

        var result = docs
            .GroupBy(d => new { d.PlantaClave, d.TipoCorriente })
            .Select(g => new
            {
                planta_clave    = g.Key.PlantaClave,
                tipo_corriente  = g.Key.TipoCorriente,
                total_kg        = Math.Round(g.Sum(x => x.CantidadKg), 0),
                lotes_ok        = g.Count(x => x.CalidadOk),
                lotes_nok       = g.Count(x => !x.CalidadOk),
                pct_calidad_ok  = g.Count() > 0
                    ? Math.Round(g.Count(x => x.CalidadOk) * 100.0 / g.Count(), 1)
                    : 0
            })
            .OrderBy(x => x.planta_clave).ThenByDescending(x => x.total_kg)
            .Take(40).ToList();

        return JsonSerializer.Serialize(result);
    }

    // ── Tool: Precios ────────────────────────────────────────────────────────

    private async Task<string> QueryPreciosAsync(JsonObject? input)
    {
        var codigo      = input?["codigo"]?.GetValue<string>();
        var categoria   = input?["categoria"]?.GetValue<string>();
        var fechaInicio = ParseDate(input?["fecha_inicio"]?.GetValue<string>(), DateTime.UtcNow.AddDays(-90));
        var fechaFin    = ParseDate(input?["fecha_fin"]?.GetValue<string>(),    DateTime.UtcNow);

        var fb = Builders<ResumenPreciosReales>.Filter;
        var filter = fb.And(
            fb.Gte(x => x.Fecha, fechaInicio),
            fb.Lte(x => x.Fecha, fechaFin)
        );
        if (!string.IsNullOrWhiteSpace(codigo))
            filter &= fb.Eq(x => x.Codigo, codigo);
        if (!string.IsNullOrWhiteSpace(categoria))
            filter &= fb.Eq(x => x.Categoria, categoria);

        var docs = await _ops.ResumenPrecios.Find(filter).ToListAsync();
        if (!docs.Any()) return "Sin datos de precios para los filtros indicados.";

        var result = docs
            .GroupBy(d => new { d.Codigo, d.Nombre, d.Categoria, d.Familia, d.Unidad })
            .Select(g => new
            {
                codigo               = g.Key.Codigo,
                nombre               = g.Key.Nombre,
                categoria            = g.Key.Categoria,
                familia              = g.Key.Familia,
                unidad               = g.Key.Unidad,
                precio_promedio_mxn  = Math.Round(g.Average(x => x.PrecioNetoMxn), 2),
                precio_min_mxn       = Math.Round(g.Min(x => x.PrecioNetoMxn), 2),
                precio_max_mxn       = Math.Round(g.Max(x => x.PrecioNetoMxn), 2),
                costo_promedio_mxn   = Math.Round(g.Average(x => x.CostoMxn), 2),
                margen_promedio_pct  = Math.Round(g.Average(x => x.MargenPct), 2),
                indice_base100       = Math.Round(g.Average(x => x.IndiceBase100), 1)
            })
            .OrderBy(x => x.categoria).ThenBy(x => x.nombre)
            .Take(40).ToList();

        return JsonSerializer.Serialize(result);
    }

    // ── Tool: Catálogo ───────────────────────────────────────────────────────

    private async Task<string> QueryCatalogAsync(JsonObject? input)
    {
        var tipo = input?["tipo"]?.GetValue<string>() ?? "plantas";

        object result = tipo switch
        {
            "plantas" => (await _catalog.Plantas.Find(_ => true).ToListAsync())
                .Select(p => new { id = p.Id, clave = p.Clave, nombre = p.Nombre, tipo = p.Tipo, capacidad_ton = p.CapacidadTon, unidad = p.Unidad })
                .ToList(),

            "productos" => (await _catalog.Productos.Find(_ => true).ToListAsync())
                .Select(p => new { id = p.Id, clave = p.Clave, nombre = p.Nombre, categoria = p.Categoria, unidad = p.Unidad, es_producto_final = p.EsProductoFinal })
                .ToList(),

            "corrientes" => (await _catalog.Corrientes.Find(_ => true).ToListAsync())
                .Select(c => new { id = c.Id, clave = c.Clave, nombre = c.Nombre, tipo_corriente = c.TipoCorriente, unidad = c.Unidad })
                .ToList(),

            "proveedores" => (await _catalog.Proveedores.Find(_ => true).ToListAsync())
                .Select(p => new { id = p.Id, clave = p.Clave, nombre = p.Nombre, tipo_servicio = p.TipoServicio, contacto = p.Contacto })
                .ToList(),

            "sitios" => (await _catalog.Sitios.Find(_ => true).ToListAsync())
                .Select(s => new { id = s.Id, clave = s.Clave, nombre = s.Nombre, estado = s.Estado, ubicacion = s.Ubicacion })
                .ToList(),

            "tanques" => (await _catalog.Tanques.Find(_ => true).ToListAsync())
                .Select(t => new { id = t.Id, clave = t.Clave, nombre = t.Nombre, capacidad_m3 = t.CapacidadM3, tipo_producto = t.TipoProducto, planta_nombre = t.PlantaNombre })
                .ToList(),

            "rutas" => (await _catalog.Rutas.Find(_ => true).ToListAsync())
                .Select(r => new { id = r.Id, clave = r.Clave, nombre = r.Nombre, origen = r.Origen, destino = r.Destino, distancia_km = r.DistanciaKm, tipo_transporte = r.TipoTransporte })
                .ToList(),

            "vendedores" => (await _catalog.Vendedores.Find(_ => true).ToListAsync())
                .Select(v => new
                {
                    id     = v.Id,
                    codigo = v.Codigo,
                    nombre = v.NombreCompleto ?? v.Nombre,
                    zona   = v.Zona,
                    email  = v.Email,
                    activo = v.Activo
                })
                .ToList(),

            "clientes" => (await _catalog.Clientes.Find(_ => true).ToListAsync())
                .Select(c => new
                {
                    id           = c.Id,
                    codigo       = c.Codigo,
                    nombre       = c.Nombre ?? c.RazonSocial,
                    razon_social = c.RazonSocial,
                    canal        = c.Canal,
                    estado       = c.Estado,
                    activo       = c.Activo
                })
                .ToList(),

            _ => new { error = $"Tipo de catálogo desconocido: {tipo}. Usa: plantas, productos, corrientes, proveedores, sitios, tanques, rutas, vendedores, clientes" }
        };

        return JsonSerializer.Serialize(result);
    }

    // ── Tool: Programa de ventas (plan vs real) ──────────────────────────────

    private async Task<string> QueryProgramaVentasAsync(JsonObject? input)
    {
        var fechaInicio   = ParseDate(input?["fecha_inicio"]?.GetValue<string>(), DateTime.UtcNow.AddDays(-90));
        var fechaFin      = ParseDate(input?["fecha_fin"]?.GetValue<string>(),    DateTime.UtcNow);
        var agruparPor    = input?["agrupar_por"]?.GetValue<string>() ?? "vendedor";
        var vendedorCod   = input?["vendedor_codigo"]?.GetValue<string>();
        var clienteCod    = input?["cliente_codigo"]?.GetValue<string>();
        var canal         = input?["canal"]?.GetValue<string>();
        var productoCod   = input?["producto_codigo"]?.GetValue<string>();

        // ── Consultar plan ────────────────────────────────────────────
        var fbP = Builders<ProgramaVenta>.Filter;
        var planFilter = fbP.And(
            fbP.Gte(x => x.Fecha, fechaInicio),
            fbP.Lte(x => x.Fecha, fechaFin)
        );
        if (!string.IsNullOrWhiteSpace(vendedorCod))
            planFilter &= fbP.Eq(x => x.VendedorCodigo, vendedorCod);
        if (!string.IsNullOrWhiteSpace(clienteCod))
            planFilter &= fbP.Eq(x => x.ClienteCodigo, clienteCod);
        if (!string.IsNullOrWhiteSpace(canal))
            planFilter &= fbP.Eq(x => x.Canal, canal);
        if (!string.IsNullOrWhiteSpace(productoCod))
            planFilter &= fbP.Eq(x => x.ProductoCodigo, productoCod);

        var planDocs = await _ops.ProgramaVentas.Find(planFilter).ToListAsync();
        if (!planDocs.Any()) return "Sin datos de programa de ventas para los filtros indicados.";

        // ── Consultar real (transacciones de venta, mismo período) ────
        var fbT = Builders<Transaccion>.Filter;
        var realFilter = fbT.And(
            fbT.Eq(x => x.Tipo, "venta"),
            fbT.Gte(x => x.Fecha, fechaInicio),
            fbT.Lte(x => x.Fecha, fechaFin)
        );
        if (!string.IsNullOrWhiteSpace(clienteCod))
            realFilter &= fbT.Eq(x => x.ClienteCodigo, clienteCod);
        if (!string.IsNullOrWhiteSpace(productoCod))
            realFilter &= fbT.Eq(x => x.ProductoCodigo, productoCod);

        var realDocs = await _ops.Transacciones.Find(realFilter).ToListAsync();

        // ── Cruzar plan vs real según agrupación ─────────────────────
        object result = agruparPor switch
        {
            "cliente" => CrossJoin(
                planDocs.GroupBy(p => new { p.ClienteCodigo, p.ClienteNombre, p.VendedorNombre }),
                realDocs.GroupBy(r => new { r.ClienteCodigo, r.ClienteNombre }),
                p => new { p.Key.ClienteCodigo, p.Key.ClienteNombre, vendedor = p.Key.VendedorNombre },
                r => new { r.Key.ClienteCodigo, r.Key.ClienteNombre }
            ),

            "canal" => CrossJoin(
                planDocs.GroupBy(p => p.Canal),
                realDocs.GroupBy(r => r.Estatus),   // real no tiene canal; agrupa por estatus
                p => new { canal = p.Key, vendedor = (string?)null, cliente = (string?)null },
                r => new { canal = r.Key,  vendedor = (string?)null, cliente = (string?)null }
            ),

            "producto" => CrossJoin(
                planDocs.GroupBy(p => new { p.ProductoCodigo, p.ProductoNombre }),
                realDocs.GroupBy(r => new { r.ProductoCodigo, r.ProductoNombre }),
                p => new { p.Key.ProductoCodigo, p.Key.ProductoNombre, vendedor = (string?)null },
                r => new { r.Key.ProductoCodigo, r.Key.ProductoNombre }
            ),

            "mes" => (object)planDocs
                .GroupBy(p => new { p.Anio, p.Mes })
                .Select(gp =>
                {
                    var real = realDocs.Where(r => r.Anio == gp.Key.Anio && r.Mes == gp.Key.Mes).ToList();
                    var planTotal = gp.Sum(p => p.PlanTotalMxn);
                    var realTotal = real.Sum(r => r.TotalMxn);
                    return new
                    {
                        periodo              = $"{gp.Key.Anio}-{gp.Key.Mes:D2}",
                        plan_total_mxn       = Math.Round(planTotal, 0),
                        real_total_mxn       = Math.Round(realTotal, 0),
                        cumplimiento_pct     = planTotal > 0 ? Math.Round(realTotal / planTotal * 100, 1) : 0,
                        desviacion_mxn       = Math.Round(realTotal - planTotal, 0),
                        plan_kg              = Math.Round(gp.Sum(p => p.PlanVentasKg), 0),
                        real_ton             = Math.Round(real.Sum(r => r.Cantidad), 2),
                        plan_margen_mxn      = Math.Round(gp.Sum(p => p.PlanMargenMxn), 0),
                        real_margen_mxn      = Math.Round(real.Sum(r => r.MargenMxn), 0),
                        plan_comision_mxn    = Math.Round(gp.Sum(p => p.PlanComisionMxn), 0),
                        clientes_distintos   = gp.Select(p => p.ClienteCodigo).Distinct().Count(),
                        vendedores_distintos = gp.Select(p => p.VendedorCodigo).Distinct().Count()
                    };
                })
                .OrderBy(x => x.periodo).ToList(),

            _ => // "vendedor" (default)
                planDocs
                .GroupBy(p => new { p.VendedorCodigo, p.VendedorNombre })
                .Select(gp =>
                {
                    // El real no tiene vendedor_id en transacciones; cruzamos por cliente
                    var cliCodes = gp.Select(p => p.ClienteCodigo).Distinct().ToHashSet();
                    var real     = realDocs.Where(r => cliCodes.Contains(r.ClienteCodigo)).ToList();
                    var planTotal = gp.Sum(p => p.PlanTotalMxn);
                    var realTotal = real.Sum(r => r.TotalMxn);
                    return new
                    {
                        vendedor_codigo      = gp.Key.VendedorCodigo,
                        vendedor_nombre      = gp.Key.VendedorNombre,
                        clientes_asignados   = gp.Select(p => p.ClienteCodigo).Distinct().Count(),
                        canales              = gp.Select(p => p.Canal).Distinct().OrderBy(c => c).ToList(),
                        plan_total_mxn       = Math.Round(planTotal, 0),
                        real_total_mxn       = Math.Round(realTotal, 0),
                        cumplimiento_pct     = planTotal > 0 ? Math.Round(realTotal / planTotal * 100, 1) : 0,
                        desviacion_mxn       = Math.Round(realTotal - planTotal, 0),
                        plan_kg              = Math.Round(gp.Sum(p => p.PlanVentasKg), 0),
                        real_ton             = Math.Round(real.Sum(r => r.Cantidad), 2),
                        plan_margen_mxn      = Math.Round(gp.Sum(p => p.PlanMargenMxn), 0),
                        real_margen_mxn      = Math.Round(real.Sum(r => r.MargenMxn), 0),
                        plan_comision_mxn    = Math.Round(gp.Sum(p => p.PlanComisionMxn), 0)
                    };
                })
                .OrderByDescending(x => x.plan_total_mxn).ToList()
        };

        return JsonSerializer.Serialize(result);
    }

    // Genera el cruce plan vs real con llave dinámica vía diccionarios
    private static List<object> CrossJoin<TPlanKey, TRealKey>(
        IEnumerable<IGrouping<TPlanKey, ProgramaVenta>> planGroups,
        IEnumerable<IGrouping<TRealKey, Transaccion>>   realGroups,
        Func<IGrouping<TPlanKey, ProgramaVenta>, object> planKeySelector,
        Func<IGrouping<TRealKey, Transaccion>,   object> realKeySelector)
    {
        // Serializar las claves a JSON para poder compararlas como strings
        var realByKey = realGroups
            .ToDictionary(
                g => JsonSerializer.Serialize(realKeySelector(g)),
                g => g.ToList()
            );

        return planGroups.Select(gp =>
        {
            var keyObj   = planKeySelector(gp);
            var keyJson  = JsonSerializer.Serialize(keyObj);
            var real     = realByKey.TryGetValue(keyJson, out var r) ? r : [];
            var planTotal = gp.Sum(p => p.PlanTotalMxn);
            var realTotal = real.Sum(r => r.TotalMxn);

            return (object)new
            {
                dimension          = keyObj,
                plan_total_mxn     = Math.Round(planTotal, 0),
                real_total_mxn     = Math.Round(realTotal, 0),
                cumplimiento_pct   = planTotal > 0 ? Math.Round(realTotal / planTotal * 100, 1) : 0,
                desviacion_mxn     = Math.Round(realTotal - planTotal, 0),
                plan_kg            = Math.Round(gp.Sum(p => p.PlanVentasKg), 0),
                real_ton           = Math.Round(real.Sum(r => r.Cantidad), 2),
                plan_margen_mxn    = Math.Round(gp.Sum(p => p.PlanMargenMxn), 0),
                real_margen_mxn    = Math.Round(real.Sum(r => r.MargenMxn), 0),
                plan_comision_mxn  = Math.Round(gp.Sum(p => p.PlanComisionMxn), 0)
            };
        }).OrderByDescending(x => ((dynamic)x).plan_total_mxn).Take(40).ToList();
    }

    // ── Tool: Ventas ─────────────────────────────────────────────────────────

    private async Task<string> QueryVentasAsync(JsonObject? input)
    {
        var fechaInicio  = ParseDate(input?["fecha_inicio"]?.GetValue<string>(), DateTime.UtcNow.AddDays(-30));
        var fechaFin     = ParseDate(input?["fecha_fin"]?.GetValue<string>(),    DateTime.UtcNow);
        var agruparPor   = input?["agrupar_por"]?.GetValue<string>() ?? "producto";
        var clienteNombre= input?["cliente_nombre"]?.GetValue<string>();
        var productoCod  = input?["producto_codigo"]?.GetValue<string>();
        var estatus      = input?["estatus"]?.GetValue<string>();

        var fb = Builders<Transaccion>.Filter;
        var filter = fb.And(
            fb.Eq(x => x.Tipo, "venta"),
            fb.Gte(x => x.Fecha, fechaInicio),
            fb.Lte(x => x.Fecha, fechaFin)
        );
        if (!string.IsNullOrWhiteSpace(clienteNombre))
            filter &= fb.Regex(x => x.ClienteNombre, new MongoDB.Bson.BsonRegularExpression(clienteNombre, "i"));
        if (!string.IsNullOrWhiteSpace(productoCod))
            filter &= fb.Eq(x => x.ProductoCodigo, productoCod);
        if (!string.IsNullOrWhiteSpace(estatus))
            filter &= fb.Eq(x => x.Estatus, estatus);

        var docs = await _ops.Transacciones.Find(filter).ToListAsync();
        if (!docs.Any()) return "Sin ventas para los filtros indicados.";

        object result = agruparPor switch
        {
            "cliente" => docs
                .GroupBy(d => new { d.ClienteCodigo, d.ClienteNombre })
                .Select(g => new
                {
                    cliente_codigo     = g.Key.ClienteCodigo,
                    cliente_nombre     = g.Key.ClienteNombre,
                    num_ordenes        = g.Count(),
                    total_cantidad_ton = Math.Round(g.Sum(x => x.Cantidad), 2),
                    ingresos_mxn       = Math.Round(g.Sum(x => x.TotalMxn), 0),
                    costo_total_mxn    = Math.Round(g.Sum(x => x.CostoTotal), 0),
                    margen_mxn         = Math.Round(g.Sum(x => x.MargenMxn), 0),
                    margen_promedio_pct= Math.Round(g.Average(x => x.MargenPct), 2),
                    descuento_promedio_pct = Math.Round(g.Average(x => x.DescuentoPct) * 100, 2),
                    ordenes_entregadas = g.Count(x => x.Estatus == "entregada"),
                    ordenes_facturadas = g.Count(x => x.Estatus == "facturada")
                })
                .OrderByDescending(x => x.ingresos_mxn).Take(30).ToList(),

            "mes" => docs
                .GroupBy(d => new { d.Anio, d.Mes })
                .Select(g => new
                {
                    periodo            = $"{g.Key.Anio}-{g.Key.Mes:D2}",
                    num_ordenes        = g.Count(),
                    total_cantidad_ton = Math.Round(g.Sum(x => x.Cantidad), 2),
                    ingresos_mxn       = Math.Round(g.Sum(x => x.TotalMxn), 0),
                    costo_total_mxn    = Math.Round(g.Sum(x => x.CostoTotal), 0),
                    margen_mxn         = Math.Round(g.Sum(x => x.MargenMxn), 0),
                    margen_promedio_pct= Math.Round(g.Average(x => x.MargenPct), 2),
                    clientes_distintos = g.Select(x => x.ClienteCodigo).Distinct().Count()
                })
                .OrderBy(x => x.periodo).ToList(),

            "estatus" => docs
                .GroupBy(d => d.Estatus)
                .Select(g => new
                {
                    estatus            = g.Key,
                    num_ordenes        = g.Count(),
                    total_cantidad_ton = Math.Round(g.Sum(x => x.Cantidad), 2),
                    ingresos_mxn       = Math.Round(g.Sum(x => x.TotalMxn), 0),
                    margen_mxn         = Math.Round(g.Sum(x => x.MargenMxn), 0)
                })
                .OrderByDescending(x => x.num_ordenes).ToList(),

            _ => // "producto" (default)
                docs
                .GroupBy(d => new { d.ProductoCodigo, d.ProductoNombre })
                .Select(g => new
                {
                    producto_codigo    = g.Key.ProductoCodigo,
                    producto_nombre    = g.Key.ProductoNombre,
                    num_ordenes        = g.Count(),
                    total_cantidad_ton = Math.Round(g.Sum(x => x.Cantidad), 2),
                    ingresos_mxn       = Math.Round(g.Sum(x => x.TotalMxn), 0),
                    costo_total_mxn    = Math.Round(g.Sum(x => x.CostoTotal), 0),
                    margen_mxn         = Math.Round(g.Sum(x => x.MargenMxn), 0),
                    margen_promedio_pct= Math.Round(g.Average(x => x.MargenPct), 2),
                    precio_promedio    = Math.Round(g.Average(x => x.PrecioNeto), 2),
                    flete_total_mxn    = Math.Round(g.Sum(x => x.FleteMxn), 0)
                })
                .OrderByDescending(x => x.ingresos_mxn).ToList()
        };

        return JsonSerializer.Serialize(result);
    }

    // ── Tool: Compras ────────────────────────────────────────────────────────

    private async Task<string> QueryComprasAsync(JsonObject? input)
    {
        var fechaInicio  = ParseDate(input?["fecha_inicio"]?.GetValue<string>(), DateTime.UtcNow.AddDays(-90));
        var fechaFin     = ParseDate(input?["fecha_fin"]?.GetValue<string>(),    DateTime.UtcNow);
        var agruparPor   = input?["agrupar_por"]?.GetValue<string>() ?? "proveedor";
        var plantaClave  = input?["planta_clave"]?.GetValue<string>();
        var productoCod  = input?["producto_codigo"]?.GetValue<string>();

        var fb = Builders<OrdenCompraVenta>.Filter;
        var filter = fb.And(
            fb.Eq(x => x.Tipo, "compra"),
            fb.Gte(x => x.Fecha, fechaInicio),
            fb.Lte(x => x.Fecha, fechaFin)
        );
        if (!string.IsNullOrWhiteSpace(plantaClave))
            filter &= fb.Eq(x => x.PlantaClave, plantaClave);
        if (!string.IsNullOrWhiteSpace(productoCod))
            filter &= fb.Eq(x => x.ProductoCodigo, productoCod);

        var docs = await _ops.OrdenesCompraVenta.Find(filter).ToListAsync();
        if (!docs.Any()) return "Sin órdenes de compra para los filtros indicados.";

        object result = agruparPor switch
        {
            "producto" => docs
                .GroupBy(d => new { d.ProductoCodigo, d.ProductoNombre })
                .Select(g => new
                {
                    producto_codigo   = g.Key.ProductoCodigo,
                    producto_nombre   = g.Key.ProductoNombre,
                    num_ordenes       = g.Count(),
                    cantidad_total_kg = Math.Round(g.Sum(x => x.Cantidad), 0),
                    subtotal_mxn      = Math.Round(g.Sum(x => x.Subtotal), 0),
                    iva_total_mxn     = Math.Round(g.Sum(x => x.IvaMxn), 0),
                    total_mxn         = Math.Round(g.Sum(x => x.Total), 0),
                    precio_unit_prom  = Math.Round(g.Average(x => x.PrecioUnitario), 4),
                    estatus_counts    = g.GroupBy(x => x.Estatus)
                                        .ToDictionary(e => e.Key, e => e.Count())
                })
                .OrderByDescending(x => x.total_mxn).ToList(),

            "planta" => docs
                .GroupBy(d => d.PlantaClave ?? "SIN-PLANTA")
                .Select(g => new
                {
                    planta_clave      = g.Key,
                    num_ordenes       = g.Count(),
                    cantidad_total_kg = Math.Round(g.Sum(x => x.Cantidad), 0),
                    total_mxn         = Math.Round(g.Sum(x => x.Total), 0),
                    productos         = g.Select(x => x.ProductoNombre).Distinct().ToList()
                })
                .OrderByDescending(x => x.total_mxn).ToList(),

            "mes" => docs
                .GroupBy(d => new { d.Fecha.Year, d.Fecha.Month })
                .Select(g => new
                {
                    periodo           = $"{g.Key.Year}-{g.Key.Month:D2}",
                    num_ordenes       = g.Count(),
                    cantidad_total_kg = Math.Round(g.Sum(x => x.Cantidad), 0),
                    subtotal_mxn      = Math.Round(g.Sum(x => x.Subtotal), 0),
                    iva_total_mxn     = Math.Round(g.Sum(x => x.IvaMxn), 0),
                    total_mxn         = Math.Round(g.Sum(x => x.Total), 0)
                })
                .OrderBy(x => x.periodo).ToList(),

            _ => // "proveedor" (default)
                docs
                .GroupBy(d => d.ProveedorId ?? "SIN-PROVEEDOR")
                .Select(g => new
                {
                    proveedor_id      = g.Key,
                    num_ordenes       = g.Count(),
                    cantidad_total_kg = Math.Round(g.Sum(x => x.Cantidad), 0),
                    subtotal_mxn      = Math.Round(g.Sum(x => x.Subtotal), 0),
                    iva_total_mxn     = Math.Round(g.Sum(x => x.IvaMxn), 0),
                    total_mxn         = Math.Round(g.Sum(x => x.Total), 0),
                    precio_unit_prom  = Math.Round(g.Average(x => x.PrecioUnitario), 4),
                    productos         = g.Select(x => x.ProductoNombre).Distinct().ToList()
                })
                .OrderByDescending(x => x.total_mxn).Take(30).ToList()
        };

        return JsonSerializer.Serialize(result);
    }

    // ── Tool: Órdenes / Estado de pedidos ────────────────────────────────────

    private async Task<string> QueryOrdenesAsync(JsonObject? input)
    {
        var fechaInicio = ParseDate(input?["fecha_inicio"]?.GetValue<string>(), DateTime.UtcNow.AddDays(-30));
        var fechaFin    = ParseDate(input?["fecha_fin"]?.GetValue<string>(),    DateTime.UtcNow);
        var agruparPor  = input?["agrupar_por"]?.GetValue<string>() ?? "dia";

        var fb = Builders<ResumenDiarioOrdenes>.Filter;
        var filter = fb.And(
            fb.Gte(x => x.FechaDia, fechaInicio),
            fb.Lte(x => x.FechaDia, fechaFin)
        );

        var docs = await _ops.ResumenDiarioOrdenes.Find(filter).ToListAsync();
        if (!docs.Any()) return "Sin resúmenes de órdenes para el período indicado.";

        object result = agruparPor switch
        {
            "mes" => docs
                .GroupBy(d => new { d.Anio, d.Mes })
                .Select(g => new
                {
                    periodo              = $"{g.Key.Anio}-{g.Key.Mes:D2}",
                    dias_con_actividad   = g.Count(),
                    total_ov             = g.Sum(x => x.OrdenesVenta),
                    total_oc             = g.Sum(x => x.OrdenesCompra),
                    ventas_ton           = Math.Round(g.Sum(x => x.VentasTon), 2),
                    ingresos_mxn         = Math.Round(g.Sum(x => x.IngresosMxn), 0),
                    costo_mp_mxn         = Math.Round(g.Sum(x => x.CostoMpMxn), 0),
                    margen_mxn           = Math.Round(g.Sum(x => x.MargenMxn), 0),
                    margen_pct           = g.Sum(x => x.IngresosMxn) > 0
                        ? Math.Round(g.Sum(x => x.MargenMxn) / g.Sum(x => x.IngresosMxn) * 100, 2)
                        : 0
                })
                .OrderBy(x => x.periodo).ToList(),

            "semana" => docs
                .GroupBy(d => new { d.Anio, d.Semana })
                .Select(g => new
                {
                    periodo              = $"{g.Key.Anio}-S{g.Key.Semana:D2}",
                    total_ov             = g.Sum(x => x.OrdenesVenta),
                    total_oc             = g.Sum(x => x.OrdenesCompra),
                    ventas_ton           = Math.Round(g.Sum(x => x.VentasTon), 2),
                    ingresos_mxn         = Math.Round(g.Sum(x => x.IngresosMxn), 0),
                    margen_mxn           = Math.Round(g.Sum(x => x.MargenMxn), 0)
                })
                .OrderBy(x => x.periodo).Take(52).ToList(),

            _ => // "dia" (default)
                docs
                .Select(d => new
                {
                    fecha                = d.FechaDia.ToString("yyyy-MM-dd"),
                    ordenes_venta        = d.OrdenesVenta,
                    ordenes_compra       = d.OrdenesCompra,
                    ventas_ton           = Math.Round(d.VentasTon, 2),
                    ingresos_mxn         = Math.Round(d.IngresosMxn, 0),
                    costo_mp_mxn         = Math.Round(d.CostoMpMxn, 0),
                    margen_mxn           = Math.Round(d.MargenMxn, 0),
                    margen_pct           = d.IngresosMxn > 0
                        ? Math.Round(d.MargenMxn / d.IngresosMxn * 100, 2)
                        : 0
                })
                .OrderByDescending(x => x.fecha).Take(60).ToList()
        };

        return JsonSerializer.Serialize(result);
    }

    // ── Tool: Consulta libre ad-hoc ──────────────────────────────────────────

    private async Task<string> QueryLibreAsync(JsonObject? input)
    {
        var coleccion    = input?["coleccion"]?.GetValue<string>() ?? "";
        var filtroJson   = input?["filtro"]?.GetValue<string>();
        var pipelineJson = input?["pipeline"]?.GetValue<string>();
        var limite       = Math.Min(input?["limite"]?.GetValue<int>() ?? 50, 200);

        if (!_allowedCollections.Contains(coleccion))
            return $"Colección '{coleccion}' no permitida. Disponibles: {string.Join(", ", _allowedCollections.OrderBy(x => x))}";

        var collection = _db.GetCollection<BsonDocument>(coleccion);

        try
        {
            if (!string.IsNullOrWhiteSpace(pipelineJson))
            {
                var wrapper = BsonDocument.Parse("{\"p\":" + pipelineJson + "}");
                var stages  = wrapper["p"].AsBsonArray.OfType<BsonDocument>().ToList();

                foreach (var stage in stages)
                {
                    var stageName = stage.Names.FirstOrDefault() ?? "";
                    if (_blockedPipelineStages.Contains(stageName))
                        return $"Etapa '{stageName}' no permitida por seguridad.";
                }

                if (!string.IsNullOrWhiteSpace(filtroJson))
                {
                    var matchDoc = BsonDocument.Parse(filtroJson);
                    ConvertIsoDatesToBson(matchDoc);
                    stages.Insert(0, new BsonDocument("$match", matchDoc));
                }

                if (!stages.Any(s => s.Names.FirstOrDefault() == "$limit"))
                    stages.Add(new BsonDocument("$limit", limite));

                var cursor = await collection.AggregateAsync<BsonDocument>(stages.ToArray());
                var aggDocs = await cursor.ToListAsync();
                return aggDocs.Count > 0 ? BsonListToJson(aggDocs) : "Sin resultados.";
            }
            else
            {
                var filter = string.IsNullOrWhiteSpace(filtroJson)
                    ? new BsonDocument()
                    : BsonDocument.Parse(filtroJson);
                ConvertIsoDatesToBson(filter);

                var docs = await collection.Find(filter).Limit(limite).ToListAsync();
                return docs.Count > 0 ? BsonListToJson(docs) : "Sin resultados para los filtros indicados.";
            }
        }
        catch (Exception ex)
        {
            return $"Error en consulta libre: {ex.Message}";
        }
    }

    private static void ConvertIsoDatesToBson(BsonDocument doc)
    {
        foreach (var key in doc.Names.ToList())
        {
            var val = doc[key];
            if (val is BsonString s && TryParseIsoDate(s.Value, out var dt))
                doc[key] = new BsonDateTime(dt);
            else if (val is BsonDocument nested)
                ConvertIsoDatesToBson(nested);
            else if (val is BsonArray arr)
                ConvertIsoDatesToBson(arr);
        }
    }

    private static void ConvertIsoDatesToBson(BsonArray arr)
    {
        for (int i = 0; i < arr.Count; i++)
        {
            if (arr[i] is BsonString s && TryParseIsoDate(s.Value, out var dt))
                arr[i] = new BsonDateTime(dt);
            else if (arr[i] is BsonDocument doc)
                ConvertIsoDatesToBson(doc);
            else if (arr[i] is BsonArray nested)
                ConvertIsoDatesToBson(nested);
        }
    }

    private static bool TryParseIsoDate(string s, out DateTime dt)
    {
        dt = default;
        return s.Length >= 10 && DateTime.TryParseExact(
            s, ["yyyy-MM-dd", "yyyy-MM-ddTHH:mm:ssZ", "yyyy-MM-ddTHH:mm:ss.fffZ"],
            System.Globalization.CultureInfo.InvariantCulture,
            System.Globalization.DateTimeStyles.AssumeUniversal | System.Globalization.DateTimeStyles.AdjustToUniversal,
            out dt);
    }

    private static string BsonListToJson(List<BsonDocument> docs)
    {
        var settings = new JsonWriterSettings { OutputMode = JsonOutputMode.RelaxedExtendedJson };
        var sb = new StringBuilder("[");
        for (int i = 0; i < docs.Count; i++)
        {
            if (i > 0) sb.Append(',');
            var d = docs[i].DeepClone().AsBsonDocument;
            if (d.Contains("_id")) d.Remove("_id");
            sb.Append(d.ToJson(settings));
        }
        sb.Append(']');
        return sb.ToString();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static DateTime ParseDate(string? value, DateTime defaultValue)
    {
        if (string.IsNullOrWhiteSpace(value)) return defaultValue;
        return DateTime.TryParse(value, out var d) ? DateTime.SpecifyKind(d, DateTimeKind.Utc) : defaultValue;
    }

    // Gemini exige tipos en MAYÚSCULAS (STRING, NUMBER, OBJECT…) y usa "parameters" en lugar de "input_schema"
    private static object[] BuildGeminiTools() =>
    [
        new
        {
            name = "query_produccion",
            description = "Consulta resúmenes de producción diaria por planta. Retorna cantidades, costos, % merma y estado de calidad.",
            parameters = new
            {
                type = "OBJECT",
                properties = new
                {
                    planta_clave = new { type = "STRING", description = "Clave de la planta (ej: PL01). Omitir para todas." },
                    fecha_inicio = new { type = "STRING", description = "Fecha inicio YYYY-MM-DD. Default: hace 30 días." },
                    fecha_fin    = new { type = "STRING", description = "Fecha fin YYYY-MM-DD. Default: hoy." },
                    agrupar_por  = new { type = "STRING", description = "Agrupación: planta | mes | dia. Default: planta." }
                }
            }
        },
        new
        {
            name = "query_paros",
            description = "Consulta paros no programados: causas, duración, costo e impacto en producción.",
            parameters = new
            {
                type = "OBJECT",
                properties = new
                {
                    planta_clave = new { type = "STRING", description = "Clave de la planta. Omitir para todas." },
                    fecha_inicio = new { type = "STRING", description = "Fecha inicio YYYY-MM-DD. Default: hace 90 días." },
                    fecha_fin    = new { type = "STRING", description = "Fecha fin YYYY-MM-DD. Default: hoy." },
                    agrupar_por  = new { type = "STRING", description = "Agrupación: causa | planta. Default: causa." }
                }
            }
        },
        new
        {
            name = "query_mezclado",
            description = "Consulta el mezclado diario de corrientes por planta: tipo de corriente, cantidad en kg y calidad.",
            parameters = new
            {
                type = "OBJECT",
                properties = new
                {
                    planta_clave = new { type = "STRING", description = "Clave de la planta. Omitir para todas." },
                    fecha_inicio = new { type = "STRING", description = "Fecha inicio YYYY-MM-DD. Default: hace 30 días." },
                    fecha_fin    = new { type = "STRING", description = "Fecha fin YYYY-MM-DD. Default: hoy." }
                }
            }
        },
        new
        {
            name = "query_precios",
            description = "Consulta precios reales de productos: precio neto, costo, margen % e índice base 100.",
            parameters = new
            {
                type = "OBJECT",
                properties = new
                {
                    codigo       = new { type = "STRING", description = "Código del producto. Omitir para todos." },
                    categoria    = new { type = "STRING", description = "Categoría del producto. Omitir para todas." },
                    fecha_inicio = new { type = "STRING", description = "Fecha inicio YYYY-MM-DD. Default: hace 90 días." },
                    fecha_fin    = new { type = "STRING", description = "Fecha fin YYYY-MM-DD. Default: hoy." }
                }
            }
        },
        new
        {
            name = "query_catalog",
            description = "Obtiene catálogos maestros: plantas, productos, corrientes, proveedores, sitios, tanques, rutas, vendedores o clientes.",
            parameters = new
            {
                type = "OBJECT",
                properties = new
                {
                    tipo = new { type = "STRING", description = "Tipo: plantas | productos | corrientes | proveedores | sitios | tanques | rutas | vendedores | clientes." }
                },
                required = new[] { "tipo" }
            }
        },
        new
        {
            name = "query_programa_ventas",
            description = "Compara el programa (forecast) de ventas contra las ventas reales. Cruza plan vs real por vendedor, cliente, canal, producto o mes. Muestra cumplimiento %, desviación MXN, margen y comisión planeada.",
            parameters = new
            {
                type = "OBJECT",
                properties = new
                {
                    fecha_inicio    = new { type = "STRING", description = "Fecha inicio YYYY-MM-DD. Default: hace 90 días." },
                    fecha_fin       = new { type = "STRING", description = "Fecha fin YYYY-MM-DD. Default: hoy." },
                    agrupar_por     = new { type = "STRING", description = "Agrupación: vendedor | cliente | canal | producto | mes. Default: vendedor." },
                    vendedor_codigo = new { type = "STRING", description = "Filtrar por código exacto de vendedor." },
                    cliente_codigo  = new { type = "STRING", description = "Filtrar por código exacto de cliente." },
                    canal           = new { type = "STRING", description = "Canal: directo | distribuidor | exportacion | mostrador." },
                    producto_codigo = new { type = "STRING", description = "Filtrar por código de producto." }
                }
            }
        },
        new
        {
            name = "query_ventas",
            description = "Consulta transacciones de venta: ingresos, margen, cantidad despachada, descuentos y flete por producto, cliente, mes o estatus.",
            parameters = new
            {
                type = "OBJECT",
                properties = new
                {
                    fecha_inicio    = new { type = "STRING", description = "Fecha inicio YYYY-MM-DD. Default: hace 30 días." },
                    fecha_fin       = new { type = "STRING", description = "Fecha fin YYYY-MM-DD. Default: hoy." },
                    agrupar_por     = new { type = "STRING", description = "Agrupación: producto | cliente | mes | estatus. Default: producto." },
                    cliente_nombre  = new { type = "STRING", description = "Filtro por nombre o fragmento del cliente." },
                    producto_codigo = new { type = "STRING", description = "Filtro por código exacto del producto." },
                    estatus         = new { type = "STRING", description = "Estatus: entregada | facturada." }
                }
            }
        },
        new
        {
            name = "query_compras",
            description = "Consulta órdenes de compra de materia prima: proveedor, producto, cantidades, precios e IVA.",
            parameters = new
            {
                type = "OBJECT",
                properties = new
                {
                    fecha_inicio    = new { type = "STRING", description = "Fecha inicio YYYY-MM-DD. Default: hace 90 días." },
                    fecha_fin       = new { type = "STRING", description = "Fecha fin YYYY-MM-DD. Default: hoy." },
                    agrupar_por     = new { type = "STRING", description = "Agrupación: proveedor | producto | planta | mes. Default: proveedor." },
                    planta_clave    = new { type = "STRING", description = "Filtrar por clave de planta." },
                    producto_codigo = new { type = "STRING", description = "Filtrar por código de producto." }
                }
            }
        },
        new
        {
            name = "query_ordenes",
            description = "Resumen diario de OV y OC: número de órdenes, volumen, ingresos, costo MP y margen por día, semana o mes.",
            parameters = new
            {
                type = "OBJECT",
                properties = new
                {
                    fecha_inicio = new { type = "STRING", description = "Fecha inicio YYYY-MM-DD. Default: hace 30 días." },
                    fecha_fin    = new { type = "STRING", description = "Fecha fin YYYY-MM-DD. Default: hoy." },
                    agrupar_por  = new { type = "STRING", description = "Agrupación: dia | semana | mes. Default: dia." }
                }
            }
        },
        new
        {
            name = "query_libre",
            description = "Consulta ad-hoc libre contra cualquier colección de MongoDB Atlas. Úsala cuando necesites lógica de filtrado o agrupación no cubierta por las otras herramientas. Puedes especificar un filtro simple o un pipeline de agregación completo.",
            parameters = new
            {
                type = "OBJECT",
                properties = new
                {
                    coleccion = new
                    {
                        type = "STRING",
                        description = "Nombre exacto de la colección. Opciones de operaciones: resumen_produccion_diaria_planta, paros_no_programados, resumen_mezclado_diario, resumen_precios_reales, transacciones, ordenes_compra_venta, resumen_diario_ordenes, programa_ventas. Opciones de catálogo: cat_plantas, cat_productos, cat_clientes, vendedores, cat_proveedores, cat_corrientes, cat_rutas, cat_tanques, cat_sitios, cat_precios, cat_trabajadores."
                    },
                    filtro = new
                    {
                        type = "STRING",
                        description = "Filtro MongoDB como JSON string. Las fechas deben estar en formato 'YYYY-MM-DD'. Ej: '{\"tipo\":\"venta\",\"fecha\":{\"$gte\":\"2025-01-01\"}}'. Si también proporcionas pipeline, este filtro se agrega como primer $match automáticamente."
                    },
                    pipeline = new
                    {
                        type = "STRING",
                        description = "Pipeline de agregación como JSON array string. Etapas permitidas: $match $group $project $sort $limit $skip $unwind $addFields $lookup $count $sortByCount $bucket $facet $replaceRoot $set $unset. Ej: '[{\"$group\":{\"_id\":\"$planta_clave\",\"total_kg\":{\"$sum\":\"$cantidad_kg\"}}},{\"$sort\":{\"total_kg\":-1}}]'."
                    },
                    limite = new
                    {
                        type = "NUMBER",
                        description = "Máximo de documentos a retornar. Default: 50, máximo: 200."
                    }
                },
                required = new[] { "coleccion" }
            }
        }
    ];
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using anDora.Api.Data;
using anDora.Api.Models.Catalog;

namespace anDora.Api.Controllers
{
    [ApiController]
    [Route("api/catalog")]
    [Authorize]
    public class CatalogController : ControllerBase
    {
        private readonly CatalogContext _ctx;

        public CatalogController(CatalogContext ctx) => _ctx = ctx;

        // ═══════════════════════════════════════════════════════
        // SITIOS
        // ═══════════════════════════════════════════════════════

        [HttpGet("sitios")]
        public async Task<IActionResult> GetSitios()
        {
            var items = await _ctx.Sitios.Find(_ => true).SortBy(x => x.Nombre).ToListAsync();
            return Ok(items);
        }

        [HttpPost("sitios")]
        public async Task<IActionResult> CreateSitio([FromBody] Sitio item)
        {
            item.Id = null;
            item.CreadoEn = DateTime.UtcNow;
            await _ctx.Sitios.InsertOneAsync(item);
            return Ok(item);
        }

        [HttpPut("sitios/{id}")]
        public async Task<IActionResult> UpdateSitio(string id, [FromBody] Sitio item)
        {
            item.Id = id;
            await _ctx.Sitios.ReplaceOneAsync(x => x.Id == id, item);
            return Ok(item);
        }

        [HttpDelete("sitios/{id}")]
        public async Task<IActionResult> DeleteSitio(string id)
        {
            await _ctx.Sitios.DeleteOneAsync(x => x.Id == id);
            return Ok();
        }

        // ═══════════════════════════════════════════════════════
        // PLANTAS
        // ═══════════════════════════════════════════════════════

        [HttpGet("plantas")]
        public async Task<IActionResult> GetPlantas()
        {
            var items = await _ctx.Plantas.Find(_ => true).SortBy(x => x.Clave).ToListAsync();
            return Ok(items);
        }

        [HttpPost("plantas")]
        public async Task<IActionResult> CreatePlanta([FromBody] Planta item)
        {
            item.Id = null;
            item.CreadoEn = DateTime.UtcNow;
            await _ctx.Plantas.InsertOneAsync(item);
            return Ok(item);
        }

        [HttpPut("plantas/{id}")]
        public async Task<IActionResult> UpdatePlanta(string id, [FromBody] Planta item)
        {
            item.Id = id;
            await _ctx.Plantas.ReplaceOneAsync(x => x.Id == id, item);
            return Ok(item);
        }

        [HttpDelete("plantas/{id}")]
        public async Task<IActionResult> DeletePlanta(string id)
        {
            await _ctx.Plantas.DeleteOneAsync(x => x.Id == id);
            return Ok();
        }

        // ═══════════════════════════════════════════════════════
        // TRABAJADORES
        // ═══════════════════════════════════════════════════════

        [HttpGet("trabajadores")]
        public async Task<IActionResult> GetTrabajadores()
        {
            var items = await _ctx.Trabajadores.Find(_ => true).SortBy(x => x.Apellido).ToListAsync();
            return Ok(items);
        }

        [HttpPost("trabajadores")]
        public async Task<IActionResult> CreateTrabajador([FromBody] Trabajador item)
        {
            item.Id = null;
            item.CreadoEn = DateTime.UtcNow;
            await _ctx.Trabajadores.InsertOneAsync(item);
            return Ok(item);
        }

        [HttpPut("trabajadores/{id}")]
        public async Task<IActionResult> UpdateTrabajador(string id, [FromBody] Trabajador item)
        {
            item.Id = id;
            await _ctx.Trabajadores.ReplaceOneAsync(x => x.Id == id, item);
            return Ok(item);
        }

        [HttpDelete("trabajadores/{id}")]
        public async Task<IActionResult> DeleteTrabajador(string id)
        {
            await _ctx.Trabajadores.DeleteOneAsync(x => x.Id == id);
            return Ok();
        }

        // ═══════════════════════════════════════════════════════
        // PROVEEDORES
        // ═══════════════════════════════════════════════════════

        [HttpGet("proveedores")]
        public async Task<IActionResult> GetProveedores()
        {
            var items = await _ctx.Proveedores.Find(_ => true).SortBy(x => x.Nombre).ToListAsync();
            return Ok(items);
        }

        [HttpPost("proveedores")]
        public async Task<IActionResult> CreateProveedor([FromBody] Proveedor item)
        {
            item.Id = null;
            item.CreadoEn = DateTime.UtcNow;
            await _ctx.Proveedores.InsertOneAsync(item);
            return Ok(item);
        }

        [HttpPut("proveedores/{id}")]
        public async Task<IActionResult> UpdateProveedor(string id, [FromBody] Proveedor item)
        {
            item.Id = id;
            await _ctx.Proveedores.ReplaceOneAsync(x => x.Id == id, item);
            return Ok(item);
        }

        [HttpDelete("proveedores/{id}")]
        public async Task<IActionResult> DeleteProveedor(string id)
        {
            await _ctx.Proveedores.DeleteOneAsync(x => x.Id == id);
            return Ok();
        }

        // ═══════════════════════════════════════════════════════
        // TANQUES
        // ═══════════════════════════════════════════════════════

        [HttpGet("tanques")]
        public async Task<IActionResult> GetTanques()
        {
            var items = await _ctx.Tanques.Find(_ => true).SortBy(x => x.Clave).ToListAsync();
            return Ok(items);
        }

        [HttpPost("tanques")]
        public async Task<IActionResult> CreateTanque([FromBody] Tanque item)
        {
            item.Id = null;
            item.CreadoEn = DateTime.UtcNow;
            await _ctx.Tanques.InsertOneAsync(item);
            return Ok(item);
        }

        [HttpPut("tanques/{id}")]
        public async Task<IActionResult> UpdateTanque(string id, [FromBody] Tanque item)
        {
            item.Id = id;
            await _ctx.Tanques.ReplaceOneAsync(x => x.Id == id, item);
            return Ok(item);
        }

        [HttpDelete("tanques/{id}")]
        public async Task<IActionResult> DeleteTanque(string id)
        {
            await _ctx.Tanques.DeleteOneAsync(x => x.Id == id);
            return Ok();
        }

        // ═══════════════════════════════════════════════════════
        // RUTAS
        // ═══════════════════════════════════════════════════════

        [HttpGet("rutas")]
        public async Task<IActionResult> GetRutas()
        {
            var items = await _ctx.Rutas.Find(_ => true).SortBy(x => x.Clave).ToListAsync();
            return Ok(items);
        }

        [HttpPost("rutas")]
        public async Task<IActionResult> CreateRuta([FromBody] Ruta item)
        {
            item.Id = null;
            item.CreadoEn = DateTime.UtcNow;
            await _ctx.Rutas.InsertOneAsync(item);
            return Ok(item);
        }

        [HttpPut("rutas/{id}")]
        public async Task<IActionResult> UpdateRuta(string id, [FromBody] Ruta item)
        {
            item.Id = id;
            await _ctx.Rutas.ReplaceOneAsync(x => x.Id == id, item);
            return Ok(item);
        }

        [HttpDelete("rutas/{id}")]
        public async Task<IActionResult> DeleteRuta(string id)
        {
            await _ctx.Rutas.DeleteOneAsync(x => x.Id == id);
            return Ok();
        }

        // ═══════════════════════════════════════════════════════
        // PRODUCTOS
        // ═══════════════════════════════════════════════════════

        [HttpGet("productos")]
        public async Task<IActionResult> GetProductos()
        {
            var items = await _ctx.Productos.Find(_ => true).SortBy(x => x.Clave).ToListAsync();
            return Ok(items);
        }

        [HttpPost("productos")]
        public async Task<IActionResult> CreateProducto([FromBody] Producto item)
        {
            item.Id = null;
            item.CreadoEn = DateTime.UtcNow;
            await _ctx.Productos.InsertOneAsync(item);
            return Ok(item);
        }

        [HttpPut("productos/{id}")]
        public async Task<IActionResult> UpdateProducto(string id, [FromBody] Producto item)
        {
            item.Id = id;
            await _ctx.Productos.ReplaceOneAsync(x => x.Id == id, item);
            return Ok(item);
        }

        [HttpDelete("productos/{id}")]
        public async Task<IActionResult> DeleteProducto(string id)
        {
            await _ctx.Productos.DeleteOneAsync(x => x.Id == id);
            return Ok();
        }

        // ═══════════════════════════════════════════════════════
        // CORRIENTES
        // ═══════════════════════════════════════════════════════

        [HttpGet("corrientes")]
        public async Task<IActionResult> GetCorrientes()
        {
            var items = await _ctx.Corrientes.Find(_ => true).SortBy(x => x.Clave).ToListAsync();
            return Ok(items);
        }

        [HttpPost("corrientes")]
        public async Task<IActionResult> CreateCorriente([FromBody] Corriente item)
        {
            item.Id = null;
            item.CreadoEn = DateTime.UtcNow;
            await _ctx.Corrientes.InsertOneAsync(item);
            return Ok(item);
        }

        [HttpPut("corrientes/{id}")]
        public async Task<IActionResult> UpdateCorriente(string id, [FromBody] Corriente item)
        {
            item.Id = id;
            await _ctx.Corrientes.ReplaceOneAsync(x => x.Id == id, item);
            return Ok(item);
        }

        [HttpDelete("corrientes/{id}")]
        public async Task<IActionResult> DeleteCorriente(string id)
        {
            await _ctx.Corrientes.DeleteOneAsync(x => x.Id == id);
            return Ok();
        }

        // ═══════════════════════════════════════════════════════
        // ÁRBOL JERÁRQUICO  Company → Sitio → Planta → Tanques / Corrientes
        // ═══════════════════════════════════════════════════════

        [HttpGet("tree")]
        public async Task<IActionResult> GetTree()
        {
            var sitios     = await _ctx.Sitios.Find(x => x.Activo).SortBy(x => x.Nombre).ToListAsync();
            var plantas    = await _ctx.Plantas.Find(x => x.Activo).SortBy(x => x.Nombre).ToListAsync();
            var tanques    = await _ctx.Tanques.Find(x => x.Activo).SortBy(x => x.Clave).ToListAsync();
            var corrientes = await _ctx.Corrientes.Find(x => x.Activo).SortBy(x => x.Clave).ToListAsync();

            var tree = new List<object>();

            // ── Sitios → Plantas → Tanques ────────────────────────────────
            foreach (var s in sitios)
            {
                var plantaNodes = new List<object>();
                foreach (var p in plantas.Where(p => p.SitioId == s.Id))
                {
                    var tanqueNodes = tanques
                        .Where(t => t.PlantaId == p.Id)
                        .Select(t => (object)new
                        {
                            id           = $"tanque-{t.Id}",
                            text         = $"{t.Clave} · {t.Nombre}",
                            type         = "tanque",
                            tipoProducto = t.TipoProducto,
                            capacidadM3  = t.CapacidadM3,
                            material     = t.Material,
                        })
                        .ToList();

                    plantaNodes.Add(new
                    {
                        id           = $"planta-{p.Id}",
                        text         = p.Nombre,
                        type         = "planta",
                        clave        = p.Clave,
                        tipoPlanta   = p.Tipo,
                        capacidadTon = p.CapacidadTon,
                        unidad       = p.Unidad,
                        items        = tanqueNodes,
                    });
                }

                tree.Add(new
                {
                    id        = $"sitio-{s.Id}",
                    text      = s.Nombre,
                    type      = "sitio",
                    clave     = s.Clave,
                    ubicacion = s.Ubicacion,
                    estado    = s.Estado,
                    items     = plantaNodes,
                });
            }

            // ── Corrientes agrupadas por tipo (sin planta específica) ─────
            if (corrientes.Count > 0)
            {
                var grupos = corrientes
                    .GroupBy(c => c.TipoCorriente ?? "General")
                    .OrderBy(g => g.Key)
                    .Select(g => (object)new
                    {
                        id   = $"corrtype-{g.Key.ToLower().Replace(" ", "-")}",
                        text = g.Key,
                        type = "corriente-tipo",
                        items = g.Select(c => (object)new
                        {
                            id             = $"corriente-{c.Id}",
                            text           = $"{c.Clave} · {c.Nombre}",
                            type           = "corriente",
                            tipoCorriente  = c.TipoCorriente,
                            unidad         = c.Unidad,
                            productoNombre = c.ProductoNombre,
                        }).ToList(),
                    })
                    .ToList();

                tree.Add(new
                {
                    id    = "seccion-corrientes",
                    text  = "Corrientes de Proceso",
                    type  = "seccion",
                    items = grupos,
                });
            }

            return Ok(tree);
        }

        // ═══════════════════════════════════════════════════════
        // PRECIOS
        // ═══════════════════════════════════════════════════════

        [HttpGet("precios")]
        public async Task<IActionResult> GetPrecios()
        {
            var items = await _ctx.Precios.Find(_ => true).SortBy(x => x.Nombre).ToListAsync();
            return Ok(items);
        }

        [HttpPost("precios")]
        public async Task<IActionResult> CreatePrecio([FromBody] PrecioCatalogo item)
        {
            item.Id = null;
            item.CreadoEn = DateTime.UtcNow;
            await _ctx.Precios.InsertOneAsync(item);
            return Ok(item);
        }

        [HttpPut("precios/{id}")]
        public async Task<IActionResult> UpdatePrecio(string id, [FromBody] PrecioCatalogo item)
        {
            item.Id = id;
            await _ctx.Precios.ReplaceOneAsync(x => x.Id == id, item);
            return Ok(item);
        }

        [HttpDelete("precios/{id}")]
        public async Task<IActionResult> DeletePrecio(string id)
        {
            await _ctx.Precios.DeleteOneAsync(x => x.Id == id);
            return Ok();
        }
    }
}

// DashboardDataProviders.cs
using anDora.Api.Data;
using DevExpress.DashboardCommon;
using MongoDB.Driver;

namespace anDora.Api.Services
{
    // ── Service locator (sólo para ObjectDataSource de DevExpress) ──────────
    public static class AppServiceLocator
    {
        public static IServiceProvider? Services { get; set; }

        public static T GetRequired<T>() where T : notnull =>
            Services!.CreateScope().ServiceProvider.GetRequiredService<T>();
    }

    // ── DTOs planos que DevExpress puede leer ────────────────────────────────

    public class ProduccionRow
    {
        public DateTime Fecha { get; set; }
        public int Anio { get; set; }
        public int Mes { get; set; }
        public string PlantaClave { get; set; } = "";
        public string PlantaNombre { get; set; } = "";
        public bool EsProductoFinal { get; set; }
        public double CantidadKg { get; set; }
        public double CostoTotalMxn { get; set; }
        public double MermaPct { get; set; }
        public bool CalidadAprobado { get; set; }
    }

    public class ParoRow
    {
        public DateTime Fecha { get; set; }
        public int Anio { get; set; }
        public int Mes { get; set; }
        public string PlantaClave { get; set; } = "";
        public string PlantaNombre { get; set; } = "";
        public string Causa { get; set; } = "";
        public double DuracionHoras { get; set; }
        public double ProduccionPerdidaKg { get; set; }
        public double CostoParoMxn { get; set; }
        public bool ParoResuelto { get; set; }
    }

    public class MezcladoRow
    {
        public DateTime Fecha { get; set; }
        public string PlantaClave { get; set; } = "";
        public string TipoCorriente { get; set; } = "";
        public double CantidadKg { get; set; }
        public bool CalidadOk { get; set; }
    }

    public class PrecioRow
    {
        public DateTime Fecha { get; set; }
        public int Anio { get; set; }
        public int Mes { get; set; }
        public string Nombre { get; set; } = "";
        public string Categoria { get; set; } = "";
        public double PrecioNetoMxn { get; set; }
        public double CostoMxn { get; set; }
        public double MargenPct { get; set; }
        public double IndiceBase100 { get; set; }
    }

    // ── Providers (DevExpress llama al método GetData() ──────────────────────

    public class ProduccionDataProvider
    {
        public IEnumerable<ProduccionRow> GetData()
        {
            var ctx = AppServiceLocator.GetRequired<OperationsContext>();
            return ctx.ResumenProduccion
                .Find(_ => true)
                .ToList()
                .Select(d => new ProduccionRow
                {
                    Fecha            = d.FechaDia,
                    Anio             = d.Anio,
                    Mes              = d.Mes,
                    PlantaClave      = d.PlantaClave,
                    PlantaNombre     = d.PlantaNombre,
                    EsProductoFinal  = d.EsProductoFinal,
                    CantidadKg       = d.Cantidad,
                    CostoTotalMxn    = d.CostoTotalMxn,
                    MermaPct         = d.MermaPct,
                    CalidadAprobado  = d.CalidadAprobado
                });
        }
    }

    public class ParosDataProvider
    {
        public IEnumerable<ParoRow> GetData()
        {
            var ctx = AppServiceLocator.GetRequired<OperationsContext>();
            return ctx.ParosNoProgramados
                .Find(_ => true)
                .ToList()
                .Select(d => new ParoRow
                {
                    Fecha               = d.Fecha,
                    Anio                = d.Anio,
                    Mes                 = d.Mes,
                    PlantaClave         = d.PlantaClave,
                    PlantaNombre        = d.PlantaNombre,
                    Causa               = d.Causa,
                    DuracionHoras       = d.DuracionHoras,
                    ProduccionPerdidaKg = d.ProduccionPerdidaKg,
                    CostoParoMxn        = d.CostoParoMxn,
                    ParoResuelto        = d.ParoResuelto
                });
        }
    }

    public class MezcladoDataProvider
    {
        public IEnumerable<MezcladoRow> GetData()
        {
            var ctx = AppServiceLocator.GetRequired<OperationsContext>();
            return ctx.ResumenMezclado
                .Find(_ => true)
                .ToList()
                .Select(d => new MezcladoRow
                {
                    Fecha         = d.FechaDia,
                    PlantaClave   = d.PlantaClave,
                    TipoCorriente = d.TipoCorriente,
                    CantidadKg    = d.CantidadKg,
                    CalidadOk     = d.CalidadOk
                });
        }
    }

    public class PreciosDataProvider
    {
        public IEnumerable<PrecioRow> GetData()
        {
            var ctx = AppServiceLocator.GetRequired<OperationsContext>();
            return ctx.ResumenPrecios
                .Find(_ => true)
                .ToList()
                .Select(d => new PrecioRow
                {
                    Fecha         = d.Fecha,
                    Anio          = d.Anio,
                    Mes           = d.Mes,
                    Nombre        = d.Nombre,
                    Categoria     = d.Categoria,
                    PrecioNetoMxn = d.PrecioNetoMxn,
                    CostoMxn      = d.CostoMxn,
                    MargenPct     = d.MargenPct,
                    IndiceBase100 = d.IndiceBase100
                });
        }
    }

    // ── Servicio que DevExpress llama para obtener datos de cada fuente ───────
    public class MongoObjectDataSourceFillService : IObjectDataSourceCustomFillService
    {
        public object GetData(DashboardObjectDataSource dataSource, ObjectDataSourceFillParameters parameters)
        {
            return dataSource.DataId switch
            {
                "produccion_diaria" => new ProduccionDataProvider().GetData().ToList(),
                "paros"             => new ParosDataProvider().GetData().ToList(),
                "mezclado_diario"   => new MezcladoDataProvider().GetData().ToList(),
                "precios_reales"    => new PreciosDataProvider().GetData().ToList(),
                _                   => new List<object>()
            };
        }
    }
}

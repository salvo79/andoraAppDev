// OperationsContext.cs
using MongoDB.Driver;
using anDora.Api.Models.Operations;

namespace anDora.Api.Data
{
    public class OperationsContext
    {
        private readonly IMongoDatabase _db;

        public OperationsContext(IConfiguration configuration)
        {
            var client = new MongoClient(configuration["MongoSettings:ConnectionString"]);
            _db = client.GetDatabase(configuration["MongoSettings:OperationsDb"]);
        }

        public IMongoCollection<ResumenProduccionDiariaPlanta> ResumenProduccion =>
            _db.GetCollection<ResumenProduccionDiariaPlanta>("resumen_produccion_diaria_planta");

        public IMongoCollection<ParoNoProgramado> ParosNoProgramados =>
            _db.GetCollection<ParoNoProgramado>("paros_no_programados");

        public IMongoCollection<ResumenMezcladoDiario> ResumenMezclado =>
            _db.GetCollection<ResumenMezcladoDiario>("resumen_mezclado_diario");

        public IMongoCollection<ResumenPreciosReales> ResumenPrecios =>
            _db.GetCollection<ResumenPreciosReales>("resumen_precios_reales");

        public IMongoCollection<Transaccion> Transacciones =>
            _db.GetCollection<Transaccion>("transacciones");

        public IMongoCollection<OrdenCompraVenta> OrdenesCompraVenta =>
            _db.GetCollection<OrdenCompraVenta>("ordenes_compra_venta");

        public IMongoCollection<ResumenDiarioOrdenes> ResumenDiarioOrdenes =>
            _db.GetCollection<ResumenDiarioOrdenes>("resumen_diario_ordenes");

        public IMongoCollection<ProgramaVenta> ProgramaVentas =>
            _db.GetCollection<ProgramaVenta>("programa_ventas");
    }
}

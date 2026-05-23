using MongoDB.Driver;
using anDora.Api.Models.Catalog;

namespace anDora.Api.Data
{
    public class CatalogContext
    {
        private readonly IMongoDatabase _db;

        public CatalogContext(IConfiguration configuration)
        {
            var client = new MongoClient(configuration["MongoSettings:ConnectionString"]);
            _db = client.GetDatabase(configuration["MongoSettings:OperationsDb"]);
        }

        public IMongoCollection<Sitio>         Sitios       => _db.GetCollection<Sitio>("cat_sitios");
        public IMongoCollection<Planta>        Plantas      => _db.GetCollection<Planta>("cat_plantas");
        public IMongoCollection<Trabajador>    Trabajadores => _db.GetCollection<Trabajador>("cat_trabajadores");
        public IMongoCollection<Proveedor>     Proveedores  => _db.GetCollection<Proveedor>("cat_proveedores");
        public IMongoCollection<Tanque>        Tanques      => _db.GetCollection<Tanque>("cat_tanques");
        public IMongoCollection<Ruta>          Rutas        => _db.GetCollection<Ruta>("cat_rutas");
        public IMongoCollection<Producto>      Productos    => _db.GetCollection<Producto>("cat_productos");
        public IMongoCollection<Corriente>     Corrientes   => _db.GetCollection<Corriente>("cat_corrientes");
        public IMongoCollection<PrecioCatalogo> Precios     => _db.GetCollection<PrecioCatalogo>("cat_precios");
    }
}

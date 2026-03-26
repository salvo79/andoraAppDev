//MongoContext.cs

using MongoDB.Driver;
using anDora.Api.Models;

namespace anDora.Api.Data
{
    public class MongoContext
    {
        private readonly IMongoDatabase _database;

        public MongoContext(IConfiguration configuration)
        {
            var client = new MongoClient(configuration["MongoSettings:ConnectionString"]);
            _database = client.GetDatabase(configuration["MongoSettings:UserDb"]);
        }

        public IMongoCollection<User> Users =>
            _database.GetCollection<User>("users");

                    // ← AGREGA ESTA LÍNEA
        public IMongoCollection<Tenant> Tenants =>
            _database.GetCollection<Tenant>("tenants");
    }
}
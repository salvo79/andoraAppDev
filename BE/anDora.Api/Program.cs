// Program.cs completo corregido
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using anDora.Api.Data;
using DevExpress.DashboardAspNetCore;
using DevExpress.DashboardCommon;
using DevExpress.DashboardWeb;
using DevExpress.DataAccess.ConnectionParameters;
using DevExpress.DataAccess.MongoDB;
using Resend;

var builder = WebApplication.CreateBuilder(args);

// ===============================
// SERVICES
// ===============================
builder.Services.AddSingleton<MongoContext>();
builder.Services.AddSingleton<OperationsContext>();
builder.Services.AddSingleton<CatalogContext>();

// ── DevExpress Dashboard ───────────────────────────────────────────────────
var dashboardsPath = Path.Combine(builder.Environment.ContentRootPath, "Data", "Dashboards");
Directory.CreateDirectory(dashboardsPath);

builder.Services.AddControllers();

// ── DevExpress Dashboard via DI (API v24.2+) ──────────────────────────────
builder.Services.AddSingleton<DashboardConfigurator>(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    DashboardConfigurator.PassCredentials = true;
    var configurator = new DashboardConfigurator();

    configurator.SetDashboardStorage(new DashboardFileStorage(dashboardsPath));

    var mongoConnString = config["MongoSettings:ConnectionString"]!;
    var connParams = new MongoDBCustomConnectionParameters(mongoConnString);

    configurator.SetConnectionStringsProvider(
        new DevExpress.DashboardAspNetCore.DashboardConnectionStringsProvider(config));

    var storage = new DataSourceInMemoryStorage();

    MongoDBQuery MakeQuery(string db, string collection, string alias) =>
        new MongoDBQuery { DatabaseName = db, CollectionName = collection, Alias = alias };

    void RegisterMongo(string id, string name, string collection, string alias)
    {
        var ds = new DashboardMongoDBDataSource(name);
        ds.ConnectionName = "andoraDB";
        ds.ConnectionParameters = connParams;
        ds.Queries.Add(MakeQuery("andoraDB", collection, alias));
        storage.RegisterDataSource(id, ds.SaveToXml());
    }

    RegisterMongo("produccion_diaria", "Producción Diaria",  "resumen_produccion_diaria_planta", "Produccion");
    RegisterMongo("paros",             "Paros No Programados","paros_no_programados",             "Paros");
    RegisterMongo("mezclado_diario",   "Mezclado Diario",     "resumen_mezclado_diario",          "Mezclado");
    RegisterMongo("precios_reales",    "Precios Reales",      "resumen_precios_reales",           "Precios");

    configurator.SetDataSourceStorage(storage);
    return configurator;
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ===============================
// JWT CONFIGURATION
// ===============================
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer           = true,
        ValidateAudience         = true,
        ValidateLifetime         = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer              = jwtSettings["Issuer"],
        ValidAudience            = jwtSettings["Audience"],
        IssuerSigningKey         = new SymmetricSecurityKey(key)
    };
});

// ===============================
// RESEND + EMAIL SERVICE
// ===============================
builder.Services.AddHttpClient<ResendClient>();
builder.Services.Configure<ResendClientOptions>(o => {
    o.ApiToken = builder.Configuration["EmailSettings:ResendApiKey"]!;
});
builder.Services.AddTransient<IResend, ResendClient>();
builder.Services.AddTransient<anDora.Api.Services.EmailService>(); // ← solo aquí, sin duplicado

builder.Services.AddAuthorization();
builder.Services.AddSingleton<anDora.Api.Services.GcsService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "https://salvo79.github.io",
                "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});


var app = builder.Build();

// ===============================
// MIDDLEWARE
// ===============================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "anDora API v1");
        c.RoutePrefix = string.Empty;
    });
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ── DevExpress Dashboard endpoint ─────────────────────────────────────────
app.MapDashboardRoute("api/dashboard", "DefaultDashboard");

app.Run();
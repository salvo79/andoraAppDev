// Program.cs completo corregido
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using anDora.Api.Data;
using Resend;

var builder = WebApplication.CreateBuilder(args);

// ===============================
// SERVICES
// ===============================
builder.Services.AddControllers();
builder.Services.AddSingleton<MongoContext>();

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

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "https://salvo79.github.io",
                "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
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
app.Run();
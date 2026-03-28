// Services/EmailService.cs
using anDora.Api.Data;
using anDora.Api.Models;
using MongoDB.Driver;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace anDora.Api.Services
{
    public class EmailService
    {
        private readonly MongoContext _context;
        private readonly IConfiguration _config;

        public EmailService(MongoContext context, IConfiguration config)
        {
            _context = context;
            _config  = config;
        }

        public async Task SendVerificationEmailAsync(
            string toEmail, string username, string token, string? tenantSlug = null)
        {
            if (tenantSlug != null)
            {
                var tenant = await _context.Tenants
                    .Find(t => t.Slug == tenantSlug)
                    .FirstOrDefaultAsync();

                if (tenant?.EmailProvider != null)
                {
                    await SendWithTenantSmtp(toEmail, username, token, tenant.EmailProvider);
                    return;
                }
            }

            await SendWithResendApi(toEmail, username, token);
        }

        // ── Validar dominio permitido por tenant ──────────────────
        public async Task<bool> IsDomainAllowedAsync(string email, string tenantSlug)
        {
            var tenant = await _context.Tenants
                .Find(t => t.Slug == tenantSlug)
                .FirstOrDefaultAsync();

            if (tenant == null || tenant.AllowedDomains.Count == 0)
                return true;

            return tenant.AllowedDomains.Any(d =>
                email.EndsWith(d, StringComparison.OrdinalIgnoreCase));
        }

        // ── Verificar límite de usuarios por tenant ───────────────
        public async Task<bool> HasReachedUserLimitAsync(string tenantSlug)
        {
            var tenant = await _context.Tenants
                .Find(t => t.Slug == tenantSlug)
                .FirstOrDefaultAsync();

            if (tenant?.MaxUsers == null) return false;

            var count = await _context.Users
                .CountDocumentsAsync(u => u.TenantSlug == tenantSlug && u.IsActive);

            return count >= tenant.MaxUsers;
        }

        // ── Envío por Resend HTTP API directo ─────────────────────
        private async Task SendWithResendApi(string toEmail, string username, string token)
        {
            var s         = _config.GetSection("EmailSettings");
            var apiKey    = s["ResendApiKey"]!;
            var appUrl    = s["AppUrl"];
            var verifyUrl = $"{appUrl}/verify?token={token}";
            var fromEmail = s["FromEmail"] ?? "onboarding@resend.dev";
            var fromName  = s["FromName"]  ?? "AnDora";

            using var http = new HttpClient();
            http.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", apiKey);

            var payload = new
            {
                from    = $"{fromName} <{fromEmail}>",
                to      = new[] { toEmail },
                subject = "Activa tu cuenta en AnDora",
                html    = BuildEmailBody(username, verifyUrl)
            };

            var json     = JsonSerializer.Serialize(payload);
            var content  = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await http.PostAsync("https://api.resend.com/emails", content);
            var body     = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                throw new Exception($"Resend error {response.StatusCode}: {body}");
        }

        // ── Envío con SMTP propio del tenant ──────────────────────
        private async Task SendWithTenantSmtp(
            string toEmail, string username, string token, TenantEmailConfig c)
        {
            var appUrl    = _config["EmailSettings:AppUrl"];
            var verifyUrl = $"{appUrl}/verify?token={token}";

            using var smtp = new System.Net.Mail.SmtpClient(c.SmtpHost, c.SmtpPort)
            {
                UseDefaultCredentials = false,
                Credentials = new System.Net.NetworkCredential(c.SmtpUser, c.SmtpPass),
                EnableSsl   = c.EnableSsl,
                Timeout     = 10000
            };

            var mail = new System.Net.Mail.MailMessage
            {
                From       = new System.Net.Mail.MailAddress(c.FromEmail, c.FromName),
                Subject    = "Activa tu cuenta",
                IsBodyHtml = true,
                Body       = BuildEmailBody(username, verifyUrl)
            };

            mail.To.Add(toEmail);
            await smtp.SendMailAsync(mail);
        }

        // ── Template HTML ─────────────────────────────────────────
        private static string BuildEmailBody(string username, string verifyUrl) => $@"
        <!DOCTYPE html>
        <html>
        <body style=""font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 16px;color:#1a1a1a"">
            <h2 style=""font-size:24px;font-weight:600;margin-bottom:8px"">
                Hola {username} 👋
            </h2>
            <p style=""color:#555;margin-bottom:24px"">
                Gracias por registrarte en AnDora. Haz clic para activar tu cuenta.
            </p>
            <a href=""{verifyUrl}""
               style=""display:inline-block;background:#4F46E5;color:#fff;
                      padding:14px 28px;border-radius:8px;text-decoration:none;
                      font-weight:600;font-size:15px"">
                Activar mi cuenta
            </a>
            <p style=""margin-top:24px;color:#888;font-size:13px"">
                Este enlace expira en 24 horas.<br>
                Si no te registraste en AnDora, ignora este mensaje.
            </p>
            <hr style=""border:none;border-top:1px solid #eee;margin:32px 0""/>
            <p style=""color:#bbb;font-size:12px"">AnDora · no-reply@andora.com</p>
        </body>
        </html>";
    }
}
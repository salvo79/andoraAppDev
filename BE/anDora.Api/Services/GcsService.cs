// GcsService.cs
using System.Text;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Storage.V1;

namespace anDora.Api.Services
{
    public class GcsService
    {
        private readonly StorageClient? _storage;
        private readonly string _bucketName;

        public GcsService(IConfiguration config)
        {
            _bucketName = config["GcsSettings:BucketName"] ?? string.Empty;

            try
            {
                var credBase64 = Environment.GetEnvironmentVariable("GCS_CREDENTIALS_BASE64");
                if (!string.IsNullOrEmpty(credBase64))
                {
                    var credJson = Encoding.UTF8.GetString(Convert.FromBase64String(credBase64));
                    _storage = StorageClient.Create(GoogleCredential.FromJson(credJson));
                }
                else
                {
                    _storage = StorageClient.Create();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GcsService] WARNING: Could not initialize GCS client: {ex.Message}");
                _storage = null;
            }
        }

        public async Task<string> UploadProfilePhotoAsync(string username, Stream imageStream, string contentType)
        {
            if (_storage == null)
                throw new InvalidOperationException("GCS client not initialized. Check credentials.");

            var extension = contentType switch
            {
                "image/png"  => "png",
                "image/webp" => "webp",
                "image/gif"  => "gif",
                _            => "jpg"
            };

            var objectName = $"profile-photos/{username}/{Guid.NewGuid()}.{extension}";

            await _storage.UploadObjectAsync(
                bucket: _bucketName,
                objectName: objectName,
                contentType: contentType,
                source: imageStream
            );

            return $"https://storage.googleapis.com/{_bucketName}/{objectName}";
        }

        public async Task DeleteObjectAsync(string publicUrl)
        {
            if (_storage == null) return;

            var prefix = $"https://storage.googleapis.com/{_bucketName}/";
            if (!publicUrl.StartsWith(prefix)) return;

            var objectName = publicUrl[prefix.Length..];
            try { await _storage.DeleteObjectAsync(_bucketName, objectName); }
            catch { /* ignore if not found */ }
        }
    }
}

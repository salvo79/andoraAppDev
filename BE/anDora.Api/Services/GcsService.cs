// GcsService.cs
using System.Text;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Storage.V1;

namespace anDora.Api.Services
{
    public class GcsService
    {
        private readonly StorageClient _storage;
        private readonly string _bucketName;

        public GcsService(IConfiguration config)
        {
            var credBase64 = Environment.GetEnvironmentVariable("GCS_CREDENTIALS_BASE64");

            if (!string.IsNullOrEmpty(credBase64))
            {
                var credJson = Encoding.UTF8.GetString(Convert.FromBase64String(credBase64));
                var credential = GoogleCredential.FromJson(credJson);
                _storage = StorageClient.Create(credential);
            }
            else
            {
                // ADC: uses GOOGLE_APPLICATION_CREDENTIALS locally or attached SA on Cloud Run
                _storage = StorageClient.Create();
            }

            _bucketName = config["GcsSettings:BucketName"]!;
        }

        public async Task<string> UploadProfilePhotoAsync(string username, Stream imageStream, string contentType)
        {
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
            var prefix = $"https://storage.googleapis.com/{_bucketName}/";
            if (!publicUrl.StartsWith(prefix)) return;

            var objectName = publicUrl[prefix.Length..];
            try { await _storage.DeleteObjectAsync(_bucketName, objectName); }
            catch { /* ignore if not found */ }
        }
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using LiventCord.Data;
using LiventCord.Helpers;


namespace LiventCord.Controllers
{


    [ApiController]
    [Route("api")]
    public class UploadController : BaseController
    {
        private readonly AppDbContext _context;
        private readonly ILogger<UploadController> _logger;

        public UploadController(AppDbContext context, ILogger<UploadController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost("upload_img")]
        [Authorize]
        public async Task<IActionResult> UploadImage(IFormFile photo, string? guildId = null)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (photo == null || photo.Length == 0)
                return BadRequest("No file uploaded.");

            var extension = Path.GetExtension(photo.FileName).ToLowerInvariant();
            if (!FileExtensions.IsValidImageExtension(extension))
                return BadRequest("Invalid file type. Only images are allowed.");

            using var memoryStream = new MemoryStream();
            await photo.CopyToAsync(memoryStream);

            var content = memoryStream.ToArray();
            var fileId = Utils.CreateRandomId();

            if (!string.IsNullOrEmpty(guildId))
            {
                await SaveOrUpdateFile<GuildFile>(photo.FileName, content, extension, f => f.GuildId == guildId, guildId, fileId);
            }
            else
            {
                await SaveOrUpdateFile<ProfileFile>(photo.FileName, content, extension, f => f.UserId == userId, userId, fileId);
            }

            return Ok(new { fileId });
        }

        private async Task SaveOrUpdateFile<T>(
            string fileName,
            byte[] content,
            string extension,
            Func<T, bool> predicate,
            string? additionalField = null,
            string fileId = "") where T : FileBase
        {
            var existingFile = await _context.Set<T>().FirstOrDefaultAsync(f => predicate(f));
            if (existingFile != null)
            {
                existingFile.Content = content;
                existingFile.Extension = extension;
                _logger.LogInformation("Updated file: {FileId}, {FileName}, {AdditionalField}, {Extension}", existingFile.FileId, fileName, additionalField, extension);
            }
            else
            {
                T? newFile = Activator.CreateInstance(typeof(T), fileId, fileName, content, extension, additionalField) as T;

                if (newFile == null)
                    throw new InvalidOperationException($"Unable to create instance of {typeof(T).Name}.");
                

                _logger.LogInformation("Saved new file: {FileId}, {FileName}, {AdditionalField}, {Extension}", fileId, fileName, additionalField, extension);
                _context.Set<T>().Add(newFile);
            }

            await _context.SaveChangesAsync();
        }

    }


    
    [ApiController]
    [Route("")]
    public class FileController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly FileExtensionContentTypeProvider _fileTypeProvider;

        public FileController(AppDbContext context, FileExtensionContentTypeProvider fileTypeProvider)
        {
            _context = context;
            _fileTypeProvider = fileTypeProvider ?? new FileExtensionContentTypeProvider();
        }

        [HttpGet("{fileType}/{fileId}")]
        public async Task<IActionResult> GetFile(string fileType, string fileId)
        {
            if (FileExtensions.HasImageExtension(fileId))
                fileId = fileId.Substring(0, fileId.LastIndexOf('.'));

            object? file = fileType.ToLower() switch
            {
                "profiles" => await _context.ProfileFiles.FirstOrDefaultAsync(f => f.FileId == fileId),
                "attachments" => await _context.AttachmentFiles.FirstOrDefaultAsync(f => f.FileId == fileId),
                "emojis" => await _context.EmojiFiles.FirstOrDefaultAsync(f => f.FileId == fileId),
                "guilds" => await _context.GuildFiles.FirstOrDefaultAsync(f => f.FileId == fileId),
                _ => null
            };

            if (file == null)
                return NotFound(new { Error = "File not found." });

            return GetFileResult(file);
        }


        private IActionResult GetFileResult(dynamic file)
        {
            if (file == null)
                return NotFound(new { Error = "File not found." });

            if (!_fileTypeProvider.TryGetContentType(file.FileName, out string contentType))
                contentType = "application/octet-stream";

            Response.Headers.Add("Content-Disposition", $"inline; filename=\"{file.FileName}\"");
            return File(file.Content, contentType);
        }
    }



    
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using MyPostgresApp.Data;
using MyPostgresApp.Helpers;
using Microsoft.Extensions.Logging;

namespace MyPostgresApp.Controllers
{


    [ApiController]
    [Route("api")]
    public class UploadController : ControllerBase 
    {
        private readonly AppDbContext _context;
        private readonly FileExtensionContentTypeProvider _fileTypeProvider;
        private readonly ILogger<UploadController> _logger; 


        public UploadController(AppDbContext context, FileExtensionContentTypeProvider fileTypeProvider, ILogger<UploadController> logger)
        {
            _context = context;
            _fileTypeProvider = fileTypeProvider ?? new FileExtensionContentTypeProvider();
            _logger = logger; 
        }

        [HttpPost("upload_img")]
        [Authorize]
        public async Task<IActionResult> UploadImage(IFormFile photo, string guild_id = null)
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

            if (!string.IsNullOrEmpty(guild_id))
            {
                var existingFile = await _context.GuildFiles.FirstOrDefaultAsync(f => f.FileName == photo.FileName && f.GuildId == guild_id);
                if (existingFile != null)
                {
                    existingFile.Content = content;
                    existingFile.Extension = extension;
                    _logger.LogInformation("Updating existing GuildFile: {FileId}, {FileName}, {GuildId}, {Extension}", existingFile.FileId, photo.FileName, guild_id, extension);
                }
                else
                {
                    var guildFile = new GuildFile
                    {
                        FileId = fileId,
                        FileName = photo.FileName,
                        GuildId = guild_id,
                        Content = content,
                        Extension = extension
                    };
                    _logger.LogInformation("Saving new GuildFile: {FileId}, {FileName}, {GuildId}, {Extension}", fileId, photo.FileName, guild_id, extension);
                    _context.GuildFiles.Add(guildFile);
                }
            }
            else
            {
                var existingFile = await _context.ProfileFiles.FirstOrDefaultAsync(f => f.UserId == userId);
                if (existingFile != null)
                {
                    existingFile.Content = content;
                    existingFile.Extension = extension;
                    _logger.LogInformation("Updating existing ProfileFile: {FileId}, {FileName}, {UserId}, {Extension}", existingFile.FileId, photo.FileName, userId, extension);
                }
                else
                {
                    var profileFile = new ProfileFile
                    {
                        FileId = fileId,
                        FileName = photo.FileName,
                        UserId = userId,
                        Content = content,
                        Extension = extension
                    };
                    _logger.LogInformation("Saving new ProfileFile: {FileId}, {FileName}, {UserId}, {Extension}", fileId, photo.FileName, userId, extension);
                    _context.ProfileFiles.Add(profileFile);
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { fileId });
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



        [HttpGet("profiles/{fileId}")]
        public async Task<IActionResult> GetProfileFile(string fileId)
        {
            if (FileExtensions.HasImageExtension(fileId))
                fileId = fileId.Substring(0, fileId.LastIndexOf('.'));

            var file = await _context.ProfileFiles.FirstOrDefaultAsync(f => f.UserId == fileId);
            return GetFileResult(file);
        }

        [HttpGet("attachments/{fileId}")]
        public async Task<IActionResult> GetAttachmentFile(string fileId)
        {
            if (FileExtensions.HasImageExtension(fileId))
                fileId = fileId.Substring(0, fileId.LastIndexOf('.'));

            var file = await _context.AttachmentFiles.FirstOrDefaultAsync(f => f.FileId == fileId);
            return GetFileResult(file);
        }

        [HttpGet("emojis/{fileId}")]
        public async Task<IActionResult> GetEmojiFile(string fileId)
        {
            if (FileExtensions.HasImageExtension(fileId))
                fileId = fileId.Substring(0, fileId.LastIndexOf('.'));

            var file = await _context.EmojiFiles.FirstOrDefaultAsync(f => f.FileId == fileId);
            return GetFileResult(file);
        }

        [HttpGet("guilds/{fileId}")]
        public async Task<IActionResult> GetGuildFile(string fileId)
        {
            if (FileExtensions.HasImageExtension(fileId))
                fileId = fileId.Substring(0, fileId.LastIndexOf('.'));

            var file = await _context.GuildFiles.FirstOrDefaultAsync(f => f.GuildId == fileId);
            return GetFileResult(file);
        }

        private IActionResult GetFileResult(dynamic file)
        {
            if (file == null) return NotFound();

            if (!_fileTypeProvider.TryGetContentType(file.FileName, out string contentType))
            {
                contentType = "application/octet-stream"; // Fallback content type
            }

            // Set the Content-Disposition header to inline to display the image
            Response.Headers.Add("Content-Disposition", $"inline; filename=\"{file.FileName}\"");
            
            return File(file.Content, contentType);
        }

    }
}

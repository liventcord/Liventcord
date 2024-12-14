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
    [Route("")]
    public class UploadController : BaseController
    {
        private readonly AppDbContext _context;
        private readonly ILogger<UploadController> _logger;

        public UploadController(AppDbContext context, ILogger<UploadController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost("/api/upload_img")]
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
                await SaveOrUpdateFile<GuildFile>(photo.FileName, content, extension, guildId, fileId);
            }
            else
            {
                await SaveOrUpdateFile<ProfileFile>(photo.FileName, content, extension, userId, fileId);
            }

            return Ok(new { fileId });
        }


        private async Task SaveOrUpdateFile<T>(
            string fileName,
            byte[] content,
            string extension,
            string? additionalField = null,
            string fileId = "") where T : FileBase
        {
            T? existingFile = null;

            if (typeof(T) == typeof(ProfileFile) && !string.IsNullOrEmpty(additionalField))
            {
                existingFile = await _context.Set<T>()
                    .FirstOrDefaultAsync(f => ((ProfileFile)(object)f).UserId == additionalField);  // additionalField is userId
            }
            else if (typeof(T) == typeof(GuildFile) && !string.IsNullOrEmpty(additionalField))
            {
                existingFile = await _context.Set<T>()
                    .FirstOrDefaultAsync(f => ((GuildFile)(object)f).GuildId == additionalField);  // additionalField is guildId
            }
            else if (typeof(T) == typeof(EmojiFile) && !string.IsNullOrEmpty(additionalField))
            {
                existingFile = await _context.Set<T>()
                    .FirstOrDefaultAsync(f => ((EmojiFile)(object)f).GuildId == additionalField);  // additionalField is guildId
            }
            else if (typeof(T) == typeof(AttachmentFile) && !string.IsNullOrEmpty(additionalField))
            {
                existingFile = await _context.Set<T>()
                    .FirstOrDefaultAsync(f => ((AttachmentFile)(object)f).GuildId == additionalField);  // additionalField is guildId
            }

            if (existingFile != null)
            {
                // Update fields common to all file types
                existingFile.FileName = fileName;
                existingFile.Content = content;
                existingFile.Extension = extension;

                // Update specific fields for each file type
                if (existingFile is ProfileFile profileFile)
                {
                    profileFile.UserId = additionalField;  // ProfileFile needs userId
                }
                else if (existingFile is GuildFile guildFile)
                {
                    guildFile.GuildId = additionalField;  // GuildFile needs guildId
                    guildFile.UserId = additionalField;  // GuildFile needs userId
                }
                else if (existingFile is EmojiFile emojiFile)
                {
                    emojiFile.GuildId = additionalField;  // EmojiFile needs guildId
                }
                else if (existingFile is AttachmentFile attachmentFile)
                {
                    attachmentFile.GuildId = additionalField;  // AttachmentFile needs guildId
                    attachmentFile.UserId = additionalField;  // AttachmentFile needs userId
                }

                _logger.LogInformation("Updated file: {FileId}, {FileName}, {AdditionalField}, {Extension}", existingFile.FileId, fileName, additionalField, extension);
            }
            else
            {
                // Create a new file instance using the constructor of the specific file type
                T? newFile = Activator.CreateInstance(typeof(T), fileId, fileName, content, extension, additionalField) as T;

                if (newFile == null)
                    throw new InvalidOperationException($"Unable to create instance of {typeof(T).Name}.");

                // Set specific fields for each file type
                if (newFile is ProfileFile profileFile)
                {
                    profileFile.UserId = additionalField;  // ProfileFile needs userId
                }
                else if (newFile is GuildFile guildFile)
                {
                    guildFile.GuildId = additionalField;  // GuildFile needs guildId
                    guildFile.UserId = additionalField;  // GuildFile needs userId
                }
                else if (newFile is EmojiFile emojiFile)
                {
                    emojiFile.GuildId = additionalField;  // EmojiFile needs guildId
                }
                else if (newFile is AttachmentFile attachmentFile)
                {
                    attachmentFile.GuildId = additionalField;  // AttachmentFile needs guildId
                    attachmentFile.UserId = additionalField;  // AttachmentFile needs userId
                }

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

    [HttpGet("profiles/{userId}")]
    public async Task<IActionResult> GetProfileFile(string userId)
    {
        userId = RemoveFileExtension(userId);

        var file = await _context.ProfileFiles.FirstOrDefaultAsync(f => f.UserId == userId);
        if (file == null)
            return NotFound(new { Error = "Profile file not found." });

        return GetFileResult(file);
    }

    private string RemoveFileExtension(string userId)
    {
        var extensionIndex = userId.LastIndexOf('.');
        if (extensionIndex > 0)
        {
            userId = userId.Substring(0, extensionIndex);
        }
        return userId;
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

     

    [HttpGet("/api/list_files")]
    public async Task<IActionResult> ListFiles()
    {
        var profileFiles = await _context.ProfileFiles.ToListAsync();
        var attachmentFiles = await _context.AttachmentFiles.ToListAsync();
        var emojiFiles = await _context.EmojiFiles.ToListAsync();
        var guildFiles = await _context.GuildFiles.ToListAsync();

        var allFiles = profileFiles.Cast<FileBase>()
            .Concat(attachmentFiles.Cast<FileBase>())
            .Concat(emojiFiles.Cast<FileBase>())
            .Concat(guildFiles.Cast<FileBase>())
            .Select(f => new
            {
                FileId = f.FileId,
                FileName = f.FileName,
                FileSize = f.Content.Length,
                Extension = f.Extension,
                GuildId = f.GuildId,
                ChannelId = (f is GuildFile guildFile) ? guildFile.ChannelId : null,
                UserId = (f is GuildFile || f is AttachmentFile || f is ProfileFile) ? ((dynamic)f).UserId : null,
                MessageId = (f is AttachmentFile attachmentFile) ? attachmentFile.MessageId : null
            }).ToList();

        // Start constructing the HTML response
        var html = "<html><body>";

        foreach (var file in allFiles)
        {
            // Create the file URL (you may need to adjust the route for your server)
            var fileUrl = Url.Action("GetProfileFile", "File", new { userId = file.UserId }) ?? "";

            // Add an image tag for each profile file
            if (file.Extension == ".jpg" || file.Extension == ".png" || file.Extension == ".jpeg" || file.Extension == ".gif")
            {
                html += $"<div><h3>{file.FileName}</h3><img src='{fileUrl}' alt='{file.FileName}' width='200' /></div>";
            }
            else
            {
                // Add a link to non-image files
                html += $"<div><h3>{file.FileName}</h3><p>File size: {file.FileSize} bytes</p></div>";
            }
        }

        html += "</body></html>";

        return Content(html, "text/html");
    }

    }

    





    
}

using LiventCord.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.Cookies;
using LiventCord.Helpers;
using LiventCord.Services;
using Microsoft.AspNetCore.StaticFiles;
using LiventCord.Routes;
using LiventCord.Controllers;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.AspNetCore.ResponseCompression;
using System.IO.Compression;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<FriendHelper>();
builder.Services.AddScoped<TypingService>(); 
builder.Services.AddScoped<GuildService>();
builder.Services.AddScoped<MessageService>();
builder.Services.AddScoped<AppLogic>();
builder.Services.AddSingleton<FileExtensionContentTypeProvider>();
builder.Services.AddScoped<UploadController>();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("LocalConnection")));


builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.HttpOnly = true;
        options.ExpireTimeSpan = TimeSpan.FromDays(7);
        options.SlidingExpiration = true;
        options.LoginPath = "/auth/login";
    });

builder.Services.AddMemoryCache();
builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();

builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<GzipCompressionProvider>();
    options.Providers.Add<BrotliCompressionProvider>();
});

builder.Services.Configure<GzipCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Fastest;
});

builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Optimal;
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<AppDbContext>();
}

app.UseResponseCompression();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
}
else
{
    app.UseDeveloperExceptionPage();
}

app.UseStatusCodePages(async context =>
{
    var statusCode = context.HttpContext.Response.StatusCode;
    if (statusCode == 404)
    {
        context.HttpContext.Response.ContentType = "text/html";
        var filePath = Path.Combine(app.Environment.WebRootPath, "404.html");
        await context.HttpContext.Response.SendFileAsync(filePath);
    }
    else
    {
        var reasonPhrase = ReasonPhrases.GetReasonPhrase(statusCode);
        context.HttpContext.Response.ContentType = "text/plain";
        await context.HttpContext.Response.WriteAsync($"{statusCode} {reasonPhrase}");
    }
});

app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.UseStaticFiles();

RouteConfig.ConfigureRoutes(app);

app.MapGet("/error", async context =>
{
    context.Response.StatusCode = StatusCodes.Status500InternalServerError;
    context.Response.ContentType = "text/plain";
    await context.Response.WriteAsync("An internal server error occurred. Please try again later.");
});

string secretKey = builder.Configuration["AppSettings:SecretKey"] ?? string.Empty;
var guildService = app.Services.GetRequiredService<GuildService>();
var messageService = app.Services.GetRequiredService<MessageService>();
var appManager = new AppManager(secretKey, guildService,messageService);
appManager.ConfigureApp(app);
app.MapGet("/login", async context =>
{
    if (context.User.Identity?.IsAuthenticated == true)
    {
        context.Response.Redirect("/app");
        return;
    }

    context.Response.ContentType = "text/html";
    var filePath = Path.Combine(app.Environment.WebRootPath, "login.html");
    await context.Response.SendFileAsync(filePath);
});

app.MapGet("/app", context =>
{
    context.Response.Redirect("/channels/@me");
    return Task.CompletedTask;
});

app.MapGet("/channels/{guildId}/{channelId}", async (HttpContext context, AppLogic appLogic, string guildId, string channelId) =>
{
    await appLogic.HandleChannelRequest(context, guildId, channelId);
});

app.MapGet("/channels/{friendId}", async (HttpContext context, AppLogic appLogic, string friendId) =>
{
    await appLogic.HandleChannelRequest(context, null, null, friendId);
});
app.MapFallback(async context =>
{
    context.Response.StatusCode = StatusCodes.Status404NotFound;
    context.Response.ContentType = "text/html";
    var filePath = Path.Combine(app.Environment.WebRootPath, "404.html");
    await context.Response.SendFileAsync(filePath);
});

app.MapControllers();
app.Run();

async Task SendHistoryResponse(HttpContext context, Dictionary<string, string> request)
{
    var placeholderHistory = new
    {
        status = "success",
        history = new[] { "Message 1", "Message 2", "Message 3" },
        channelId = request["channel_id"],
        guildId = request["guild_id"]
    };
    await context.Response.WriteAsync(JsonSerializer.Serialize(placeholderHistory));
}

async Task SendChannelsResponse(HttpContext context, Dictionary<string, string> request)
{
    var placeholderChannels = new
    {
        status = "success",
        channels = new[] { "Channel A", "Channel B", "Channel C" },
        guildId = request["guild_id"]
    };
    await context.Response.WriteAsync(JsonSerializer.Serialize(placeholderChannels));
}

async Task SendErrorResponse(HttpContext context, string message)
{
    var errorResponse = new { status = "error", message = message };
    await context.Response.WriteAsync(JsonSerializer.Serialize(errorResponse));
}

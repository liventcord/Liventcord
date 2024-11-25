using System.IO.Compression;
using LiventCord.Controllers;
using LiventCord.Data;
using LiventCord.Helpers;
using LiventCord.Routes;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);


Log.Logger = new LoggerConfiguration()
    .WriteTo.File("Logs/log-.txt", rollingInterval: RollingInterval.Day) 
    .CreateLogger();

builder.Host.UseSerilog(); 



builder.Services.AddScoped<FriendController>();
builder.Services.AddScoped<TypingController>();
builder.Services.AddScoped<MessageController>();
builder.Services.AddScoped<AppLogic>();
builder.Services.AddScoped<SSEManager>();
builder.Services.AddSingleton<FileExtensionContentTypeProvider>();
builder.Services.AddScoped<GuildController>();
builder.Services.AddScoped<UploadController>();
builder.Services.AddScoped<GuildInviteService>();

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
app.UseSerilogRequestLogging();


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

    if (statusCode == StatusCodes.Status404NotFound)
    {
        context.HttpContext.Response.ContentType = "text/plain";
        await context.HttpContext.Response.WriteAsync("404 Not Found");
    }
    else if (statusCode == StatusCodes.Status500InternalServerError)
    {
        context.HttpContext.Response.ContentType = "text/plain";
        await context.HttpContext.Response.WriteAsync("500 Internal Server Error");
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

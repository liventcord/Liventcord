using System.IO.Compression;
using LiventCord.Controllers;
using LiventCord.Data;
using LiventCord.Helpers;
using LiventCord.Routes;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Serilog.Events;

var builder = WebApplication.CreateBuilder(args);


Log.Logger = new LoggerConfiguration()
    .WriteTo.Console(restrictedToMinimumLevel: LogEventLevel.Information)
    .Filter.ByExcluding(logEvent => logEvent.MessageTemplate.Text.Contains("db query"))
    .WriteTo.File("Logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog(); 



builder.Services.AddScoped<FriendController>();
builder.Services.AddScoped<TypingController>();
builder.Services.AddScoped<MessageController>();
builder.Services.AddScoped<RegisterController>();
builder.Services.AddScoped<NickDiscriminatorController>();
builder.Services.AddScoped<AppLogic>();
builder.Services.AddScoped<MembersController>();
builder.Services.AddScoped<ChannelController>();
builder.Services.AddScoped<SSEManager>();
builder.Services.AddSingleton<FileExtensionContentTypeProvider>();
builder.Services.AddScoped<GuildController>();
builder.Services.AddScoped<PermissionsController>();
builder.Services.AddScoped<UploadController>();
builder.Services.AddScoped<InviteController>();

builder.Configuration.AddJsonFile("Properties/appsettings.json", optional: false, reloadOnChange: true);
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
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(entry => entry.Value?.Errors.Count > 0) 
                .ToDictionary(
                    entry => entry.Key,
                    entry => entry.Value?.Errors
                        .Where(e => e != null) 
                        .Select(e => e.ErrorMessage)
                        .ToArray() ?? Array.Empty<string>() 
                );

            return new BadRequestObjectResult(errors);
        };
    });


builder.Services.AddMemoryCache();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
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

app.UseSwagger(c =>
{
    c.RouteTemplate = "swagger/{documentName}/swagger.json";
    var swaggerFilePath = Path.Combine(builder.Environment.ContentRootPath, "swagger.json");

    c.PreSerializeFilters.Add((swaggerDoc, httpReq) =>
    {
        File.WriteAllText(swaggerFilePath, System.Text.Json.JsonSerializer.Serialize(swaggerDoc));
    });
});

app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "LiventCord API V1");
    c.RoutePrefix = "docs";
});

app.MapGet("/docs2", async context =>
{
    var filePath = Path.Combine(app.Environment.WebRootPath, "redocs.html");

    if (!File.Exists(filePath))
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        await context.Response.WriteAsync("Documentation not yet generated.");
    }
    else
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(filePath);
    }
});

app.UseResponseCompression();


app.UseExceptionHandler("/error");

app.Map("/error", (HttpContext context) =>
{
    context.Response.StatusCode = StatusCodes.Status500InternalServerError;
    context.Response.ContentType = "text/plain";
    return context.Response.WriteAsync("500 Internal Server Error");
});

app.UseStatusCodePages(async context =>
{
    var httpContext = context.HttpContext;
    var statusCode = httpContext.Response.StatusCode;

    var isApiRequest = httpContext.Request.Headers["Accept"].ToString().Contains("application/json");

    if (statusCode == StatusCodes.Status404NotFound)
    {
        if (isApiRequest)
        {
            httpContext.Response.ContentType = "text/plain";
            await httpContext.Response.WriteAsync("404 Not Found");
        }
    }
    else if (statusCode == StatusCodes.Status500InternalServerError)
    {
        if (isApiRequest)
        {
            httpContext.Response.ContentType = "application/json";
            await httpContext.Response.WriteAsync("{\"error\": \"500 Internal Server Error\"}");
        }
        else
        {
            httpContext.Response.ContentType = "text/plain";
            await httpContext.Response.WriteAsync("500 Internal Server Error");
        }
    }
    else
    {
        var reasonPhrase = ReasonPhrases.GetReasonPhrase(statusCode);
        httpContext.Response.ContentType = "text/plain";
        await httpContext.Response.WriteAsync($"{statusCode} {reasonPhrase}");
    }
});

// Fallback for non-API routes
app.MapFallback(async context =>
{
    var acceptHeader = context.Request.Headers["Accept"].ToString();

    if (acceptHeader.Contains("text/html"))
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        context.Response.ContentType = "text/html";
        var filePath = Path.Combine(app.Environment.WebRootPath,"static","404", "404.html");
        await context.Response.SendFileAsync(filePath);
    }
    else
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        context.Response.ContentType = "text/plain";
        await context.Response.WriteAsync("404 Not Found");
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


app.MapControllers();
app.Run();

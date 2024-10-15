using MyPostgresApp.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.Cookies;
using MyPostgresApp.Helpers;
using MyPostgresApp.Services;
using Microsoft.AspNetCore.StaticFiles;
using MyPostgresApp.Routes;
using MyPostgresApp.Controllers;
using Microsoft.AspNetCore.WebUtilities;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<FriendHelper>();
builder.Services.AddScoped<TypingService>(); 
builder.Services.AddScoped<GuildService>();
builder.Services.AddScoped<AppLogic>();
builder.Services.AddSingleton<FileExtensionContentTypeProvider>();
builder.Services.AddScoped<UploadController>();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("RemoteConnection")));

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

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<AppDbContext>();
}

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

string secretKey = builder.Configuration["AppSettings:SecretKey"];
var guildService = app.Services.GetRequiredService<GuildService>();
var webSocketHandler = new WebSocketHandler("ws://0.0.0.0:8181", secretKey, guildService);

// Define routes
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

// Fallback route for undefined routes
app.MapFallback(async context =>
{
    context.Response.StatusCode = StatusCodes.Status404NotFound;
    context.Response.ContentType = "text/html";
    var filePath = Path.Combine(app.Environment.WebRootPath, "404.html");
    await context.Response.SendFileAsync(filePath);
});

app.MapControllers();
app.Run();

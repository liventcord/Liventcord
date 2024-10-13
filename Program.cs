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

var app = builder.Build();

using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;

if (!app.Environment.IsDevelopment())
{
    // Handle 500 errors with this exception handler middleware
    app.UseExceptionHandler("/Home/Error"); // Custom error handling for 500
    app.UseHsts();
}

// Show detailed exception page in development
if (app.Environment.IsDevelopment())
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
string secretKey = builder.Configuration["AppSettings:SecretKey"];
var guildService = services.GetRequiredService<GuildService>();
var webSocketHandler = new WebSocketHandler("ws://0.0.0.0:8181", secretKey,guildService);

// Map specific routes
app.MapGet("/login", async context =>
{
    if (context.User.Identity != null && context.User.Identity.IsAuthenticated)
    {
        context.Response.Redirect("/app");
        return;
    }

    context.Response.ContentType = "text/html";
    var filePath = Path.Combine(app.Environment.WebRootPath, "login.html");
    await context.Response.SendFileAsync(filePath);
});

app.MapGet("/app", context => {
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

// Fallback route to handle 404 for any undefined routes
app.MapFallback(async context =>
{
    context.Response.StatusCode = StatusCodes.Status404NotFound;
    context.Response.ContentType = "text/html";
    var filePath = Path.Combine(app.Environment.WebRootPath, "404.html");
    await context.Response.SendFileAsync(filePath);
});

app.MapControllers();
app.Run();

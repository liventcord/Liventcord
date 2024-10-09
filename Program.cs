using MyPostgresApp.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Text.Json;
using MyPostgresApp.Helpers;
using MyPostgresApp.Services;
using System.Collections.Generic;
using Microsoft.AspNetCore.StaticFiles;


var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<FriendHelper>();
builder.Services.AddScoped<TypingService>(); 
builder.Services.AddScoped<GuildService>();
builder.Services.AddScoped<AppLogic>();

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

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.UseStaticFiles();




void MapRoute(string path, string fileName)
{
    var provider = new FileExtensionContentTypeProvider();
    provider.TryGetContentType(fileName, out var contentType);
    contentType ??= "application/octet-stream";

    app.MapGet(path, async context =>
    {
        var filePath = Path.Combine(app.Environment.WebRootPath, fileName);
        context.Response.ContentType = contentType;
        await context.Response.SendFileAsync(filePath);
    });
}

MapRoute("/", "newdc.html");
MapRoute("/download", "download.html");
MapRoute("/register", "register.html");
MapRoute("/w/loader/loader.js", "static/js/loader.js");
MapRoute("/w/assets/5c6ef209aecf2721d4c8c8fbbdfa51481b04f3ed/index-react.js", "static/w/assets/index-react.js");
MapRoute("/w/assets/5c6ef209aecf2721d4c8c8fbbdfa51481b04f3ed/styles.css", "static/w/assets/b960ac7f559c3a04d18e7cce9de42c4b94a33dd4/styles.css");
MapRoute("/w/assets/5c6ef209aecf2721d4c8c8fbbdfa51481b04f3ed/styles.js", "static/w/assets/b960ac7f559c3a04d18e7cce9de42c4b94a33dd4/styles.css");
MapRoute("/assets/532.423e048cce31881cf30d.css", "static/404/532.423e048cce31881cf30d.css");
MapRoute("/assets/oneTrust/v4/scripttemplates/otSDKStub.js", "static/404/otSDKStub.js");
MapRoute("/assets/5cb4337fbb45898bd5dce9a7a1a5a6c1.svg", "static/404/5cb4337fbb45898bd5dce9a7a1a5a6c1.svg");


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

app.MapFallback(async context =>
{
    context.Response.ContentType = "text/html";
    var filePath = Path.Combine(app.Environment.WebRootPath, "4042.html");
    await context.Response.SendFileAsync(filePath);
});

app.MapControllers();

app.Run();

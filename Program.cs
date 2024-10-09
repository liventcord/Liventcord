using MyPostgresApp.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Text.Json;
using System.Security.Claims;
using MyPostgresApp.Helpers;
using MyPostgresApp.Controllers;
using MyPostgresApp.Services;
using System.Collections.Generic;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<FriendHelper>();
builder.Services.AddScoped<TypingService>(); 
builder.Services.AddScoped<GuildService>();

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

void MapRoute(string path, string fileName, string contentType)
{
    app.MapGet(path, async context =>
    {
        var filePath = Path.Combine(app.Environment.WebRootPath, fileName);
        context.Response.ContentType = contentType;
        await context.Response.SendFileAsync(filePath);
    });
}

MapRoute("/", "newdc.html", "text/html");
MapRoute("/download", "download.html", "text/html");
MapRoute("/register", "register.html", "text/html");
MapRoute("/w/loader/loader.js", "static/js/loader.js", "application/javascript");

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
async Task HandleChannelRequest(HttpContext context, AppDbContext dbContext, TypingService typingService, GuildService guildService, FriendHelper friendHelper,string guildId, string channelId, string friendId = null)
{
    var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userId)) { context.Response.Redirect("/login"); return; }

    var user = await dbContext.Users.FirstOrDefaultAsync(u => u.UserId == userId);
    if (user == null) { context.Response.Redirect("/login"); return; }

    var email = user.Email ?? "";
    var maskedEmail = user.MaskedEmail ?? "";
    var userName = user.Nickname ?? "";
    var userDiscriminator = user.Discriminator ?? "";

    var guilds = await dbContext.GuildUsers
        .Where(gu => gu.UserId == userId)
        .Include(gu => gu.Guild)
        .Select(gu => gu.Guild)
        .ToListAsync();

    var guild = await dbContext.Guilds.FirstOrDefaultAsync(g => g.GuildId == guildId);
    var guildName = guild?.GuildName ?? "";
    var authorId = guild?.OwnerId ?? "";

    var typingUsers = new List<string>();
    var sharedGuildsMap = new List<string>();
    var permissionsMap = new List<string>();

    if (!string.IsNullOrEmpty(guildId)) {
        typingUsers = await typingService.GetTypingUsers(guildId, channelId) ?? new List<string>();
        sharedGuildsMap = await guildService.GetSharedGuilds(guildId, userId) ?? new List<string>();
        permissionsMap = getPermissionsMap(guildId, userId) ?? new List<string>();
    }



    var friendsStatus = await friendHelper.GetFriendsStatus(userId) ?? new List<string>();

    var dmUsers = await dbContext.UserDms.Where(ud => ud.UserId == userId).Select(ud => ud.FriendId).ToListAsync() ?? new List<string>();

    var jsonData = new
    {
        email,
        maskedEmail,
        userId,
        userName,
        userDiscriminator,
        guildId,
        channelId,
        guildName,
        authorId,
        typingUsers,
        sharedGuildsMap,
        permissionsMap,
        friendsStatus,
        dmUsers,
        guildsJson = guilds
    };

    string jsonDataScript = $@"
        <script id='data-script' type='application/json'>
            {JsonSerializer.Serialize(jsonData)}
        </script>";

    var filePath = Path.Combine(context.RequestServices.GetRequiredService<IWebHostEnvironment>().WebRootPath, "app.html");
    var htmlContent = await File.ReadAllTextAsync(filePath);
    var bodyCloseTagIndex = htmlContent.LastIndexOf("</body>");

    if (bodyCloseTagIndex >= 0)
    {
        htmlContent = htmlContent.Insert(bodyCloseTagIndex, jsonDataScript);
    }

    context.Response.ContentType = "text/html";
    await context.Response.WriteAsync(htmlContent);
}

app.MapGet("/channels/{guildId}/{channelId}", async (HttpContext context, AppDbContext dbContext, TypingService typingService, GuildService guildService,FriendHelper friendHelper, string guildId, string channelId) =>
{
    await HandleChannelRequest(context, dbContext, typingService, guildService,friendHelper, guildId, channelId);
});

app.MapGet("/channels/{friendId}", async (HttpContext context, AppDbContext dbContext, TypingService typingService, GuildService guildService,FriendHelper friendHelper,string friendId) =>
    await HandleChannelRequest(context, dbContext, typingService, null,friendHelper, null,null, friendId));





List<string> getPermissionsMap(string guildId, string userId)
{
    return new List<string>();
}







app.MapFallback(async context =>
{
    context.Response.ContentType = "text/html";
    var filePath = Path.Combine(app.Environment.WebRootPath, "404.html");
    await context.Response.SendFileAsync(filePath);
});

app.MapControllers();

app.Run();
using MyPostgresApp.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);
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


app.MapGet("/channels/{guildId}/{channelId}", async (HttpContext context, AppDbContext dbContext, string guildId, string channelId) =>
{
    var userId = context.User.FindFirst("user_id")?.Value;

    if (userId == null)
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return;
    }

    var user = await dbContext.Users
        .Where(u => u.UserId == userId)
        .FirstOrDefaultAsync();

    if (user == null)
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        return;
    }

    var email = user.Email;
    var maskedEmail = user.MaskedEmail; 
    var userName = user.Nickname; 
    var userDiscriminator = user.Discriminator; 

    // Check if guildId and channelId are both 18 digits long
    if (guildId.Length == 18 && channelId.Length == 18)
    {
        var guildName = getGuildName(guildId);
        var authorId = getGuildAuthor(guildId);
        var typingUsers = getTypingUsers(guildId, channelId);
        var sharedGuildsMap = getSharedGuilds(guildId, userId);
        var permissionsMap = getPermissionsMap(guildId, userId);
        var friendsStatus = getFriendsStatus(userId);
        var dmUsers = getDmUsers(userId);
        
        var sharedGuildsMapJson = JsonSerializer.Serialize(sharedGuildsMap);
        var permissionsMapJson = JsonSerializer.Serialize(permissionsMap);
        var friendsStatusJson = JsonSerializer.Serialize(friendsStatus);
        var dmUsersJson = JsonSerializer.Serialize(dmUsers);

        var filePath = Path.Combine(app.Environment.WebRootPath, "app.html");
        var htmlContent = await File.ReadAllTextAsync(filePath);

        var scriptContent = $@"
            <script id='variableScript'>
                var email = '{email}';
                var masked_email = '{maskedEmail}';
                var passed_user_id = '{userId}';
                var user_name = '{userName}';
                var user_discriminator = '{userDiscriminator}';
                var passed_guild_id = '{guildId}';
                var passed_channel_id = '{channelId}';
                var passed_guild_name = '{guildName}';
                var passed_author_id = '{authorId}';
                var typing_users = '{typingUsers}';
                var shared_guilds_map = {sharedGuildsMapJson};
                var permissions_map = {permissionsMapJson};
                var friends_status = {friendsStatusJson};
                var dm_users = {dmUsersJson};
            </script>";

        var modifiedHtmlContent = htmlContent.Replace("</body>", $"{scriptContent}</body>");

        context.Response.ContentType = "text/html";
        await context.Response.WriteAsync(modifiedHtmlContent);
    }
    else
    {
        context.Response.Redirect("/channels/@me");
        return;
    }
});

app.MapGet("/channels/{friendId}", async (HttpContext context, AppDbContext dbContext, string friendId) =>
{
    var userId = context.User.FindFirst("user_id")?.Value;

    if (userId == null)
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return;
    }

    var user = await dbContext.Users
        .Where(u => u.UserId == userId)
        .FirstOrDefaultAsync();

    if (user == null)
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        return;
    }

    var email = user.Email;
    var maskedEmail = user.MaskedEmail; 
    var userName = user.Nickname; 
    var userDiscriminator = user.Discriminator; 

    var friendDiscriminator = queryFriendDiscriminator(friendId);
    var friendBlocked = queryFriendBlockStatus(friendId);
    var friendName = queryFriendName(friendId);

    var filePath = Path.Combine(app.Environment.WebRootPath, "app.html");
    var htmlContent = await File.ReadAllTextAsync(filePath);

    var scriptContent = $@"
        <script id='variableScript'>
            var email = '{email}';
            var masked_email = '{maskedEmail}';
            var passed_user_id = '{userId}';
            var user_name = '{userName}';
            var user_discriminator = '{userDiscriminator}';
            var passed_friend_id = '{friendId}';
            var passed_friend_discriminator = '{friendDiscriminator}';
            var passed_friend_blocked = '{friendBlocked}';
            var passed_friend_name = '{friendName}';
        </script>";

    var modifiedHtmlContent = htmlContent.Replace("</body>", $"{scriptContent}</body>");

    context.Response.ContentType = "text/html";
    await context.Response.WriteAsync(modifiedHtmlContent);
});

object queryFriendName(string friendId)
{
    throw new NotImplementedException();
}

object queryFriendBlockStatus(string friendId)
{
    throw new NotImplementedException();
}

object getDmUsers(string userId)
{
    throw new NotImplementedException();
}

object getFriendsStatus(string userId)
{
    throw new NotImplementedException();
}

object getPermissionsMap(string guildId, string userId)
{
    throw new NotImplementedException();
}

object getSharedGuilds(string guildId, string userId)
{
    throw new NotImplementedException();
}

object getTypingUsers(string guildId, string channelId)
{
    throw new NotImplementedException();
}

object getGuildAuthor(string guildId)
{
    throw new NotImplementedException();
}

object getGuildName(string guildId)
{
    throw new NotImplementedException();
}

string queryFriendDiscriminator(object friendId)
{
    throw new NotImplementedException();
}


app.MapFallback(async context =>
{
    context.Response.ContentType = "text/html";
    var filePath = Path.Combine(app.Environment.WebRootPath, "404.html");
    await context.Response.SendFileAsync(filePath);
});

app.MapControllers();
app.Run();

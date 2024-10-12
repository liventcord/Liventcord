using MyPostgresApp.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Text.Json;
using MyPostgresApp.Helpers;
using MyPostgresApp.Services;
using System.Collections.Generic;
using Microsoft.AspNetCore.StaticFiles;
using MyPostgresApp.Routes;
using Fleck;

var server = new WebSocketServer("ws://0.0.0.0:8181");
var clients = new List<IWebSocketConnection>();
server.Start(socket =>
{
    socket.OnOpen = () => 
    {
        clients.Add(socket);
        Console.WriteLine("Open!");
    };
    
    socket.OnClose = () => 
    {
        clients.Remove(socket);
        Console.WriteLine("Close!");
    };
    
    socket.OnMessage = message => 
    {
        Console.WriteLine("Received: " + message);
        Message msg = null;
        
        try
        {
            msg = JsonSerializer.Deserialize<Message>(message);
        }
        catch (JsonException ex)
        {
            Console.WriteLine($"JSON Deserialization error: {ex.Message}");
            return;
        }
        
        if (msg == null)
        {
            Console.WriteLine("Received a null message.");
            return;
        }
        
        HandleMessage(socket, msg);
    };
});

void HandleMessage(IWebSocketConnection socket, Message msg)
{
    if (msg == null)
    {
        Console.WriteLine("Received a null message in HandleMessage.");
        return;
    }

    switch (msg.Type)
    {
        case "keep-alive":
            Console.WriteLine("Keep-alive received from client.");
            break;

        case "create_channel":
            Console.WriteLine("Create channel request received.");
            break;

        default:
            Console.WriteLine($"Unknown message type: {msg.Type}");
            break;
    }
}


void HandleCreateChannel(IWebSocketConnection socket, Dictionary<string, object> data)
{
    Console.WriteLine("Creating channel with data: " + JsonSerializer.Serialize(data));
    
    foreach (var client in clients)
    {
        if (client != null)
        {
            client.Send(JsonSerializer.Serialize(new { Type = "update_guilds", Data = data }));
        }
    }
}


var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<FriendHelper>();
builder.Services.AddScoped<TypingService>(); 
builder.Services.AddScoped<GuildService>();
builder.Services.AddScoped<AppLogic>();
builder.Services.AddSingleton<FileExtensionContentTypeProvider>();

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


RouteConfig.ConfigureRoutes(app);


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
    context.Response.StatusCode = StatusCodes.Status404NotFound;
    context.Response.ContentType = "text/html";
    var filePath = Path.Combine(app.Environment.WebRootPath, "404.html");
    await context.Response.SendFileAsync(filePath);
});


app.MapControllers();

app.Run();
public class Message
{
    public string Type { get; set; }
    public string Key { get; set; }  // If applicable
    public string Content { get; set; } // If applicable
}

using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using System.Security.Claims;
using System.Text.Json;
using LiventCord.Models;
using LiventCord.Data;
using System.Threading.Channels;

public class AppManager
{
    private readonly string secretKey;
    private GuildService _guildService;
    private MessageService _messageService;
    private readonly Channel<string> _eventChannel;
    private Dictionary<string, List<string>> writingUsersState = new();
    private readonly Dictionary<string, HttpContext> activeConnections = new();
    


    public AppManager(string secretKey, GuildService guildService, MessageService messageService)
    {
        _messageService = messageService;
        _guildService = guildService;
        this.secretKey = secretKey;
        _eventChannel = System.Threading.Channels.Channel.CreateUnbounded<string>();
    }

    public void ConfigureApp(WebApplication app)
    {
        app.MapGet("/event-driven", async (HttpContext context) =>
        {
            context.Response.ContentType = "text/event-stream";
            context.Response.Headers.Add("Cache-Control", "no-cache");
            context.Response.Headers.Add("Connection", "keep-alive");

            var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                await SendErrorResponse(context, "Authentication failed.");
                return;
            }

            // Add the connection to the active connections
            AddConnection(userId, context);

            await HandleSseConnection(context, userId);

            // Remove connection after the SSE is closed
            RemoveConnection(userId);
        });

        app.MapPost("/event-driven", async (HttpContext context) =>
        {
            var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                await SendErrorResponse(context, "Authentication failed.");
                return;
            }

            using (var doc = await JsonDocument.ParseAsync(context.Request.Body))
            {
                if (doc.RootElement.TryGetProperty("action", out var actionElement))
                {
                    string action = actionElement.GetString();
                    if (action == null)
                    {
                        await SendErrorResponse(context, "Invalid action type.");
                        return;
                    }

                    switch (action)
                    {
                        case "create_channel":
                            await HandleCreateChannel(context, doc, userId);
                            break;
                        case "new_message":
                            await HandleNewMessage(context, doc, userId);
                            break;
                        case "get_history":
                            await HandleGetMessages(context, doc, userId);
                            break;
                        case "get_channels":
                            await HandleGetChannels(context, doc, userId);
                            break;
                        case "get_users":
                            await HandleGetUsers(context, doc, userId);
                            break;
                        case "get_guilds":
                            await HandleGetGuilds(context, doc, userId);
                            break;
                        case "start_writing":
                            await HandleStartWriting(context, doc, userId);
                            break;
                        default:
                            var missingAction = action == null ? "action field" : $"unknown action '{action}'";
                            await SendErrorResponse(context, $"Invalid request format, missing or unknown action: {missingAction}");
                            break;
                    }
                }
                else
                {
                    await SendErrorResponse(context, "Invalid request format, missing action.");
                }
            }
        });
    }

    private async Task HandleSseConnection(HttpContext context, string userId)
    {
        try
        {
            await foreach (var message in _eventChannel.Reader.ReadAllAsync())
            {
                await context.Response.WriteAsync($"data: {message}\n\n");
                await context.Response.Body.FlushAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Exception in HandleSseConnection: {ex.Message}");
            await SendErrorResponse(context, "Internal server error.");
        }
    }

    private void AddConnection(string userId, HttpContext context)
    {
        if (!activeConnections.ContainsKey(userId))
        {
            activeConnections.Add(userId, context);
        }
        else
        {
            activeConnections[userId] = context;
        }
    }

    private void RemoveConnection(string userId)
    {
        if (activeConnections.ContainsKey(userId))
        {
            activeConnections.Remove(userId);
        }
    }


    private async Task EmitToUser(string userId, string event_type, string payload)
    {
        var messageToSend = new { Type = "message", Data = payload };
        if (activeConnections.ContainsKey(userId))
        {
            var context = activeConnections[userId];
            await context.Response.WriteAsync(JsonSerializer.Serialize(messageToSend));
            await context.Response.Body.FlushAsync();
        }
        else
        {
            Console.WriteLine($"User {userId} is not connected.");
        }
    }

    private async Task EmitToGuild(string guildId, object messageToEmit, HttpContext context)
    {
        List<PublicUser> guildUsers = await _guildService.GetGuildUsers(guildId);
        foreach (var client in activeConnections)
        {
            var userId = client.Key;
            if (guildUsers.Any(u => u.UserId == userId)) 
            {
                await EmitToUser(userId, "event_type", JsonSerializer.Serialize(messageToEmit));
            }
        }
    }




    private async Task HandleStartWriting(HttpContext context, JsonDocument request, string userId)
    {
        if (string.IsNullOrEmpty(userId))
        {
            await SendErrorResponse(context, "User ID is missing.");
            return;
        }

        if (request.RootElement.ValueKind != JsonValueKind.Object)
        {
            await SendErrorResponse(context, "msg.Data is not a valid JsonElement or is not an object.");
            return;
        }

        string guildId = string.Empty;
        string channelId = string.Empty;

        try
        {
            if (request.RootElement.TryGetProperty("guildId", out JsonElement guildIdElement) && guildIdElement.ValueKind == JsonValueKind.String)
            {
                guildId = guildIdElement.GetString() ?? string.Empty;
            }

            if (request.RootElement.TryGetProperty("channelId", out JsonElement channelIdElement) && channelIdElement.ValueKind == JsonValueKind.String)
            {
                channelId = channelIdElement.GetString() ?? string.Empty;
            }
        }
        catch (Exception ex)
        {
            await SendErrorResponse(context, "Error parsing JSON data.");
            return;
        }

        if (string.IsNullOrEmpty(guildId) || string.IsNullOrEmpty(channelId))
        {
            await SendErrorResponse(context, "Properties are missing.");
            return;
        }
        if (!writingUsersState.ContainsKey(guildId))
        {
            writingUsersState[guildId] = new List<string>();
        }

        if (!writingUsersState[guildId].Contains(userId))
        {
            writingUsersState[guildId].Add(userId);
        }

        var messageToEmit = new
        {
            Type = "start_writing",
            Data = new
            {
                userId, guildId, channelId
            }
        };

        await EmitToGuild(guildId, messageToEmit, context);
        await context.Response.WriteAsync(JsonSerializer.Serialize(new { Type = "success", Message = "Writing started." }));
    }
    private async Task HandleGetChannels(HttpContext context, JsonDocument request, string userId)
    {
        if (request.RootElement.ValueKind != JsonValueKind.Object)
        {
            await SendErrorResponse(context, "msg.Data is not a valid JsonElement or is not an object.");
            return;
        }

        var jsonData = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(request.RootElement.GetRawText());

        if (jsonData != null && jsonData.TryGetValue("value", out JsonElement guildIdElement))
        {
            if (guildIdElement.ValueKind != JsonValueKind.String)
            {
                await SendErrorResponse(context, "Guild ID is not a string.");
                return;
            }

            string guildId = guildIdElement.GetString();
            if (!string.IsNullOrEmpty(guildId))
            {
                var channels = await _guildService.GetGuildChannels(userId, guildId);
                if (channels != null)
                {
                    var updateChannelsMessage = new
                    {
                        Type = "update_channels",
                        Data = new
                        {
                            guild_id = guildId,
                            channels
                        }
                    };
                    await context.Response.WriteAsync(JsonSerializer.Serialize(updateChannelsMessage));
                    return;
                }
            }
        }

        await SendErrorResponse(context, "Guild ID is missing for get_channels message.");
    }


    private async Task HandleGetGuilds(HttpContext context, JsonDocument request, string userId)
    {
        if (string.IsNullOrEmpty(userId))
        {
            await SendErrorResponse(context, "User ID is missing.");
            return;
        }

        var guilds = await _guildService.GetUserGuilds(userId);
        if (guilds == null)
        {
            await SendErrorResponse(context, "Unable to retrieve guilds.");
            return;
        }

        var messageToEmit = new
        {
            Type = "update_guilds",
            Data = new
            {
                guilds
            }
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(messageToEmit));
    }

    private async Task HandleGetMessages(HttpContext context, JsonDocument request, string userId)
    {
        if (request.RootElement.ValueKind != JsonValueKind.Object)
        {
            await SendErrorResponse(context, "msg.Data is not a valid JsonElement or is not an object.");
            return;
        }

        if (!request.RootElement.TryGetProperty("guildId", out JsonElement guildIdElement) || guildIdElement.ValueKind != JsonValueKind.String)
        {
            await SendErrorResponse(context, "Guild ID is missing or not a string.");
            return;
        }

        if (!request.RootElement.TryGetProperty("channelId", out JsonElement channelIdElement) || channelIdElement.ValueKind != JsonValueKind.String)
        {
            await SendErrorResponse(context, "Channel ID is missing or not a string.");
            return;
        }

        string guildId = guildIdElement.GetString();
        string channelId = channelIdElement.GetString();

        if (string.IsNullOrEmpty(guildId) || string.IsNullOrEmpty(channelId))
        {
            await SendErrorResponse(context, "Properties are missing.");
            return;
        }

        var messages = await _messageService.GetMessages(guildId, channelId);
        var oldestMessageDate = await _messageService.GetOldestMessage(guildId, channelId);

        var messageToEmit = new
        {
            Type = "history_response",
            Data = new
            {
                messages,
                oldestMessageDate
            }
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(messageToEmit));
    }



    private async Task HandleNewMessage(HttpContext context, JsonDocument request, string userId)
    {
        if (request.RootElement.ValueKind != JsonValueKind.Object)
        {
            await SendErrorResponse(context, "msg.Data is not a valid JsonElement or is not an object.");
            return;
        }

        string guildId = request.RootElement.GetProperty("guildId").GetString() ?? string.Empty;
        string channelId = request.RootElement.GetProperty("channelId").GetString() ?? string.Empty;
        string content = request.RootElement.GetProperty("content").GetString() ?? string.Empty;
        string attachmentUrls = request.RootElement.TryGetProperty("attachmentUrls", out var attachmentElement) ? 
            attachmentElement.GetString() : null;
        string replyToId = request.RootElement.TryGetProperty("replyToId", out var replyToElement) ? 
            replyToElement.GetString() : null;
        string reactionEmojisIds = request.RootElement.TryGetProperty("reactionEmojisIds", out var reactionElement) ? 
            reactionElement.GetString() : null;
        string lastEdited = request.RootElement.TryGetProperty("lastEdited", out var lastEditedElement) ? 
            lastEditedElement.GetString() : null;

        if (string.IsNullOrEmpty(guildId) || string.IsNullOrEmpty(channelId) || string.IsNullOrEmpty(content))
        {
            await SendErrorResponse(context, "Properties are missing.");
            return;
        }

        if (string.IsNullOrEmpty(userId))
        {
            await SendErrorResponse(context, "User ID is missing.");
            return;
        }

        if (!await _guildService.CanManageChannels(userId, guildId))
        {
            await SendErrorResponse(context, "User does not have permission to send message.");
            return;
        }

        await _messageService.NewMessage(userId, guildId, channelId, content, lastEdited, attachmentUrls, replyToId, reactionEmojisIds);
        await context.Response.WriteAsync(JsonSerializer.Serialize(new { Type = "success", Message = "Message sent." }));
    }

    private async Task HandleCreateChannel(HttpContext context, JsonDocument request, string userId)
    {
        if (request.RootElement.ValueKind != JsonValueKind.Object)
        {
            await SendErrorResponse(context, "msg.Data is not a valid JsonElement or is not an object.");
            return;
        }

        string guildId = request.RootElement.GetProperty("guildId").GetString();
        bool isTextChannel = request.RootElement.GetProperty("isTextChannel").GetBoolean();
        string channelName = request.RootElement.GetProperty("channelName").GetString();

        if (string.IsNullOrEmpty(guildId) || string.IsNullOrEmpty(channelName))
        {
            await SendErrorResponse(context, "Guild ID or Channel Name is missing.");
            return;
        }

        if (string.IsNullOrEmpty(userId))
        {
            await SendErrorResponse(context, "User ID is missing.");
            return;
        }

        if (!await _guildService.CanManageChannels(userId, guildId))
        {
            await SendErrorResponse(context, "User does not have permission to manage channels.");
            return;
        }

        await _guildService.CreateChannel(guildId, channelName, isTextChannel); 
        await context.Response.WriteAsync(JsonSerializer.Serialize(new { Type = "success", Message = "Channel created." }));
    }

    private async Task HandleGetUsers(HttpContext context, JsonDocument request, string userId)
    {
        if (request.RootElement.ValueKind != JsonValueKind.Object)
        {
            await SendErrorResponse(context, "msg.Data is not a valid JsonElement or is not an object.");
            return;
        }

        var jsonData = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(request.RootElement.GetRawText());

        if (jsonData != null && jsonData.TryGetValue("value", out JsonElement guildIdElement))
        {
            if (guildIdElement.ValueKind != JsonValueKind.String)
            {
                await SendErrorResponse(context, "Guild ID is not a string.");
                return;
            }

            string guildId = guildIdElement.GetString();
            if (string.IsNullOrEmpty(guildId)) 
            {
                await SendErrorResponse(context, "Guild ID is missing.");
                return;
            }

            if (string.IsNullOrEmpty(userId))
            {
                await SendErrorResponse(context, "User ID is missing.");
                return;
            }

            if (!_guildService.DoesUserExistInGuild(userId, guildId)) 
            {
                await SendErrorResponse(context, "User not in guild.");
                return;
            }

            var users = await _guildService.GetGuildUsers(guildId);
            if (users == null) 
            {
                await SendErrorResponse(context, "Unable to retrieve users.");
                return;
            }

            var updateUsersMessage = new
            {
                Type = "update_users",
                Data = new
                {
                    guild_id = guildId,
                    users
                }
            };
            await context.Response.WriteAsync(JsonSerializer.Serialize(updateUsersMessage));
        }
        else
        {
            await SendErrorResponse(context, "Data is null or Guild ID is missing for get_users message.");
        }
    }


    private async Task SendErrorResponse(HttpContext context, string message)
    {
        var errorResponse = new { Type = "error", Message = message };
        await context.Response.WriteAsync(JsonSerializer.Serialize(errorResponse));
    }

    
}

public class SocketMessage
{
    public required string Type { get; set; }
    public object? Data { get; set; }
}

public class AuthData
{
    public string? token { get; set; }
    public bool success { get; set; }
}

public class GetChannelsData
{
    public string GuildId { get; set; }
    public string Value { get; set; }
}



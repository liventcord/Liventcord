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
    private readonly HandlerCreator _handlerCreator;
    


    public AppManager(string secretKey, GuildService guildService, MessageService messageService)
    {
        _messageService = messageService;
        _guildService = guildService;
        this.secretKey = secretKey;
        _eventChannel = System.Threading.Channels.Channel.CreateUnbounded<string>();
        _handlerCreator = new HandlerCreator(this); 
    }

    public void ConfigureApp(WebApplication app)
    {
        app.MapPost("/api/data", async (HttpContext context) =>
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

                    var handler = await _handlerCreator.CreateHandler(action, context, doc, userId);
                    if (handler != null)
                    {
                        await handler(context, doc, userId);
                    }
                }
            }
        });
    }

    public async Task HandleSseConnection(HttpContext context, string userId)
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


    public async Task EmitToUser(string userId, string event_type, string payload)
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

    public async Task EmitToGuild(string guildId, object messageToEmit, HttpContext context)
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

    public async Task HandleStartWriting(HttpContext context, JsonDocument request, string userId)
    {
        if (string.IsNullOrEmpty(userId))
        {
            await SendErrorResponse(context, "User ID is missing.");
            return;
        }

        string guildId = await ExtractParameter(request, "guildId", e => e.GetString(), context);
        string channelId = await ExtractParameter(request, "channelId", e => e.GetString(), context);

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



   
    public async Task HandleGetChannels(HttpContext context, JsonDocument request, string userId)
    {
        var jsonData = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(request.RootElement.GetRawText());
        string guildId = jsonData["value"].GetProperty("guildId").GetString();
        
        var channels = await _guildService.GetGuildChannels(userId, guildId);
        if (channels != null)
        {
            var updateChannelsMessage = new
            {
                Type = "update_channels",
                Data = new
                {
                    guildId = guildId,
                    channels
                }
            };
            await context.Response.WriteAsync(JsonSerializer.Serialize(updateChannelsMessage));
        }
        else
        {
            await SendErrorResponse(context, "Unable to retrieve channels.");
        }
    }

    public async Task HandleGetGuilds(HttpContext context, JsonDocument request, string userId)
    {
        var guilds = await _guildService.GetUserGuilds(userId);
        if (guilds != null)
        {
            var messageToEmit = new
            {
                Type = "update_guilds",
                Data = new { guilds }
            };
            await context.Response.WriteAsync(JsonSerializer.Serialize(messageToEmit));
        }
        else
        {
            await SendErrorResponse(context, "Unable to retrieve guilds.");
        }
    }

    public async Task HandleGetMessages(HttpContext context, JsonDocument request, string userId)
    {
        var jsonData = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(request.RootElement.GetRawText());
        string guildId = jsonData["value"].GetProperty("guildId").GetString();
        string channelId = jsonData["value"].GetProperty("channelId").GetString();

        var messages = await _messageService.GetMessages(guildId, channelId);
        var oldestMessageDate = await _messageService.GetOldestMessage(guildId, channelId);

        var messageToEmit = new
        {
            Type = "history_response",
            Data = new { messages, oldestMessageDate }
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(messageToEmit));
    }

    public async Task<T> ExtractParameter<T>(JsonDocument request, string propertyName, Func<JsonElement, T> convertFunc, HttpContext context)
    {
        if (request.RootElement.ValueKind != JsonValueKind.Object)
        {
            await SendErrorResponse(context, "msg.Data is not a valid JsonElement or is not an object.");
        }

        if (!request.RootElement.TryGetProperty(propertyName, out JsonElement valueElement) || valueElement.ValueKind != JsonValueKind.String)
        {
            await SendErrorResponse(context, $"{propertyName} is missing or not a valid string.");
        }

        return convertFunc(valueElement);
    }


    public async Task HandleNewMessage(HttpContext context, JsonDocument request, string userId)
    {
        var jsonData = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(request.RootElement.GetRawText());
        string guildId = jsonData["value"].GetProperty("guildId").GetString();
        string channelId = jsonData["value"].GetProperty("channelId").GetString();
        string content = jsonData["value"].GetProperty("content").GetString();
        
        string attachmentUrls = jsonData["value"].TryGetProperty("attachmentUrls", out var attachmentElement) ? 
            attachmentElement.GetString() : null;
        string replyToId = jsonData["value"].TryGetProperty("replyToId", out var replyToElement) ? 
            replyToElement.GetString() : null;
        string reactionEmojisIds = jsonData["value"].TryGetProperty("reactionEmojisIds", out var reactionElement) ? 
            reactionElement.GetString() : null;
        string lastEdited = jsonData["value"].TryGetProperty("lastEdited", out var lastEditedElement) ? 
            lastEditedElement.GetString() : null;

        if (!await _guildService.CanManageChannels(userId, guildId))
        {
            await SendErrorResponse(context, "User does not have permission to send message.");
            return;
        }

        await _messageService.NewMessage(userId, guildId, channelId, content, lastEdited, attachmentUrls, replyToId, reactionEmojisIds);
        await context.Response.WriteAsync(JsonSerializer.Serialize(new { Type = "success", Message = "Message sent." }));
    }

    public async Task HandleCreateChannel(HttpContext context, JsonDocument request, string userId)
    {
        var jsonData = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(request.RootElement.GetRawText());
        string guildId = jsonData["value"].GetProperty("guildId").GetString();
        bool isTextChannel = jsonData["value"].GetProperty("isTextChannel").GetBoolean();
        string channelName = jsonData["value"].GetProperty("channelName").GetString();

        if (!await _guildService.CanManageChannels(userId, guildId))
        {
            await SendErrorResponse(context, "User does not have permission to manage channels.");
            return;
        }

        await _guildService.CreateChannel(guildId, channelName, isTextChannel); 
        await context.Response.WriteAsync(JsonSerializer.Serialize(new { Type = "success", Message = "Channel created." }));
    }

    public async Task HandleGetUsers(HttpContext context, JsonDocument request, string userId)
    {
        var jsonData = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(request.RootElement.GetRawText());
        string guildId = jsonData["value"].GetProperty("guildId").GetString();

        if (!_guildService.DoesUserExistInGuild(userId, guildId))
        {
            await SendErrorResponse(context, "User not in guild.");
            return;
        }

        var users = await _guildService.GetGuildUsers(guildId);
        if (users != null)
        {
            var updateUsersMessage = new
            {
                Type = "update_users",
                Data = new { guildId = guildId, users }
            };
            await context.Response.WriteAsync(JsonSerializer.Serialize(updateUsersMessage));
        }
        else
        {
            await SendErrorResponse(context, "Unable to retrieve users.");
        }
    }



    public async Task SendErrorResponse(HttpContext context, string message)
    {
        var errorResponse = new { Type = "error", Message = message };
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = 400; 
        await context.Response.WriteAsync(JsonSerializer.Serialize(errorResponse));
    }


    
}


public class HandlerCreator
{
    private readonly AppManager _appManager;

    public HandlerCreator(AppManager appManager)
    {
        _appManager = appManager;
    }

    public async Task<Func<HttpContext, JsonDocument, string, Task>> CreateHandler(string action, HttpContext context, JsonDocument request, string userId)
    {
        if (!ParameterValidator.ValidateParameters(action, request, out string errorMessage))
        {
            await _appManager.SendErrorResponse(context, errorMessage);
            return null;
        }

        return action switch
        {
            "create_channel" => _appManager.HandleCreateChannel,
            "new_message" => _appManager.HandleNewMessage,
            "get_history" => _appManager.HandleGetMessages,
            "get_channels" => _appManager.HandleGetChannels,
            "get_users" => _appManager.HandleGetUsers,
            "get_guilds" => _appManager.HandleGetGuilds,
            "start_writing" => _appManager.HandleStartWriting,
            _ => null
        };
    }
}
public static class ParameterValidator
{
    public static bool ValidateParameters(string action, JsonDocument request, out string errorMessage)
    {
        errorMessage = string.Empty;

        if (request is null)
        {
            errorMessage = "Request JSON document is null. [Auto-generated]";
            return false;
        }

        if (!ActionMetadata.RequiredFields.ContainsKey(action))
        {
            errorMessage = "Unknown action type. [Auto-generated]";
            return false;
        }

        var requiredFields = ActionMetadata.RequiredFields[action];

        if (request.RootElement.TryGetProperty("value", out var valueElement))
        {
            if (valueElement.ValueKind != JsonValueKind.Object)
            {
                errorMessage = "'value' must be a JSON object. [Auto-generated]";
                return false;
            }

            foreach (var field in requiredFields)
            {
                if (!valueElement.TryGetProperty(field, out var _))
                {
                    errorMessage = $"{field} is missing in the request. [Auto-generated]";
                    return false;
                }
            }
        }
        else
        {
            errorMessage = "'value' object is missing. [Auto-generated]";
            return false;
        }

        return true;
    }
}


public static class ActionMetadata
{
    public static readonly Dictionary<string, List<string>> RequiredFields = new()
    {
        { "create_channel", new List<string> { "guildId", "channelName" } },
        { "new_message", new List<string> { "content", "guildId", "channelId" } },
        { "get_history", new List<string> { "guildId", "channelId" } },
        { "get_channels", new List<string> { "guildId" } },
        { "get_users", new List<string> { "guildId" } },
        { "get_guilds", new List<string> { } },
        { "start_writing", new List<string> { "guildId", "channelId" } }
    };
}



using Fleck;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Text.Json;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Collections.Generic;
using MyPostgresApp.Models;

public class WebSocketHandler
{
    private readonly WebSocketServer server;
    private readonly string secretKey;
    private readonly Dictionary<IWebSocketConnection, string> authenticatedClients = new();
    private GuildService _guildService;
    private MessageService _messageService;

    public WebSocketHandler(string url, string secretKey, GuildService guildService, MessageService messageService)
    {
        _messageService = messageService;
        _guildService = guildService;
        this.secretKey = secretKey;
        server = new WebSocketServer(url);
        server.Start(socket =>
        {
            socket.OnOpen = () => OnOpen(socket);
            socket.OnClose = () => OnClose(socket);
            socket.OnMessage = message => OnMessage(socket, message);
        });
    }

    private async void OnOpen(IWebSocketConnection socket)
    {
        if (authenticatedClients.TryGetValue(socket, out string userId))
        {
            await _guildService.SetUserOnlineStatus(userId,true); // Mark user as online
        }
    }

    private async void OnClose(IWebSocketConnection socket)
    {
        if (authenticatedClients.TryGetValue(socket, out string userId))
        {
            authenticatedClients.Remove(socket);
            var connections = authenticatedClients.Count(kv => kv.Value == userId); // Check remaining connections
            if (connections == 0)
            {
                await _guildService.SetUserOnlineStatus(userId,false); // Mark user as offline if no connections
            }
        }
    }

    
    private void HandleAuthentication(IWebSocketConnection socket, SocketMessage msg)
    {
        try
        {
            if (msg.Data is JsonElement dataElement && dataElement.ValueKind == JsonValueKind.Object)
            {
                var authData = JsonSerializer.Deserialize<AuthData>(dataElement.GetRawText());
                if (authData == null || string.IsNullOrEmpty(authData.token))
                {
                    Console.WriteLine("Authentication failed: Invalid data.");
                    socket.Send(JsonSerializer.Serialize(new { Type = "error", Message = "Invalid authentication data." }));
                    return;
                }

                string userId;
                bool isValidToken = ValidateToken(authData.token, out userId);
                if (!isValidToken)
                {
                    Console.WriteLine("Authentication failed: Invalid token.");
                    socket.Send(JsonSerializer.Serialize(new { Type = "error", Message = "Invalid token." }));
                    return;
                }

                authenticatedClients[socket] = userId;
                socket.Send(JsonSerializer.Serialize(new { Type = "authenticate", Success = true, UserId = userId }));
            }
            else
            {
                Console.WriteLine("Authentication failed: Data is not in expected format.");
                socket.Send(JsonSerializer.Serialize(new { Type = "error", Message = "Invalid authentication format." }));
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Exception in HandleAuthentication: {ex.Message}");
            socket.Send(JsonSerializer.Serialize(new { Type = "error", Message = "Authentication error." }));
        }
    }



    private void OnMessage(IWebSocketConnection socket, string message)
    {
        try
        {
            Console.WriteLine("Received: " + message);
            SocketMessage? msg = JsonSerializer.Deserialize<SocketMessage>(message);

            if (msg == null)
            {
                Console.WriteLine("Received a null message.");
                return;
            }

            if (msg.Type == "authenticate")
            {
                HandleAuthentication(socket, msg);
                return;
            }

            if (!authenticatedClients.ContainsKey(socket))
            {
                Console.WriteLine("Received message from unauthenticated client.");
                return;
            }

            HandleMessage(socket, msg);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Exception in OnMessage: {ex.Message}");
        }
    }
    private async Task HandleGetChannels(IWebSocketConnection socket, SocketMessage msg)
    {
        if (msg.Data is JsonElement dataElement && dataElement.ValueKind == JsonValueKind.Object)
        {
            var jsonData = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(dataElement.GetRawText());
            
            if (jsonData != null && jsonData.TryGetValue("value", out JsonElement guildIdElement))
            {
                string guildId = guildIdElement.GetString();
                if (!string.IsNullOrEmpty(guildId))
                {
                    var channels = await _guildService.GetGuildChannels(authenticatedClients[socket], guildId);
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
                        EmitToUser(socket, updateChannelsMessage);
                        return;
                    }
                }
            }
            Console.WriteLine("Data is null or Guild ID is missing for get_channels message.");
        }
        else
        {
            Console.WriteLine("msg.Data is not a valid JsonElement or is not an object.");
        }
    }


    private void EmitToUser(IWebSocketConnection connection, object message)
    {
        if (connection != null)
        {
            var jsonMessage = JsonSerializer.Serialize(message);
            connection.Send(jsonMessage);
        }
        else
        {
            Console.WriteLine("Connection is null, cannot send message.");
        }
    }




    private async void HandleMessage(IWebSocketConnection socket, SocketMessage msg)
    {
        try
        {
            if (msg == null)
            {
                Console.WriteLine("Received a null message in HandleMessage.");
                return;
            }

            if (!authenticatedClients.TryGetValue(socket, out string userId))
            {
                Console.WriteLine("Received message from unauthenticated client.");
                return;
            }
            switch (msg.Type)
            {
                case "keep-alive":
                    Console.WriteLine("Keep-alive message received.");
                    break;
                case "create_channel":
                    await HandleCreateChannel(socket,msg);
                    break;
                case "new_message":
                    await HandleNewMessage(socket,msg);
                    break;
                case "get_message":
                    await HandleGetMessage(socket,msg);
                    break;
                case "get_channels":
                    Console.WriteLine(msg.Data);
                    await HandleGetChannels(socket, msg);
                    break;
                case "get_users":
                    await HandleGetUsers(socket,msg);
                    break;
                case "get_guilds":
                    await HandleGetGuilds(socket,msg);
                    break;
                default:
                    Console.WriteLine($"Unknown message type: {msg.Type}");
                    break;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Exception in HandleMessage: {ex.Message}");
        }
    }
    private async Task HandleGetGuilds(IWebSocketConnection socket, SocketMessage msg)
    {
        string userId = authenticatedClients[socket];
        if(string.IsNullOrEmpty(userId)) return;
        
        var guilds = await _guildService.GetUserGuilds(userId);
        if (guilds == null) return;
        var messageToEmit = new
        {
            Type = "update_guilds",
            Data = new
            {
                guilds
            }
        };
        EmitToUser(socket, messageToEmit);
        return;
    }
    private async Task HandleGetMessage(IWebSocketConnection socket, SocketMessage msg) {
        Console.WriteLine($"Received message: {msg.Data}");
    }
    
    private async Task HandleNewMessage(IWebSocketConnection socket, SocketMessage msg)
    {
        Console.WriteLine($"Received message: {msg.Data}");

        if (msg.Data is JsonElement dataElement && dataElement.ValueKind == JsonValueKind.Object)
        {
            string guildId = dataElement.GetProperty("guildId").GetString() ?? string.Empty;
            string channelId = dataElement.GetProperty("channelId").GetString() ?? string.Empty;
            string content = dataElement.GetProperty("content").GetString() ?? string.Empty;
            string attachmentUrls = dataElement.TryGetProperty("attachmentUrls", out var attachmentElement) ? 
                attachmentElement.GetString() : null;
            string replyToId = dataElement.TryGetProperty("replyToId", out var replyToElement) ? 
                replyToElement.GetString() : null;
            string reactionEmojisIds = dataElement.TryGetProperty("reactionEmojisIds", out var reactionElement) ? 
                reactionElement.GetString() : null;
            string lastEdited = dataElement.TryGetProperty("lastEdited", out var lastEditedElement) ? 
                lastEditedElement.GetString() : null;

            if (string.IsNullOrEmpty(guildId) || string.IsNullOrEmpty(channelId) || string.IsNullOrEmpty(content))
            {
                Console.WriteLine("Properties are missing.");
                return;
            }

            if (!authenticatedClients.TryGetValue(socket, out string userId) || string.IsNullOrEmpty(userId))
            {
                Console.WriteLine("User ID is missing or socket is not authenticated.");
                return;
            }

            if (!await _guildService.CanManageChannels(userId, guildId))
            {
                Console.WriteLine("User does not have permission to send message.");
                return;
            }

            await _messageService.NewMessage(userId, guildId, channelId, content, lastEdited, attachmentUrls, replyToId, reactionEmojisIds);
            Console.WriteLine("Message sent successfully.");
        }
        else
        {
            Console.WriteLine("msg.Data is not a valid JsonElement or is not an object.");
        }
    }




    private async Task HandleCreateChannel(IWebSocketConnection socket, SocketMessage msg)
    {
        Console.WriteLine($"Received message: {msg.Data}");

        if (msg.Data is JsonElement dataElement && dataElement.ValueKind == JsonValueKind.Object)
        {
            string guildId = dataElement.GetProperty("guildId").GetString();
            bool isTextChannel = dataElement.GetProperty("isTextChannel").GetBoolean();
            string channelName = dataElement.GetProperty("channelName").GetString();

            Console.WriteLine($"Extracted - Guild ID: {guildId}, Channel Name: {channelName}, Is Text Channel: {isTextChannel}");

            if (string.IsNullOrEmpty(guildId) || string.IsNullOrEmpty(channelName))
            {
                Console.WriteLine("Guild ID or Channel Name is missing.");
                return;
            }

            string userId = authenticatedClients[socket];
            if (string.IsNullOrEmpty(userId))
            {
                Console.WriteLine("User ID is missing.");
                return;
            }

            if (!await _guildService.CanManageChannels(userId, guildId))
            {
                Console.WriteLine("User does not have permission to manage channels.");
                return;
            }

            await _guildService.CreateChannel(guildId, channelName, isTextChannel); 
            return;
        }
        else
        {
            Console.WriteLine("msg.Data is not a valid JsonElement or is not an object.");
        }
    }



    

    private async Task HandleGetUsers(IWebSocketConnection socket, SocketMessage msg)
    {
        if (msg.Data is JsonElement dataElement && dataElement.ValueKind == JsonValueKind.Object)
        {
            var jsonData = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(dataElement.GetRawText());
            
            if (jsonData != null && jsonData.TryGetValue("value", out JsonElement guildIdElement))
            {
                string guildId = guildIdElement.GetString();
                if (string.IsNullOrEmpty(guildId)) return;
                string userId = authenticatedClients[socket];
                if(string.IsNullOrEmpty(userId)) return;
                if(!_guildService.DoesUserExistInGuild(userId,guildId)) return;
                var users = await _guildService.GetGuildUsers(guildId);
                if (users == null) return;
                var updateUsersMessage = new
                {
                    Type = "update_users",
                    Data = new
                    {
                        guild_id = guildId,
                        users
                    }
                };
                EmitToUser(socket, updateUsersMessage);
                return;
            }
            Console.WriteLine("Data is null or Guild ID is missing for get_users message.");
        }
        else
        {
            Console.WriteLine("msg.Data is not a valid JsonElement or is not an object.");
        }
    }

    private bool ValidateToken(string? token, out string userId)
    {
        userId = string.Empty;

        if (string.IsNullOrEmpty(token))
        {
            Console.WriteLine("Token is null or empty.");
            return false;
        }

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(secretKey);

        try
        {
            var claimsPrincipal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero,
                ValidateLifetime = true
            }, out SecurityToken validatedToken);

            userId = claimsPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                Console.WriteLine("User ID not found in token claims.");
                return false;
            }

            return true;
        }
        catch (SecurityTokenExpiredException)
        {
            Console.WriteLine("Token has expired.");
            return false;
        }
        catch (SecurityTokenInvalidSignatureException)
        {
            Console.WriteLine("Invalid token signature.");
            return false;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Token validation error: {ex.Message}");
            return false;
        }
    }
}

public class SocketMessage
{
    public required string Type { get; set; }
    public object? Data { get; set; } // Change Data type to object to accommodate various structures
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

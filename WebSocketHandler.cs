using Fleck;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Text.Json;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Collections.Generic;

public class WebSocketHandler
{
    private readonly WebSocketServer server;
    private readonly string secretKey;
    private readonly Dictionary<IWebSocketConnection, string> authenticatedClients = new();
    private GuildService _guildService;

    public WebSocketHandler(string url, string secretKey, GuildService guildService)
    {
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

    private void OnOpen(IWebSocketConnection socket)
    {
        Console.WriteLine("Open!");
    }

    private void OnClose(IWebSocketConnection socket)
    {
        authenticatedClients.Remove(socket);
        Console.WriteLine("Close!");
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
                bool isValidToken = ValidateToken(authData.token, out userId); // Now using out parameter to get userId directly
                if (!isValidToken)
                {
                    Console.WriteLine("Authentication failed: Invalid token.");
                    socket.Send(JsonSerializer.Serialize(new { Type = "error", Message = "Invalid token." }));
                    return;
                }

                authenticatedClients[socket] = userId; // Store the authenticated client
                Console.WriteLine($"Client authenticated: {userId}");
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


    private void HandleGetChannels(string userId, string guildId)
    {
        if (string.IsNullOrEmpty(guildId))
        {
            Console.WriteLine("Guild ID is missing.");
            return;
        }

        _guildService.GetGuildChannels(userId, guildId);
    }

    private void HandleMessage(IWebSocketConnection socket, SocketMessage msg)
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

            Console.WriteLine($"User ID: {userId}");

            switch (msg.Type)
            {
                case "keep-alive":
                    Console.WriteLine("Keep-alive message received.");
                    break;
                case "create_channel":
                    Console.WriteLine("Create channel request received.");
                    break;
                case "get_channels":
                    if (msg.Data is JsonElement dataElement && dataElement.ValueKind == JsonValueKind.Object)
                    {
                        var getChannelsData = JsonSerializer.Deserialize<GetChannelsData>(dataElement.GetRawText());
                        if (getChannelsData == null || string.IsNullOrEmpty(getChannelsData.GuildId))
                        {
                            Console.WriteLine("Data is null or Guild ID is missing for get_channels message.");
                            return;
                        }
                        HandleGetChannels(userId, getChannelsData.GuildId);
                    }
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
    public string GuildId { get; set; } // For get_channels, GuildId will be here
}

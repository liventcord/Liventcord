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

    public WebSocketHandler(string url, string secretKey)
    {
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

    private void OnMessage(IWebSocketConnection socket, string message)
    {
        Console.WriteLine("Received: " + message);
        SocketMessage? msg = null;

        try
        {
            msg = JsonSerializer.Deserialize<SocketMessage>(message);
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
        //Console.WriteLine($"Deserialized message: {JsonSerializer.Serialize(msg)}");

        if (msg.Type == "authenticate")
        {
            HandleAuthentication(socket, msg);
            return;
        }

        if (!authenticatedClients.ContainsKey(socket))
        {
            Console.WriteLine("Received message from unauthenticated client.");
            socket.Close();
            return;
        }

        HandleMessage(socket, msg);
    }

    private void HandleAuthentication(IWebSocketConnection socket, SocketMessage msg)
    {
        if (msg.Data == null || string.IsNullOrEmpty(msg.Data.token))
        {
            Console.WriteLine("Authentication data is missing or token is null.");
            socket.Close();
            return;
        }

        string token = msg.Data.token;

        if (!ValidateToken(token, out var userId))
        {
            Console.WriteLine("Invalid authentication token.");
            socket.Close();
            return;
        }

        authenticatedClients[socket] = userId;
        Console.WriteLine($"User authenticated: {userId}");

        var response = new SocketMessage 
        { 
            Type = "authenticate", 
            Data = new AuthData { success = true } 
        };

        try
        {
            string jsonResponse = JsonSerializer.Serialize(response);
            socket.Send(jsonResponse);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error serializing response: {ex.Message}");
            socket.Close();
        }
    }



    private void HandleMessage(IWebSocketConnection socket, SocketMessage msg)
    {
        if (msg == null)
        {
            Console.WriteLine("Received a null message in HandleMessage.");
            return;
        }

        string userId = authenticatedClients[socket]; // Get user ID from authenticated clients
        Console.WriteLine($"User ID: {userId}");

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

    private bool ValidateToken(string? token, out string userId)
    {
        userId = string.Empty;

        if (string.IsNullOrEmpty(token))
        {
            Console.WriteLine("Token is null or empty.");
            return false; // Token is invalid
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
                return false; // User ID not found
            }

            return true; // Token is valid
        }
        catch (SecurityTokenExpiredException)
        {
            Console.WriteLine("Token has expired.");
            return false; // Token is expired
        }
        catch (SecurityTokenInvalidSignatureException)
        {
            Console.WriteLine("Invalid token signature.");
            return false; // Invalid token signature
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Token validation error: {ex.Message}");
            return false; // General validation error
        }
    }
}

public class SocketMessage
{
    public required string Type { get; set; }
    public AuthData Data { get; set; }
}

public class AuthData
{
    public string? token { get; set; }
    public bool success { get; set; }
}

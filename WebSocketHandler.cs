using Fleck;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Text.Json;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Collections.Generic;

public class WebSocketHandler
{
    private readonly List<IWebSocketConnection> clients = new();
    private readonly WebSocketServer server;
    private readonly string secretKey;
    
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
        clients.Remove(socket);
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
        Console.WriteLine($"Deserialized message: {JsonSerializer.Serialize(msg)}");


        // Extract the token from msg.Data
        string token = msg.Data?.token; // Accessing the Token property

        if (string.IsNullOrEmpty(token))
        {
            Console.WriteLine("Token is null or empty.");
            socket.Close(); // Close the connection if the token is invalid
            return;
        }

        if (!ValidateToken(token, out var userId))
        {
            Console.WriteLine("Invalid token.");
            socket.Close(); // Close the connection if the token is invalid
            return;
        }

        HandleMessage(socket, msg, userId);
    }



    private void HandleMessage(IWebSocketConnection socket, SocketMessage msg, string userId)
    {
        if (msg == null)
        {
            Console.WriteLine("Received a null message in HandleMessage.");
            return;
        }

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
    public string? token { get; set; } // Note the case for "Token" should match the incoming JSON exactly
}

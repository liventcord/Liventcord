using Fleck;
using System.Text.Json;
public class WebSocketHandler
{
    private readonly List<IWebSocketConnection> clients = new();
    private readonly WebSocketServer server;

    public WebSocketHandler(string url)
    {
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
        clients.Add(socket);
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

        HandleMessage(socket, msg);
    }

    private void HandleMessage(IWebSocketConnection socket, SocketMessage msg)
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
}

public class SocketMessage
{
    public required string Type { get; set; }
    public required string Key { get; set; }
    public string? Content { get; set; }
}

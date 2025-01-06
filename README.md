# Development Environment Setup

This branch sets up the development environment for running the server, specifically for the /app SPA route.

## Quick Start

1. Clone the repository:
    ```bash
    git clone https://github.com/liventcord/Liventcord --depth 1
    ```

2. Switch to the `dev` branch:
    ```bash
    git checkout dev
    ```


### Step 1: Set Environment Variables

1. Create the `Properties/appsettings.json` file in your project directory.
2. Add the following JSON configuration, replacing placeholders with your actual values:

    ```json
    {
      "ConnectionStrings": {
        "isPostgres": "true/false",
        "RemoteConnection": "Host=host;Database=database;Username=username;Password=password;Port=port;SSL Mode=sslmode",
        "SqlitePath": "Data Source=Data/<Database-name>.db",
      },
      "AppSettings": {
        "SecretKey": "Secret-Key"
      }
    }
    ```

### Step 2: Run the Server
dotnet run

---

### Contributing

Feel free to fork the repository and submit pull requests. We welcome contributions and improvements.

### License

This project is licensed under the GNU General Public License v3.0

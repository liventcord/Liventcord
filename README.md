# Development Environment Setup

This branch sets up the development environment for running the server, specifically for the /app SPA route.

## Quick Start

### Step 1: Set Environment Variables

1. Create the `Properties/appsettings.json` file in your project directory.
2. Add the following JSON configuration, replacing placeholders with your actual values:

    ```json
    {
      "ConnectionStrings": {
        "RemoteConnection": "Host=host;Database=database;Username=username;Password=password;Port=port;SSL Mode=sslmode",
        "SqlitePath": "Data Source=Data/<Database-name>.db",
        "isPostgres": "true/false",
      },
      "AppSettings": {
        "SecretKey": "Secret-Key"
      }
    }
    ```
    
### Step 2: Clone FrontEnd repository for assets

    $ git clone https://github.com/liventcord/LiventCordFrontEnd wwwroot

---
### Step 3: Run the Server

Execute the following command to start the server:

    $ ./run.sh

---

### Contributing

Feel free to fork the repository and submit pull requests. We welcome contributions and improvements.

### License

This project is licensed under the GNU General Public License v3.0

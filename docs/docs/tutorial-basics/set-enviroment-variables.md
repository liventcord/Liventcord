---
sidebar_position: 1
---

# Set Enviroment Variables

1. Create the `Properties/appsettings.json` file
2. Add the following JSON configuration:

    ```json
    {
      "AppSettings": {
        "Host": "127.0.0.1",
        "Port" : "5005",
        "RemoteConnection": "YOUR_CONNECTION_STRING",
        "DatabaseType": "DATABASE_TYPE",
        "SqlitePath": "Data/database.db"
      }
    }
    ```
  - **Host**:
    The hostname server will run at.
  - **Port**:
    The port server will run at.
  - **RemoteConnection**:
    The connection string for the database.

  - **DatabaseType**:
    Specifies the type of database server for data storage. Supported options:
      - **PostgreSQL**
      - **MySQL**
      - **MariaDB**
      - **SQLite**
  - **SqlitePath**
    The file sqlite will store data at.
    Defaults to sqlite if none provided
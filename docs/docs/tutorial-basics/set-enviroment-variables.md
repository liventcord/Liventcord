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
        "RemoteConnection": "CONNECTION_STRING",
        "DatabaseType": "DATABASE_TYPE",
        "SqlitePath": "Data/database.db",
        "GifWorkerUrl": "WORKER_URL"
      }
    }
    ```
  - **Host**:
    Hostname the server will run at.

  - **Port**:
    Port the server will run at.

  - **RemoteConnection**:
    Connection string for the database.

  - **DatabaseType**:
    Type of database server for data storage. Supported options:
      - **PostgreSQL**
      - **MySQL**
      - **MariaDB**
      - **SQLite**
      
  - **SqlitePath**
    File path where SQLite will store data (defaults to "sqlite" if not provided).
  
  - **GifWorkerUrl**: 
    URL of the Cloudflare Worker for querying Tenor GIFs.
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
        "GifWorkerUrl": "WORKER_URL",
        "MaxAvatarSize" : "MAX_AVATAR",
        "MaxAttachmentsSize" : "MAX_ATTACHMENTS"
      }
    }
    ```
  - **Host**:
    Hostname the server will run at.
    Defaults to 0.0.0.0

  - **Port**:
    Port the server will run at.
    Defaults to 5005

  - **RemoteConnection**:
    Connection string for the database.

  - **DatabaseType**:
    Type of database server for data storage. Supported options:
      - **PostgreSQL**
      - **MySQL**
      - **MariaDB**
      - **Oracle**
      - **Firebird**
      - **SqlServer**
      - **SQLite**
    Defaults to "sqlite".

  - **SqlitePath**
    File path where SQLite will store data.
    Defaults to Data/liventcord.db
  
  - **GifWorkerUrl**: 
    URL of the Cloudflare Worker for querying Tenor GIFs.
    Defaults to "liventcord-gif-worker.efekantunc0.workers.dev".

  - **MaxAvatarSize**:
    Maximum upload size(in MB) for avatar on guilds and profiles.
    Defaults to 3.
  
  - **MaxAttachmentsSize**:
    Maximum attachment size (in MB) allowed for message uploads.
    Defaults to 30.

  
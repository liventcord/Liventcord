# LiventCord

**LiventCord** is a privacy-focused communication platform that enables real-time messaging, channel management, file sharing, and voice/video communication, with a focus on data security.

## Why LiventCord?

LiventCord is an open-source alternative to popular communication platforms, designed with privacy and security at its core. It provides a platform where users can communicate freely without being tracked or having their data used for advertising. As an open-source project, LiventCord ensures transparency and gives users full control over their data.

Built with **.NET Core** and using **PostgreSQL** with **Entity Framework Core**, LiventCord provides a reliable backend for managing communication and user interactions.

## Features

- **Guild & Channel Management**: APIs to create, join, and manage guilds and channels.
- **Messaging**: Send, receive, and delete messages with rich formatting, mentions, reactions, and emoji support.
- **Search**: Full-text search to quickly retrieve past conversations.
- **Friendship & Invitations**: Manage friends and invite users to guilds.
- **Permissions**: Fine-grained control over guild and channel permissions.
- **File Sharing**: Upload and retrieve various file types (images, videos, documents, etc.).
- **Voice & Video**: Real-time group and direct voice/video chat.
- **Custom Profiles**: Users can personalize profiles with avatars.
- **Custom Presence**: Set status with custom messages to reflect availability or activity.
- **Direct Messaging**: 1-on-1 messaging with real-time updates.

## Getting Started

To get started with **LiventCord**, you can set up the backend locally

### Prerequisites

- **.NET Core SDK**
- **PostgreSQL**(Optional) database system for storing user and message data

### Clone the Repository

    $ git clone https://github.com/liventcord/liventcord
---
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
---
### Step 2: Run the Server

Execute the following command to start the server:

    $ ./run.sh

---

### Contributing

Feel free to fork the repository and submit pull requests. We welcome contributions and improvements.

### License

This project is licensed under the GNU General Public License v3.0

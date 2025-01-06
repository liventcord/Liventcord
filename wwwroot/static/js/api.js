const EventType = Object.freeze({
    CREATE_CHANNEL: "create_channel",
    JOIN_GUILD: "join_guild",
    CREATE_GUILD: "create_guild",
    DELETE_GUILD: "delete_guild",
    DELETE_GUILD_IMAGE: "delete_guild_image",
    NEW_MESSAGE: "new_message",
    GET_MEMBERS: "get_members",
    GET_CHANNELS: "get_channels",
    GET_FRIENDS: "get_friends",
    GET_HISTORY: "get_history",
    GET_SCROLL_HISTORY: "get_old_history",
    GET_GUILDS: "get_guilds",
    GET_INVITES: "get_invites",
    START_TYPING: "start_typing",
    STOP_TYPING: "stop_typing",
    ADD_FRIEND: "add_friend",
    ADD_FRIEND_ID: "add_friend_id",
    CHANGE_NICK: "change_nick",
    ADD_DM: "add_dm"
});

const HttpMethod = Object.freeze({
    POST: "POST",
    GET: "GET",
    PUT: "PUT",
    DELETE: "DELETE",
});

const EventHttpMethodMap = {
    [EventType.CREATE_CHANNEL]: HttpMethod.POST,
    [EventType.JOIN_GUILD]: HttpMethod.POST,
    [EventType.CREATE_GUILD]: HttpMethod.POST,
    [EventType.DELETE_GUILD]: HttpMethod.DELETE,
    [EventType.DELETE_GUILD_IMAGE]: HttpMethod.DELETE,
    [EventType.NEW_MESSAGE]: HttpMethod.POST,
    [EventType.GET_MEMBERS]: HttpMethod.GET,
    [EventType.GET_CHANNELS]: HttpMethod.GET,
    [EventType.GET_FRIENDS]: HttpMethod.GET,
    [EventType.GET_HISTORY]: HttpMethod.GET,
    [EventType.GET_SCROLL_HISTORY]: HttpMethod.GET,
    [EventType.GET_GUILDS]: HttpMethod.GET,
    [EventType.GET_INVITES]: HttpMethod.GET,
    [EventType.START_TYPING]: HttpMethod.POST,
    [EventType.STOP_TYPING]: HttpMethod.POST,
    [EventType.ADD_FRIEND]: HttpMethod.POST,
    [EventType.ADD_FRIEND_ID]: HttpMethod.POST,
    [EventType.CHANGE_NICK]: HttpMethod.PUT,
    [EventType.ADD_DM]: HttpMethod.POST
};

const EventUrlMap = {
    [EventType.CREATE_CHANNEL]: "/guilds/{guildId}/channels",
    [EventType.JOIN_GUILD]: "/guilds/{guildId}/members",
    [EventType.CREATE_GUILD]: "/guilds",
    [EventType.DELETE_GUILD]: "/guilds/{guildId}",
    [EventType.DELETE_GUILD_IMAGE]: "/guilds/{guildId}/image",
    [EventType.NEW_MESSAGE]: "/guilds/{guildId}/channels/{channelId}/messages",
    [EventType.GET_MEMBERS]: "/guilds/{guildId}/members",
    [EventType.GET_CHANNELS]: "/guilds/{guildId}/channels/",
    [EventType.GET_FRIENDS]: "/friends",
    [EventType.GET_HISTORY]: "/guilds/{guildId}/channels/{channelId}/messages",
    [EventType.GET_SCROLL_HISTORY]: "/guilds/{guildId}/channels/{channelId}/messages",
    [EventType.GET_GUILDS]: "/guilds",
    [EventType.GET_INVITES]: "/guilds/{guildId}/invites",
    [EventType.START_TYPING]: "/guilds/{guildId}/channels/{channelId}/typing/start",
    [EventType.STOP_TYPING]: "/guilds/{guildId}/channels/{channelId}/typing/stop",
    [EventType.ADD_FRIEND]: "/friends?name={friendName}&discriminator={friendDiscriminator}",
    [EventType.ADD_FRIEND_ID]: "/friends?id={friendId}",
    [EventType.CHANGE_NICK]: "/nicks",
    [EventType.ADD_DM]: "/dm/friendId={friendId}"
};

class ApiClient {
    constructor() {
        this.listeners = {};
        this.nonResponseEvents = [EventType.START_TYPING, EventType.STOP_TYPING,EventType.CHANGE_NICK];
    }

    getHttpMethod(event) {
        const method = EventHttpMethodMap[event];
        if (!method) {
            throw new Error(`HTTP method not defined for event: ${event}`);
        }
        return method;
    }

    getUrlForEvent(event, data = {}) {
        const basePath = "/api";
        const urlTemplate = EventUrlMap[event];
        
        if (!urlTemplate) {
            throw new Error(`Unknown event: ${event}`);
        }

        let url = urlTemplate;
        Object.keys(data).forEach(key => {
            url = url.replace(`{${key}}`, data[key]);
        });

        return { method: this.getHttpMethod(event), url: basePath + url };
    }


    handleError(status, event) {
        console.error(event,isOnDm);
        if (event === EventType.ADD_DM && isOnDm && status === 404) {
            alertUser("Error: User does not exists");
        } else if (status === 404) {
            alertUser("Error: The requested resource was not found.");
        } else if (status >= 400 && status < 500) {
            alertUser("Client error occurred.");
        } else if (status >= 500) {
            alertUser("Server error. Please try again later.");
        } else {
            alertUser("An unexpected error occurred.");
        }
    }
    

    async sendRequest(data, url, method, event,expectsResponse = true) {
        try {
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: method === HttpMethod.GET ? undefined : JSON.stringify(data),
                credentials: "same-origin",
            });

            if (!response.ok) {
                this.handleError(response.status, event);
                return null;
            }

            if (!expectsResponse) {
                return null;
            }

            const responseBody = await response.text();
            return responseBody ? JSON.parse(responseBody) : null; 
        } catch (error) {
            console.error("Failed to send request:", error);
            throw error;
        }
    }
    
    async send(event, data = {}) {
        if (!event) {
            console.error("Event is required");
            return;
        }
    
        const expectsResponse = !this.nonResponseEvents.includes(event);
    
        try {
            const { url, method } = this.getUrlForEvent(event, data);
    
            const response = await this.sendRequest(data, url, method, event,expectsResponse);
            this.handleMessage(event, response);
        } catch (error) {
            console.error(`Error during request for event "${event}":`, error, event, data);
        }
    }

    handleMessage(event,  data) {
        if (this.nonResponseEvents.includes(event)) {
            //console.log(`Event "${event}" processed. No response expected.`);
            return; 
        }
        //console.log(`Received response for event "${event}" `, data);
        if (this.listeners[event] && data != null) {
            this.listeners[event].forEach(callback => {
                callback(data);
            });
        }
    }


    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }
}

const apiClient = new ApiClient();
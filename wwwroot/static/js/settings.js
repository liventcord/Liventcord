const EventType = Object.freeze({
    CREATE_CHANNEL: 'create_channel',
    JOIN_GUILD: 'join_guild',
    CREATE_GUILD: 'create_guild',
    DELETE_GUILD: 'delete_guild',
    DELETE_GUILD_IMAGE: 'delete_guild_image',
    NEW_MESSAGE: 'new_message',
    GET_MEMBERS: 'get_members',
    GET_FRIENDS: 'get_friends',
    GET_HISTORY: 'get_history',
    GET_GUILDS: 'get_guilds',
    START_WRITING: 'start_writing',
    ADD_FRIEND: 'add_friend',
    ADD_FRIEND_ID: 'add_friend_id'
});

const HttpMethod = Object.freeze({
    POST: 'POST',
    GET: 'GET',
    PUT: 'PUT',
    DELETE: 'DELETE',
});

const EventHttpMethodMap = {
    [EventType.CREATE_CHANNEL]: HttpMethod.POST,
    [EventType.JOIN_GUILD]: HttpMethod.POST,
    [EventType.CREATE_GUILD]: HttpMethod.POST,
    [EventType.DELETE_GUILD]: HttpMethod.DELETE,
    [EventType.DELETE_GUILD_IMAGE]: HttpMethod.DELETE,
    [EventType.NEW_MESSAGE]: HttpMethod.POST,
    [EventType.GET_MEMBERS]: HttpMethod.GET,
    [EventType.GET_FRIENDS]: HttpMethod.GET,
    [EventType.GET_HISTORY]: HttpMethod.GET,
    [EventType.GET_GUILDS]: HttpMethod.GET,
    [EventType.START_WRITING]: HttpMethod.POST,
    [EventType.ADD_FRIEND]: HttpMethod.POST,
    [EventType.ADD_FRIEND_ID]: HttpMethod.POST,
};

class CustomHttpConnection {
    constructor() {
        this.listeners = {};
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
        let url;

        switch (event) {
            case EventType.CREATE_CHANNEL:
                url = `${basePath}/guilds/${data.guildId}/channels`;
                break;
            case EventType.JOIN_GUILD:
                url = `${basePath}/guilds/${data.guildId}/members`;
                break;
            case EventType.CREATE_GUILD:
                url = `${basePath}/guilds`;
                break;
            case EventType.DELETE_GUILD:
                url = `${basePath}/guilds/${data.guildId}`;
                break;
            case EventType.DELETE_GUILD_IMAGE:
                url = `${basePath}/guilds/${data.guildId}/image`;
                break;
            case EventType.NEW_MESSAGE:
                url = `${basePath}/guilds/${data.guildId}/channels/${data.channelId}/messages`;
                break;
            case EventType.GET_MEMBERS:
                url = `${basePath}/guilds/${data.guildId}/members`;
                break;
            case EventType.GET_FRIENDS:
                url = `${basePath}/friends`;
                break;
            case EventType.GET_HISTORY:
                url = `${basePath}/guilds/${data.guildId}/channels/${data.channelId}/messages`;
                break;
            case EventType.GET_GUILDS:
                url = `${basePath}/guilds`;
                break;
            case EventType.START_WRITING:
                url = `${basePath}/guilds/${data.guildId}/channels/${data.channelId}/typing`;
                break;
            case EventType.ADD_FRIEND:
                url = `${basePath}/friends`;
                break;
            case EventType.ADD_FRIEND_ID:
                url = `${basePath}/guilds/${data.guildId}/channels/${data.channelId}/typing`;
                break;
            default:
                throw new Error(`Unknown event: ${event}`);
        }

        return { method: this.getHttpMethod(event), url };
    }

    async sendRequest(data, url, method) {
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: method === HttpMethod.GET ? undefined : JSON.stringify(data),
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error(`Request failed with status: ${response.status}`);
            }

            return response.json();
        } catch (error) {
            console.error("Failed to send request:", error);
            throw error;
        }
    }

    async emit(event, data = {}) {
        if (!event) {
            console.error("Event is required");
            return;
        }

        try {
            const { url, method } = this.getUrlForEvent(event, data);
            const payload = { action: event, value: data };

            const response = await this.sendRequest(payload, url, method);
            this.handleMessage(event, response);
        } catch (error) {
            console.warn(`Error during request for event "${event}":`, error);
        }
    }

    handleMessage(event,  data) {
        console.log(`Received response for event "${event}" `, data);
        
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

const socket = new CustomHttpConnection();




let currentTimeout;


let isUnread = false;
let wasNotChangingUrl = false;
let isImagePreviewOpen = false;
let closeCurrentJoinPop;
let guildsList;
let isOnGuild = false;



const MyAccount = "MyAccount";
const SoundAndVideo = "SoundAndVideo";
const Notifications = "Notifications";
const ActivityPresence = "ActivityPresence";
const Appearance = "Appearance";
let isSettingsOpen = false;
let isUnsaved = false;
let isChangedProfile = false;
let isChangedNick = false;
let isInitialized = false;
let shakeForce = 1;
let resetTimeout; 
let currentPopUp = null;

let microphoneButton = null;
let earphoneButton;
let isEmailToggled = false;

let logoClicked = 0;
let isGuildSettings = false;
let currentSettingsType = MyAccount;



const userListTitleHTML = `
<h1 id='nowonline' style="font-weight: bolder;">Şimdi Aktif</h1> <ul> </ul>
`;


function getId(string) { return document.getElementById(string);}
const createEl = (tag, options) => Object.assign(document.createElement(tag), options);






function clearCookies() {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
        const [name] = cookie.split('=');
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
}
function saveBooleanCookie(name, value) {
    value = value ? 1 : 0;
    const expires = new Date();
    expires.setTime(expires.getTime() + (365 * 24 * 60 * 60 * 1000));
    const expiresStr = `expires=${expires.toUTCString()}`;
    const cookieValue = encodeURIComponent(value);
    document.cookie = `${encodeURIComponent(name)}=${cookieValue}; ${expiresStr}; path=/`;
}

function loadBooleanCookie(name) {
    const cookieName = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
        if (cookie.startsWith(cookieName)) {
            const result = decodeURIComponent(cookie.substring(cookieName.length));
            return result == 1;
        }
    }
    return null;
}














function generateSettingsHtml(settings,isGuild=false) {
    const buttons = settings.map(setting => `
        <button class="settings-buttons" onclick="selectSettingCategory('${setting.category}')">${setting.label}</button>
    `).join('\n');


    if(isGuild) {  return buttons; }
    
    return `
    ${buttons}
        <button class="settings-buttons" style="bottom:10%; left:0px; position:fixed;" onclick="logOutPrompt()">Çıkış yap</button>
    `;
    


}

const userSettings = [
    { category: 'MyAccount', label: 'Hesabım' },
    { category: 'SoundAndVideo', label: 'Ses Ve Görüntü' },
    { category: 'Notifications', label: 'Bildirimler' },
    { category: 'ActivityPresence', label: 'Etkinlik Gizliliği' },
    { category: 'Appearance', label: 'Görünüm' }
];

const guildSettings = [
    { category: 'Overview', label: 'Genel Görünüm' },
    { category: 'Emoji', label: 'Emoji' },
];




function createDeleteGuildPrompt(guildId,guild_name) {
    if(!guildId) { return }
    var onClickHandler = function() {
        socket.emit(EventType.DELETE_GUILD, guildId);
    }
    const successText = "Sunucuyu sil";
    askUser(`${guild_name} Sunucusunu Sil`,'Bu işlem geri alınamaz.',successText,onClickHandler,isRed=true);

} 
async function requestMicrophonePermissions() {
    try {
        const isNoMic = false;
        if(isNoMic) {
            const response = await fetch('/static/notification.mp3');
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onload = function () {
                const bytes = new Uint8Array(reader.result);
                audioManager.emit('audio_data', bytes);
            };
            reader.readAsArrayBuffer(blob);
        }
        else
        {
            await sendAudioData();
        }
        
    } catch (error) {
        console.log(error);
        alertUser('MİKROFON ERİŞİMİ ENGELLENDİ', 'Mikrofon izni reddedildi.');
        return false; // Permission denied or error occurred
    }
} 



function applySettings() {
    
    if(currentPopUp) {
        hidePopUp(currentPopUp);
        
    }
    console.log(isUnsaved);
    if(isUnsaved) {

        if(isGuildSettings) {
            changeGuildName();
            
            if(isSelfAuthor()) {
                uploadImage(true);
            }

        } else {
            // in default settings
            changeNickname();
            uploadImage(false);
        }


        isUnsaved = false;
    }

}




function onEditNick() {
    isUnsaved = true;
    if(!currentPopUp) {
        let _currentPopUp = generateUnsavedPopUp();
        currentPopUp = _currentPopUp;

    }
    
    showUnsavedPopUp(currentPopUp);


}
function removeElement(elementname) {
    const element = document.getElementById(elementname);
    if(element) {
        element.remove();
    }
}


function removeguildImage() {
    socket.emit(EventType.DELETE_GUILD_IMAGE,{'guildId': currentGuildId})
    getId('guildImage').value = '';
    getId('guild-image').src = createBlackImage();


}





socket.on('update_guilds',data => {
    updateGuildList(data);
});


socket.on('deletion_message', data=> {
    deleteLocalMessage(data.messageId,data.guildId,data.channelId,data.isDm);
    if(guildChatMessages && guildChatMessages[currentChannelId] && guildChatMessages[currentChannelId] [data.messageId]) {
        delete guildChatMessages[currentChannelId][data.messageId];
    }
    const msgdate = messages_raw_cache[data.messageId].date;
    if(lastMessageDate == new Date(msgdate).setHours(0, 0, 0, 0)) {
        lastMessageDate = new Date(getLastSecondMessageDate()).setHours(0, 0, 0, 0)
        
    }
    if(bottomestChatDateStr  == msgdate) {
        bottomestChatDateStr = getLastSecondMessageDate();
    }
    delete guildChatMessages[currentChannelId][data.messageId];
    delete messages_raw_cache[data.messageId];
});

socket.on('join_guild_response',data=> {
    if(!data.success) {
        const errormsg = "DAVET BAĞLANTISI - Davet geçersiz ya da geçerliliğini yitirmiş.";
        getId('create-guild-title').textContent = errormsg;
        getId('create-guild-title').style.color = 'red';
        return;
    }
    if(!permissions_map[data.guildId]) { permissions_map[data.guildId] = [] };
    
    
    permissions_map[data.guildId] = data.permissions_map;
    loadGuild(data.joined_guildId,data.joined_channelId,data.joined_guild_name,data.joined_author_id);

    if(closeCurrentJoinPop) {
        closeCurrentJoinPop();
    }
});



socket.on('message_readen', data => {
    if(data) {
        console.log(data);
        Object.keys(data).forEach(key => {
            readenMessagesCache[key] = data[key];
        })
    }
});
socket.on('deleted_guild', data => {
    if(typeof(data) == 'object') {
        if(data.success) {
            closeSettings();
            removeFromGuildList(data.guildId);
            loadMainMenu();
        } else {
            alertUser('Sunucu silme başarısız.');
        }
        
    } else {
        alertUser('Sunucu silme hatası',data);
    }
});
socket.on('current_invite_ids_response', data => {
    if (data && data.invite_ids) {
        if (!current_invite_ids[data.guildId]) {
            current_invite_ids[data.guildId] = [];
        }
        current_invite_ids[data.guildId] = data.invite_ids;
    } else {
        console.warn("Invite ids do not exist.");
    }
});

socket.on('update_',data => {
    if(data.guildId == currentGuildId) {
        getId('guild-name').innerText = currentGuildName;
    }
})
socket.on('update_guild_image',data => {
    updateGuild(data)
    
})
socket.on('old_messages_response', function(data) {
    handleOldMessagesResponse(data);
});




socket.on('update_user_profile', data => {
    refreshUserProfileImage(data.user_id);
});




socket.on('create_channel_response', data => {
    if(data.success == undefined || data.success == true) return;
    alertUser(`${currentGuildName} sunucusunda kanal yönetme iznin yok!`);
});

let reply_cache = {};
let messages_cache = {};
let guildChatMessages = {};
let messages_raw_cache = {};


socket.on('bulk_reply_response', data => {
    const replies = data.bulk_replies;
    replies.forEach(reply => {
        const { messageId, user_id, content, attachment_urls } = reply;
        if (!reply_cache[messageId]) {
            reply_cache[messageId] = {
                messageId: messageId,
                replies: []
            };
        }
        reply_cache[messageId].replies.push({ user_id, content, attachment_urls });
    });
    setTimeout(() => {
        handleReplies();
    }, 100);
});


socket.on('update_users', data => {
    if (!data || !data.users || !data.guildId) { return; }
    
    guild_users_cache[data.guildId] = data.users;
    updateUserList(data.users);   
    
});

socket.on('update_channels', data => {
    console.log("updated channels with: ", data);
    if(!data || !data.channels || !data.guildId) { return; }
    channels_cache[data.guildId] = data.channels;
    updateChannels(data.channels);

});


socket.on('channel_update', data => {
    if (!data) return;
    const updateType = data.type;
    const removeType = 'remove';
    const editType = 'edit';
    const createType = 'create';

    if(updateType == createType) {
        const channel = {
            guildId : data.guildId,
            channelId: data.channelId,
            channel_name: data.channel_name,
            is_text_channel: data.is_text_channel
        };
        
        
        addChannel(channel);
    }
    else if (updateType === removeType) {
        removeChannel(data);
    } else if (updateType === editType) {
        editChannel(data);
    }
});



function updateUserOnlineStatus(userId, isOnline) {
    if(userId == currentUserId) {return; }
    for (const guildId in guild_users_cache) {
        if (guild_users_cache.hasOwnProperty(guildId)) {
            const users = guild_users_cache[guildId];
            for (const userKey in users) {
                if (users.hasOwnProperty(userKey)) {
                    if (users[userKey].user_id === userId) {
                        users[userKey].is_online = isOnline;
                        console.log(`User ${userId} online status updated to ${isOnline} in guild ${guildId}`);
                        return; 
                    }
                }
            }
        }
    }
    console.log(`User ${userId} not found in any guild`);
}

socket.on('user_status', (data) => {
    const user_id = data.user_id;
    const is_online = data.is_online;
    updateUserOnlineStatus(user_id, is_online)
});

socket.on('message', (data) => {
    try {
        const { isDm, messageId, user_id, content, channelId, date, attachment_urls, reply_to_id,is_bot, guildId, last_edited, reaction_emojis_ids} = data;
        const idToCompare = isDm ? currentDmId : currentChannelId;
        
        if (data.guildId != currentGuildId || idToCompare != channelId) {
            console.log(`${idToCompare} is not ${channelId} so returning`);
            if (user_id !== currentUserId) {
                playNotification();
                setActiveIcon();
            }
            return;
        }

        displayChatMessage(data);

        fetchReplies(data);

    } catch (error) {
        console.error('Error processing message:', error);
    }
});

socket.on('message_date_response', (data)=> {
    const message_date = data.message_date;
    messageDates[data.messageId] = message_date;
    console.log(currentLastDate,message_date)
    if(currentLastDate && currentLastDate > message_date) {
        GetOldMessages(message_date,data.messageId);
    } else {
        console.log("Is less than!", currentLastDate, message_date)
    }
});



socket.on('history_response', (data) => {
    handleHistoryResponse(data);  
});


socket.on('update_nick',data => {
    const userid = data.user_id;
    const newNickname = data.user_name;
    if(userid == currentUserId) {
        
        const settingsNameText = getId('settings-self-name');
        const setInfoNick = getId('set-info-nick');
        const selfName = getId('self-name');
        
        selfName.innerText = newNickname;
        if(setInfoNick) {
            setInfoNick.innerText = newNickname;
        }
        if(settingsNameText) {
            settingsNameText.innerText = newNickname;
        }
        currentUserName = newNickname;
        return;
    }
    
    refreshUserProfileImage(null,newNickname);
});



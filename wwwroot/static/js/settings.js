class CustomWebSocket {
    constructor(url, token) {
        this.url = url;
        this.token = token;
        this.socket = null;
        this.listeners = {};
        this.connected = false;
        this.connect();
    }

    connect() {
        this.socket = new WebSocket(this.url);
        this.socket.onmessage = (event) => this.handleMessage(event);
        this.socket.onopen = () => this.onOpen();
        this.socket.onclose = () => this.onClose();
    }

    onOpen() {
        console.log('Connected to server');
        this.authenticate();
    }

    authenticate() {
        if (this.token && this.token.trim()) {
            this.emit('authenticate', { token: this.token });
        } else {
            console.error("Authentication failed: Token is null or empty.");
        }
    }

    onClose() {
        console.log("Disconnected from the server. Attempting to reconnect...");
        this.connected = false;
        setTimeout(() => this.reconnect(), 5000);
    }

    reconnect() {
        console.log("Reconnecting...");
        this.connect();
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data = {}) {
        const message = JSON.stringify({ Type: event, Data: this.prepareData(data) });
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        }
    }
    
    prepareData(data) {
        if (data === null || data === undefined) {
            return {}; // Return an empty object for null or undefined
        }
        if (typeof data === 'object') {
            return data; // Return the object as-is
        }
        return { value: data }; // Wrap other types in an object for consistency
    }
    

    handleMessage(event) {
        const msg = JSON.parse(event.data);
        const eventType = msg.Type;
        if (this.listeners[eventType]) {
            this.listeners[eventType].forEach(callback => callback(msg.Data));
        }

        if (eventType === 'authenticate' && msg.Data.success) {
            this.connected = true; // Only set to true on successful auth
            console.log("Successfully authenticated. Connected state:", this.connected);
            this.emit('keep-alive'); // Send keep-alive message now that authenticated
        }

        console.log("Token updated:", msg.Data.token); // Update token, if present
    }

    disconnect() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            console.log("Closing the WebSocket connection...");
            this.socket.close();
        } else {
            console.log("WebSocket is already closed or not initialized.");
        }
    }
}



function initializeWebSocket() {
    const token = localStorage.getItem('jwtToken'); 
    if (token) {
        const serverUrl = `${window.location.protocol.replace('http', 'ws')}//${window.location.hostname}:8181`;
        const socket = new CustomWebSocket(serverUrl, token);
        return socket;
    } else {
        console.error('No valid token found. Please log in first.');
    }
}
const socket = initializeWebSocket();


let isDisconnected = false;
let disconnectTimer = null;
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
function isSelfAuthor() {
    return isAuthor(currentUserId);
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




function createDeleteGuildPrompt(guild_id,guild_name) {
    if(!guild_id) { return }
    var onClickHandler = function() {
        socket.emit('delete_guild', guild_id);
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
                socket.emit('audio_data', bytes);
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
    socket.emit('remove_guild_image',{'guild_id': currentGuildId})
    getId('guildImage').value = '';
    getId('guild-image').src = createBlackImage();


}





function updateGuildList(data) {
    console.log('Guilds Updated:', data);
}

socket.connect();

socket.on('connect', function() {
    console.log('Connected to server');
    socket.emit('keep-alive');

    if(!currentTimeout) {
        currentTimeout = setTimeout(function refresh_keep_alive() {
            socket.emit('keep-alive');
            if(socket.connected) {
                hideLoadingScreen();
            }
            setTimeout(refresh_keep_alive, 30000); 
        }, 30000);

    }

    hideLoadingScreen();

    if (isDisconnected) {
        isDisconnected = false;
        console.log('Reconnected after being disconnected');
        if(isOnGuild) {
            loadGuild(currentGuildId,currentChannelId,currentGuildName);
        } else if(isOnDm){
            OpenDm(currentDmId);
        } else if(isOnMe) {
            selectFriendMenu(online);
        }
    } else {

    }
    if (disconnectTimer) {
        clearInterval(disconnectTimer);
        disconnectTimer = null;
    }
});

socket.on('reconnect', () => {
    console.log('Reconnected to server');
    isDisconnected = false;
    if (disconnectTimer) {
        clearInterval(disconnectTimer);
        disconnectTimer = null;
    }

    hideLoadingScreen();
    loadGuild(currentGuildId,currentChannelId,currentGuildName);
});

socket.on('disconnect', (reason, details) => {
    console.log('Disconnected from server.', reason);
    const domains = ['https://liventcord.serveo.net', 'https://liventcord.loophole.site'];
    isDisconnected = true;
    const checkDomain = (domain) => {
        const img = new Image();
        img.onload = () => {
            console.log('Domain is up:', domain);
            setTimeout(() => {
                if (!socket.connected) {
                    window.location.href = domain + window.location.pathname;
                }
            }, 5000);
        };
        img.onerror = () => {
            console.log('Domain is down:', domain);
            if (domains.indexOf(domain) === domains.length - 1) {
                if (loadingScreen) {
                    loadingScreen.style.display = 'flex';
                }
            }

        };
        img.src = `${domain}/static/images/icons/favicon.png`; 
    };

    //domains.forEach((domain) => checkDomain(domain));
    setTimeout(() => {
        if (!socket.connected && loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
        
    }, 10000);
});


socket.on('update_guilds',data => {
    updateGuildList(data);
});


socket.on('deletion_message', data=> {
    deleteLocalMessage(data.message_id,data.guild_id,data.channel_id,data.is_dm);
    if(guildChatMessages && guildChatMessages[currentChannelId] && guildChatMessages[currentChannelId] [data.message_id]) {
        delete guildChatMessages[currentChannelId][data.message_id];
    }
    const msgdate = messages_raw_cache[data.message_id].date;
    if(lastMessageDate == new Date(msgdate).setHours(0, 0, 0, 0)) {
        lastMessageDate = new Date(getLastSecondMessageDate()).setHours(0, 0, 0, 0)
        
    }
    if(bottomestChatDateStr  == msgdate) {
        bottomestChatDateStr = getLastSecondMessageDate();
    }
    delete guildChatMessages[currentChannelId][data.message_id];
    delete messages_raw_cache[data.message_id];
});

socket.on('join_guild_response',data=> {
    if(!data.success) {
        const errormsg = "DAVET BAĞLANTISI - Davet geçersiz ya da geçerliliğini yitirmiş.";
        getId('create-guild-title').textContent = errormsg;
        getId('create-guild-title').style.color = 'red';
        return;
    }
    if(!permissions_map[data.guild_id]) { permissions_map[data.guild_id] = [] };
    
    
    permissions_map[data.guild_id] = data.permissions_map;
    loadGuild(data.joined_guild_id,data.joined_channel_id,data.joined_guild_name,data.joined_author_id);

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
            removeFromGuildList(data.guild_id);
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
        if (!current_invite_ids[data.guild_id]) {
            current_invite_ids[data.guild_id] = [];
        }
        current_invite_ids[data.guild_id] = data.invite_ids;
    } else {
        console.warn("Invite ids do not exist.");
    }
});

socket.on('update_',data => {
    if(data.guild_id == currentGuildId) {
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
        const { message_id, user_id, content, attachment_urls } = reply;
        if (!reply_cache[message_id]) {
            reply_cache[message_id] = {
                message_id: message_id,
                replies: []
            };
        }
        reply_cache[message_id].replies.push({ user_id, content, attachment_urls });
    });
    setTimeout(() => {
        handleReplies();
    }, 100);
});
function updateUsersMetaData(users, blocked_users) {
    if (!users) {
        console.log("Invalid users", users);
        return;
    }

    for (const userId in users) {
        if (Object.prototype.hasOwnProperty.call(users, userId)) {
            const [nick, discriminator] = users[userId];
            const is_blocked = blocked_users ? blocked_users.hasOwnProperty(userId) : false;
            addUser(userId, nick, discriminator, is_blocked);
        }
    }

    console.log("Updated userNames:", userNames);
}

socket.on('update_users', data => {
    if (!data || !data.users || !data.guild_id) { return; }
    
    guild_users_cache[data.guild_id] = data.users;
    updateUserList(data.users);   
    
});

socket.on('update_channels', data => {
    if(!data || !data.channels || !data.guild_id) { return; }
    channels_cache[data.guild_id] = data.channels;
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
            guild_id : data.guild_id,
            channel_id: data.channel_id,
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

socket.on('update_users_metadata', data => {
    if (!data || !data.users || !data.guild_id) { return; }
    users_metadata_cache[data.guild_id] = data.users;

    updateUsersMetaData(data.users,data.blocked_users);
});


function updateUserOnlineStatus(userId, isOnline) {
    if(userId == currentUserId) {return; }
    for (const guild_id in guild_users_cache) {
        if (guild_users_cache.hasOwnProperty(guild_id)) {
            const users = guild_users_cache[guild_id];
            for (const userKey in users) {
                if (users.hasOwnProperty(userKey)) {
                    if (users[userKey].user_id === userId) {
                        users[userKey].is_online = isOnline;
                        console.log(`User ${userId} online status updated to ${isOnline} in guild ${guild_id}`);
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
        const { is_dm, message_id, user_id, content, channel_id, date, attachment_urls, reply_to_id,is_bot, guild_id, last_edited, reaction_emojis_ids} = data;
        const idToCompare = is_dm ? currentDmId : currentChannelId;
        
        if (data.guild_id != currentGuildId || idToCompare != channel_id) {
            console.log(`${idToCompare} is not ${channel_id} so returning`);
            if (user_id !== currentUserId) {
                playNotification();
                setActiveIcon();
            }
            return;
        }

        displayChatMessage(data);

        fetchReplies(data);
        if(user_id == currentUserId) {
            setTimeout(() => {
                scrollToBottom();
            }, 30);
        }

    } catch (error) {
        console.error('Error processing message:', error);
    }
});

socket.on('message_date_response', (data)=> {
    const message_date = data.message_date;
    messageDates[data.message_id] = message_date;
    console.log(currentLastDate,message_date)
    if(currentLastDate && currentLastDate > message_date) {
        GetOldMessages(message_date,data.message_id);
    } else {
        console.log("Is less than!", currentLastDate, message_date)
    }
});



socket.on('history_data_response', (data) => {
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



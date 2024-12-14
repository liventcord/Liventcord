let currentGuildId;
let currentDmId;
let currentGuildName = '';


class BaseCache {
    constructor() {
        this.data = {};
    }

    set(key, value) {
        this.data[key] = value;
    }

    get(key) {
        return this.data[key] || null;
    }

    setArray(key, value) {
        this.data[key] = Array.isArray(value) ? value : [];
    }

    setObject(key, value) {
        this.data[key] = typeof value === 'object' && value !== null ? value : {};
    }
}

class Guild {
    constructor(guildId) {
        this.guildId = guildId;
        this.channels = new ChannelCache();
        this.members = new GuildMembersCache();
        this.typingMembers = new BaseCache();
        this.inviteIds = new InviteIdsCache();
        this.messages = new MessagesCache();
        this.ownerId = null;
    }

    setOwner(ownerId) {
        this.ownerId = ownerId;
    }

    getOwner() {
        return this.ownerId;
    }

    isOwner(userId) {
        return this.ownerId === userId;
    }

    hasMembers() {
        return !this.members.isMembersEmpty(this.guildId);
    }
}

class ChannelCache extends BaseCache {
    setChannels(guildId, channels) {
        this.setArray(guildId, Array.isArray(channels) ? channels.flat() : []);
    }

    getChannels(guildId) {
        const channels = this.get(guildId) || [];
        return Array.isArray(channels) ? channels.flat() : [];
    }

    addChannel(guildId, channel) {
        const channels = this.getChannels(guildId); 
        if (!channels.some(existingChannel => existingChannel.ChannelId === channel.ChannelId)) {
            channels.push(channel);
            this.setChannels(guildId, channels); 
        }
    }

    editChannel(guildId, channelId, newChannelData) {
        const channels = this.getChannels(guildId);
        const index = channels.findIndex(channel => channel.ChannelId === channelId);
        if (index !== -1) {
            channels[index] = { ...channels[index], ...newChannelData };
            this.setChannels(guildId, channels);
        }
    }

    removeChannel(guildId, channelId) {
        const channels = this.getChannels(guildId).filter(channel => channel.ChannelId !== channelId);
        this.setChannels(guildId, channels);
    }
}



class GuildMembersCache extends BaseCache {
    assignGuildMembers(guildId, guildMembers) {
        this.setObject(guildId, guildMembers);
    }

    isMembersEmpty(guildId) {
        const members = this.get(guildId);
        return !members || members.length === 0;
    }

    setGuildMembers(guildId, members) {
        this.setArray(guildId, members);
    }

    getGuildMembers(guildId) {
        return this.get(guildId) || [];
    }
}
class MessagesCache extends BaseCache {
    setChannelMessages(channelId, messages) {
        this.setArray(channelId, messages);
    }

    getChannelMessages(channelId) {
        return this.get(channelId) || [];
    }

    setRawMessages(channelId, rawMessages) {
        this.setArray(channelId, rawMessages);
    }

    getRawMessages(channelId) {
        return this.get(channelId) || [];
    }

    removeMessage(messageId, channelId) {
        const currentMessages = this.getChannelMessages(channelId);

        if (!Array.isArray(currentMessages)) {
            console.warn(`No messages found for channel ${channelId}`);
            return;
        }
        const updatedMessages = currentMessages.filter(msg => msg.messageId !== messageId);
        this.setChannelMessages(channelId, updatedMessages);

        console.log(`Message with ID ${messageId} removed from channel ${channelId}`);
    }
}

class InviteIdsCache extends BaseCache {
    assignInviteIds(guildId, inviteId) {
        this.setObject(guildId, inviteId);
    }

    getInviteIds(guildId) {
        return this.get(guildId) || [];
    }
}
class GuildCache {
    constructor() {
        if (GuildCache.instance) {
            return GuildCache.instance;
        }

        this.guilds = {};
        GuildCache.instance = this;
    }

    getGuild(guildId) {
        if (!this.guilds[guildId]) {
            this.guilds[guildId] = new Guild(guildId);
        }
        return this.guilds[guildId];
    }

    isMembersEmpty(guildId) {
        return this.getGuild(guildId).hasMembers();
    }

    getGuildOwner(guildId) {
        return this.getGuild(guildId).getOwner();
    }

    setGuildOwner(guildId, ownerId) {
        this.getGuild(guildId).setOwner(ownerId);
    }


    initialiseGuildOwnerIds(passedGuildOwnerIds) {
        if (typeof passedGuildOwnerIds !== "object" || passedGuildOwnerIds === null) {
            console.error("Invalid input: passedGuildOwnerIds must be an object.");
            return;
        }
    
        console.log(typeof passedGuildOwnerIds, passedGuildOwnerIds);
    
        Object.entries(passedGuildOwnerIds).forEach(([guildId, ownerId]) => {
            this.setGuildOwner(guildId, ownerId);
        });
    }
    

    isOwner(userId, guildId) {
        return this.getGuild(guildId).isOwner(userId);
    }

    getGuild(guildId) {
        if (!this.guilds[guildId]) {
            this.guilds[guildId] = new Guild(guildId);
        }
        return this.guilds[guildId];
    }

    getChannels(guildId) {
        return this.getGuild(guildId).channels.getChannels(guildId);
    }

    addChannel(guildId, channel) {
        this.getGuild(guildId).channels.addChannel(guildId, channel);
    }

    editChannel(guildId, channelId, newChannelData) {
        this.getGuild(guildId).channels.editChannel(guildId, channelId, newChannelData);
    }

    removeChannel(guildId, channelId) {
        this.getGuild(guildId).channels.removeChannel(guildId, channelId);
    }

    getMembers(guildId) {
        return this.getGuild(guildId).members.getGuildMembers(guildId);
    }

    addMembers(guildId, members) {
        console.error("settings members: " ,guildId, members);
        this.getGuild(guildId).members.setGuildMembers(guildId, members);
    }

    isInvitesEmpty(guildId) {
        return this.getGuild(guildId).isInvitesEmpty(guildId);
    }
    addInvites(guildId,invites) {
        this.getGuild(guildId).inviteIds.assignInviteIds(guildId,invites);
    }
    getInviteId(guildId) {
        return this.getGuild(guildId).inviteIds.getInviteIds(guildId);
    }
    getRawMessages(channelId,guildId) {
        return this.getGuild(guildId).messages.getRawMessages(channelId);
    }
    setRawMessages(channelId,guildId,rawMessages) {
        this.getGuild(guildId).messages.setRawMessages(channelId,rawMessages);
    }
    removeMessage(messageId,channelId,guildId) {
        this.getGuild(guildId).messages.removeMessage(messageId,channelId,guildId);
    }
}






const guildCache = new GuildCache();

let usersInVoice = {};// <channelId> <users_list>

let replyCache = {};//<messageId> <replies>
let currentMessagesCache = {};//<messageId> <messageElements>
let guildChatMessages = {};//<channelId> <messageObjects>
let messages_raw_cache = {};//<channelId> <messageRawJsons>

function hasSharedGuild(friend_id) {
    return shared_guilds_map.hasOwnProperty(friend_id);
}


function updateGuildList(guildData) {
    if (!guildData) {
        console.warn("Tried to update guild list without data.");
        return;
    }

    currentGuildData = guildData;
    guildsList.innerHTML = "";

    const mainLogoImg = createEl('img', {
        id: 'main-logo',
        src: '/static/images/icons/icon.png',
        'data-src': '/static/images/icons/icon.png',
        style: 'width: 30px; height: 30px; border: 10px solid rgb(49, 51, 56); user-select: none;'
    });
    mainLogoImg.addEventListener('mousedown', () => {
        mainLogoImg.style.transform = 'translateY(50px)';
    });
    mainLogoImg.addEventListener('mouseup', mainLogoImg.addEventListener.bind(mainLogoImg, 'mouseleave', () => {
        mainLogoImg.style.transform = 'translateY(0)';
    }));
    mainLogoImg.addEventListener('click', clickMainLogo);

    const mainLogo = createEl('li');
    mainLogo.appendChild(mainLogoImg);
    guildsList.appendChild(mainLogo);

    guildData.guilds.forEach((guild) => {
        if (getId(guild.GuildId)) return;
        
        const imgSrc = guild.IsGuildUploadedImg ? `/guilds/${guild.GuildId}` : createBlackImage();
        guildCache.setGuildOwnerId(guild.GuildId,guild.OwnerId);
        const li = createEl('li');
        const img = createEl('img', { className: 'guilds-list', id: guild.GuildId, src: imgSrc });
        img.addEventListener('click', () => {
            loadGuild(guild.GuildId, guild.RootChannel, guild.GuildName);
        });
        
        li.appendChild(img);
        li.appendChild(createEl('div', { className: 'white-rod' }));
        guildsList.appendChild(li);
        guildNames[guild.GuildId] = guild.GuildName;
    });
    
    addKeybinds();
}

function appendToGuildList(guild) {
    const guildsList = getId('guilds-list');
    if (guildsList.querySelector(`#${guild.id}`)) return;

    const li = createEl('li');
    const img = createEl('img', { className: 'guilds-list', id: guild.id, src: guild.src });
    img.addEventListener('click', () => {
        loadGuild(guild.id, guild.rootChannel, guild.name);
    });
    
    li.appendChild(img);
    li.appendChild(createEl('div', { className: 'white-rod' }));
    guildsList.appendChild(li);
    guildNames[guild.id] = guild.name;
    addKeybinds();
}

function removeFromGuildList(guild_id) {
    const guildImg = getId(guild_id);
    if (guildImg) {
        const parentLi = guildImg.closest('li');
        if (parentLi) parentLi.remove();
    }
}

function updateGuild(uploadedGuildId) {
    const guildList = getId('guilds-list').querySelectorAll('img');
    guildList.forEach((img) => {
        if (img.id === uploadedGuildId) {
            img.src = !uploadedGuildId ? createBlackImage() : `/guilds/${uploadedGuildId}`;
        }
    });

}


function createGuild() {
    const guildName = getId('guild-name-input').value;
    const guildPhotoFile = getId('guildImageInput').files[0];

    if (guildPhotoFile) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/gif', 'image/png', 'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml'];
        if (!allowedTypes.includes(guildPhotoFile.type)) {
            alertUser('Yalnızca resim dosyaları yükleyebilirsiniz (JPG, PNG veya GIF)!');
            getId('guildImageInput').value = '';
            getId('guildImg').style.backgroundImage = '';
            return; 
        }

        if (guildPhotoFile.size > 8 * 1024 * 1024) {
            alertUser('Dosya boyutu 8 MB\'den küçük olmalıdır!');
            getId('guildImageInput').value = '';
            getId('guildImg').style.backgroundImage = '';
            return; 
        }
    }

    let formData = new FormData();
    if (guildPhotoFile) {
        formData.append('Photo', guildPhotoFile);
    }
    formData.append('GuildName', guildName);

    fetch('/api/guilds', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
        return response.text();
    }).then(data => {
        console.log('Guild creation response:', data);
        if (typeof(data) === 'object') {
            const popup = getId('guild-pop-up');
            if (popup) {
                popup.parentNode.remove();
            }
            changeUrlWithFireWorks(data.guildId, data.rootChannel, data.guildName);
        } else {
            alertUser('Sunucu oluşturma hatası', data);
        }
    }).catch(error => {
        console.error('Error:', error);
    });
}

function selectGuildList(guildId) {
    console.log(typeof(guildId),guildId)
    const guildList = getId('guilds-list'); 
    if (!guildList) return; 
    
    const foundGuilds = guildList.querySelectorAll('img');
    
    foundGuilds.forEach(guild => {
        if (guild.id === guildId) {
            guild.parentNode.classList.add('selected-guild');
        } else {
            guild.parentNode.classList.remove('selected-guild');
        }
    });
}

function loadGuild(guildId,channelId,guildName,guildOwnerId,isChangingUrl=true) {
    if(!guildId || !channelId ) {
        console.error("Load guild called with null values: ", guildId,channelId)
        return; 
    }
    console.log("Loading guild: ",guildId,channelId,guildName);
    
    if (isChangingUrl) {
        const state = constructAppPage(guildId,channelId);
        if(window.location.pathname != state) {
            window.history.pushState(null, null, state);
        }
    } else { 
        console.warn("calling from popstate");
    }
    if(isChangingPage) {
        console.warn(" Already changing guild! can not change guild");
        return;
    }
    currentGuildId = guildId;
    permissionManager = new PermissionManager(permissionsMap, currentGuildId);
    selectGuildList(guildId);
    if(guildName) {
        currentGuildName = guildName;
    } else {
        if(guildNames[guildId]) {
            currentGuildName = guildNames[guildId];
        }
    }

    currentChannelId = channelId;
    if(!isChangingUrl) {
        wasNotChangingUrl = true;
    }
    
    if(isOnMe) {
        loadApp();
    } else if (isOnDm) {
        loadApp();
    } else if (isOnGuild){
        changecurrentGuild();
    } 
    
}
function disableDropdown() {
    disableElement("settings-dropdown-button");

}
function changecurrentGuild() {
    isChangingPage = true;
    isOnMe = false;
    isOnGuild = true;
    getChannels();
    fetchMembers();
    refreshInviteId();
    getId('channel-info').textContent = currentChannelName;
    getId('guild-name').innerText = currentGuildName;
    isDropdownOpen = false;
    disableDropdown();
  
    isChangingPage = false;
}
function joinVoiceChannel(channelId) {
    if(currentVoiceChannelId == channelId) { return; }
    const data = { 'guildId' : currentGuildId, 'channelId' : channelId }
    socket.emit('join_voice_channel',data);
    return;
}


function refreshInviteId() {
    if(!guildCache.isInvitesEmpty(currentGuildId)) { return; }
    socket.emit('get_invites',{'guildId' : currentGuildId});
}


function addGuild(guildId, guildName, ownerId) {
    const data = {
        "GuildId": guildId,
        "GuildName": guildName,
        "OwnerId": ownerId
    };
    currentGuildData[guildId] = data;
}
function createFireWorks() {
    setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    return;
}
function changeUrlWithFireWorks(guildId,channelId,guildName) { 
    guildOwnerIds[guildId] = currentUserId
    loadGuild(guildId,channelId,guildName,currentUserId)
    addGuild(guildId,guildName,currentUserId);

    createFireWorks();
    permissionManager.addGuildSelfCreated(guildId);

}
function fetchMembers() {
    if(!currentGuildId) {
        console.warn("Current guild id is null! cant fetch members");
        return
    }
    const members = guildCache.getMembers(currentGuildId);

    if(members) {
        console.log("Using cached members...");
        updateMemberList(guildCache.getMembers(currentGuildId));

    } else {
        console.log("Fetching members...");
        socket.emit('get_members',{'guildId' : currentGuildId});

    }

}


function getGuildUsers() {
    if (!guildCache.isMembersEmpty(currentGuildId) || !currentGuildId) { return; }
    
    const guildMembers = guildCache.getMembers(currentGuildId);
    if (!guildMembers) { return; }

    let usersToReturn = [];

    for (const userId in guildMembers) {
        const user = guildMembers[userId];
        usersToReturn.push({
            name: user.name,
            image: getProfileUrl(user.user_id) 
        });
    }
    console.log(usersToReturn)
    console.log(guildMembers);

    return usersToReturn; 
}


function joinToGuild(invite_id) {
    socket.emit('join_to_guild',{'invite_id':invite_id});
}

function leaveCurrentGuild() {
    socket.emit('leave_from_guild',currentGuildId);
}

function startGuildJoinCreate() {
    showGuildPop('Sunucunu Oluştur','Sunucun, arkadaşlarınla takıldığınız yerdir. Kendi sunucunu oluştur ve konuşmaya başla.');
}


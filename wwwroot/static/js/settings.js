
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
const socket = io();
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
let lastConfirmedguildImg;
function onEditImage(isGuild) {
    if(!isCropieInitialized) { return }
    const filedata = getId(isGuild ? 'guildImage':'profileImage').files[0];
    if (!filedata) {
        console.log("No file. ", isGuild)
        return;
    }
    console.log("On edit image." , isGuild)
    const reader = new FileReader();
    reader.onload = (e) => {
        function callbackAfterAccept(outputBase64) {
            console.log("Callback triggered!", isGuild)
            if(isGuild) {
                lastConfirmedguildImg =  getBase64Image(getId('guild-image'))
            } else {
                lastConfirmedProfileImg =  getBase64Image(getId('settings-self-profile'))
            }
            getId(isGuild ? 'guild-image' : 'settings-self-profile').src = outputBase64;
            isChangedProfile = true;
            if(!currentPopUp) {
                let _currentPopUp = generateUnsavedPopUp();
                currentPopUp = _currentPopUp;
            }
            
            showUnsavedPopUp(currentPopUp);
        }
        createCropPop(e.target.result,callbackAfterAccept);
        
    };
    reader.onerror = (error) => {
        console.error("Error reading file:", error);
    };
    reader.readAsDataURL(filedata);
    getId(isGuild ? 'guildImage':'profileImage').value = '';
    
    isUnsaved = true;

}
function onEditProfile() {
    onEditImage(false);
}
function onEditGuildProfile() {
    onEditImage(true);
}
function deleteProfilePic() {
    let xhr = new XMLHttpRequest();
    let formData = new FormData();
    xhr.open('POST', '/delete_profile_pic');
    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log('Profile picture deleted');
            updateSelfProfile(currentUserId,user_name,true);
        }
        else {
            console.error('Error uploading profile pic!');
        }
    };
    xhr.send(formData);
}
function updateGuild(data) {
    const guildList = getId('guilds-list').querySelectorAll('img');
    guildList.forEach((img) => {
        if (img.id === data.guild_id) {
            img.src = data.is_empty ? createBlackImage() : `guilds/${data.guild_id}`;
        }
    });

}
function uploadImage(isGuild) {
    if (!isChangedProfile) { return; }
    
    let formData = new FormData();
    const uploadedGuildId = currentGuildId;
    const file = isGuild ? getId('guild-image').src : getId('settings-self-profile').src;
    
    console.log(file, isGuild);
    
    if (file && file.startsWith('data:image/')) {
        const byteString = atob(file.split(',')[1]);
        const mimeString = file.split(',')[0].split(':')[1].split(';')[0];
        const ab = new Uint8Array(byteString.length);
        
        for (let i = 0; i < byteString.length; i++) {
            ab[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([ab], { type: mimeString });
        
        if (blob.size <= 8 * 1024 * 1024) {
            formData.append('photo', blob, 'profile-image.png');
            
            if (isGuild) {
                formData.append('guild_id', uploadedGuildId);
            }
            
            console.log("Sending req...");
            let xhr = new XMLHttpRequest();
            xhr.open('POST', '/upload_img');
            xhr.onload = function () {
                if (xhr.status === 200) {
                    updateGuild(uploadedGuildId);
                } else {
                    console.error('Error uploading profile pic!');
                }
            };
            xhr.onerror = function() {
                if(isGuild) {
                    getId('guild-image').src = lastConfirmedguildImg 
                } else {
                    getId('settings-self-profile').src = lastConfirmedProfileImg;
                }
            }
            xhr.send(formData);
        } else {
            alertUser('Dosya boyutu 8 MB\'den büyük olamaz!');
            getId('profileImage').value = ''; 
        }
    } else {
        console.error('Invalid file format or undefined file.');
    }
}


function createGuild() {
    const guildName = getId('guild-name-input').value;
    const guildPhotoFile = getId('guildImageInput').files[0];

    if (guildPhotoFile !== undefined) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/gif', 'image/png', 'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml'];
        if (!allowedTypes.includes(guildPhotoFile.type)) {
            alertUser('Yalnızca resim dosyaları yükleyebilirsiniz (JPG, PNG veya GIF)!');
            getId('guildImageInput').value = '';
            getId('guildImg').style.backgroundImage = '';
            return; 
        }

        // Check file size and append to FormData if valid
        if (guildPhotoFile.size > 8 * 1024 * 1024) {
            alertUser('Dosya boyutu 8 MB\'den küçük olmalıdır!');
            getId('guildImageInput').value = '';
            getId('guildImg').style.backgroundImage = '';
            return; 
        }
    }

    let formData = new FormData();

    if (guildPhotoFile !== undefined) {
        formData.append('photo', guildPhotoFile);
    }
    formData.append('guild_name', guildName);
    getId('guildImg').style.class = "";

    fetch('/create_guild', {
        method: 'POST',
        body: formData
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
        return response.text();
    }).then(data => {
        console.log('Guild creation response:', data);
        if(typeof(data) == 'object') {
            const popup = getId('guild-pop-up');
            if (popup) {
                popup.parentNode.remove();
            }
            changeUrlWithFireWorks(data.new_guild_id,data.new_channel_id,data.new_guild_name);
        } else {
            alertUser('Sunucu oluşturma hatası',data);
        }
        
    }).catch(error => {
       console.error('Error:', error);
       
        
    });
}
    




window.addEventListener('popstate', function(event) {
    try {
        const pathStr = window.location.pathname;
        if (pathStr === '/channels/@me') {
            loadMainMenu(false);
        } else if (pathStr.startsWith('/channels/@me/')) {
            const parts = pathStr.split('/');
            const friendId = parts[3];
            OpenDm(friendId);
        } else if (pathStr.startsWith('/channels/') && pathStr.split('/').length === 4) {
            
            const parts = pathStr.split('/');
            const guildID = parts[2];
            const channelId = parts[3];
            loadGuild(guildID, channelId, null, null, false);
        } else {
            console.error('Unknown URL format:', pathStr);
        }
        
    } catch (error) {
        console.error(error);
    }
});
function constructAppPage(guild_id,channel_id) {
    return`/channels/${guild_id}/${channel_id}`;
}
function constructDmPage(channel_id) {
    return`/channels/@me/${channel_id}`;
}
function constructAbsoluteAppPage(guild_id, channel_id) {
    return `${window.location.protocol}//${window.location.hostname}/app/channels/${guild_id}/${channel_id}`;
}

function selectGuildList(guild_id) {
    console.log(typeof(guild_id),guild_id)
    const guildList = getId('guilds-list'); 
    if (!guildList) return; 
    
    const foundGuilds = guildList.querySelectorAll('img');
    
    foundGuilds.forEach(guild => {
        console.log(guild);
        if (guild.id === guild_id) {
            guild.parentNode.classList.add('selected-guild');
        } else {
            guild.parentNode.classList.remove('selected-guild');
        }
    });
}

function loadGuild(guild_id,channel_id,guildName,guildAuthorId,isChangingUrl=true) {
    if(!guild_id || !channel_id ) { return; }
    
    if (isChangingUrl) {
        const state = constructAppPage(guild_id,channel_id);
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
    currentGuildId = guild_id;
    permissionManager = new PermissionManager(permissions_map, currentGuildId);
    selectGuildList(guild_id);
    if(guildName) {
        currentGuildName = guildName;
    } else {
        if(guildNames[guild_id]) {
            currentGuildName = guildNames[guild_id];
        }
    }

    currentChannelId = channel_id;
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
function initialiseMe() {
    enableElement('dms-title');
    userList.innerHTML = userListTitleHTML;
    loadMainToolbar();
    isInitialized = true;
}
function get_users() {
    if(currentGuildId) {
        if(guild_users_cache[currentGuildId]) {
            updateUserList(guild_users_cache[currentGuildId]);
        } else {
            socket.emit('get_users',currentGuildId);
        }

        if(!users_metadata_cache[currentGuildId]) {
            socket.emit('get_user_metadata',currentGuildId);
        }

    } else {
        console.warn("Current guild id is null!");
    }
}
function getChannels() {
    if(currentChannelId) {
        if(channels_cache[currentGuildId]) {
            updateChannels(channels_cache[currentGuildId]);
        } else {
            socket.emit('get_channels',currentGuildId);
        }
    } else {
        console.warn("Current channel id is null!");
    }

}
let isChangingPage = false;
function setUserListLine() {
    const userLine = document.querySelector('.horizontal-line');
    if(isUsersOpenGlobal) {
        enableElement('user-list');
        userLine.style.display = 'flex';
    } else {
        disableElement('user-list');
        userLine.style.display = 'none';
    }
}
function userExistsDm(userId) {
    return userId in dm_users;
}
function OpenDm(friend_id) {
    const wasOnDm = isOnDm;
    isOnDm = true;
    currentDmId = friend_id;
    lastSenderID = '';
    lastMessageDateTime = null;
    activateDmContainer(friend_id);
    const url = constructDmPage(friend_id);
    if(url != window.location.pathname) {
        window.history.pushState(null, null, url);
    }
    if(!userExistsDm(friend_id)) {
        socket.emit('add_dm',{'friend_id' : friend_id});
    }
    loadApp(friend_id);
    if(wasOnDm) {
        changeCurrentDm(friend_id);
    }
    GetHistoryFromOneChannel(friend_id,true);
}


let lastDmId;
function loadMainMenu(isChangingUrl=true) {
    if(isOnGuild && currentChannelId) {
        guildChatMessages[currentChannelId] = messages_raw_cache;
    }
    function handleMenu() {
        selectGuildList('main-logo');
        if(isChangingUrl) {
            window.history.pushState(null, null, "/channels/@me");
        }
        enableElement('friends-container',false,true);
        getId('friend-container-item').classList.add('dm-selected');
        disableDmContainers();
        lastDmId = '';
        currentDmId = '';
        enableElement('channel-info-container-for-friend');
        disableElement('channel-info-container-for-index');
        loadMainToolbar();
        disableElement('chat-container');
        disableElement('message-input-container');
        getId('friend-container-item').style.color = 'white';

        userList.innerHTML = userListTitleHTML;
        userList.classList.add('friendactive');
        if(userListFriActiveHtml) {
            userList.innerHTML = userListFriActiveHtml;
        }
        getId('nowonline').style.fontWeight = 'bolder';
        if(isOnMe) { return; }
        isOnMe = true;
        isOnGuild = false;
    }
    
    function handleDm() {
        OpenDm(lastDmId)
        disableElement('friends-container');
    }
    if(isOnGuild) {
        if(isOnDm) {
            handleMenu();
        } else {
            if(lastDmId) {
                handleDm()
            } else {
                handleMenu();
            }
        }

    } else {
        handleMenu();
    }


    enableElement('friend-container-item');
    getId('guild-name').innerText = '';
    disableElement('guild-settings-button');
    enableElement('globalSearchInput',false,true);
    enableElement('friends-container-item');
    
    enableElement('dms-title');
    enableElement('dm-container-parent',false, true);
    channelsUl.innerHTML = '';

    enableElement('guild-container',false,true);
    
    
    const chanList = getId('channel-list');
    if(cachedFriMenuContent) {
        chanList.innerHTML = cachedFriMenuContent;
    }


    handleResize();
    
}
function UpdateDmUserList(friend_id,friendNick,friendDiscriminator) {
    const usersData = {
        currentUserId: {
            user_id:  currentUserId,
            name: currentUserName,
            is_online : true ,
            discriminator: currentDiscriminator
        },
        friend_id: {
            user_id:  friend_id,
            name: friendNick,
            is_online : isOnline(friend_id),
            discriminator: friendDiscriminator
        }
    };
    updateUserList(usersData);
}
function loadApp(friend_id=null) {
    if(isChangingPage) {return;  }
    isChangingPage = true;
    const userList = getId('user-list');

    if(isOnMe) {
        userListFriActiveHtml = userList.innerHTML;
    }
    
    isOnMe = false;

    userList.innerHTML = ""; 
    userList.classList.remove('friendactive'); 
    enableElement('guild-name');

    if(!friend_id) {
        isOnGuild = true;
        isOnDm = false;
        if(currentDmId) {
            lastDmId = currentDmId;
        }
        getChannels();
        get_users();
        refreshInviteId();
        disableElement('dms-title');
        disableElement('dm-container-parent');
        disableElement('friend-container-item');
        enableElement('guild-settings-button');
        enableElement('hash-sign');
        getId('guild-name').innerText = currentGuildName;
        disableElement('globalSearchInput');
        disableElement('dm-profile-sign-bubble');
        disableElement('dm-profile-sign');
        loadGuildToolbar();
    } else {
        loadDmToolbar();
        isOnGuild = false;
        isOnDm = true;
        enableElement('dm-profile-sign-bubble');
        enableElement('dm-profile-sign');
        enableElement('guild-container',false,true);
        disableElement('guild-settings-button');
        activateDmContainer(friend_id);
        const friendNick = passed_friend_name != undefined && passed_friend_id == friend_id ? passed_friend_name : getUserNick(friend_id);
        userInput.placeholder = '@' + friendNick + ' kullanıcısına mesaj gönder';
        channelInfo.textContent = friendNick;
        disableElement('hash-sign');
        enableElement('dm-profile-sign')
        const dmProfSign = getId('dm-profile-sign');
        setProfilePic(dmProfSign,friend_id);
        dmProfSign.dataset.cid = friend_id;
        
        UpdateDmUserList(friend_id,friendNick,passed_friend_discriminator);
    }
    
    
    disableElement('channel-info-container-for-friend');
    disableElement('friends-container');
    document.querySelector('.horizontal-line').style.display = 'none';
    
    enableElement('channel-info-container-for-index');
    enableElement('chat-container',true);
    enableElement('message-input-container',false,true);
    adjustHeight();
    
    handleResize();
    isChangingPage = false;
}

function changeCurrentDm(friend_id) {
    isChangingPage = true;
    isOnMe = false;
    isOnGuild = false;
    isOnDm = true;
    isReachedChannelEnd = false;
    
    const friendNick = getUserNick(friend_id);
    channelInfo.textContent = friendNick;
    userInput.placeholder = '@' + friendNick + ' kullanıcısına mesaj gönder';
    const dmProfSign = getId('dm-profile-sign');
    setProfilePic(dmProfSign,friend_id);
    dmProfSign.dataset.cid = friend_id;
    UpdateDmUserList(friend_id,friendNick)

    isChangingPage = false;
}






function changecurrentGuild() {
    isChangingPage = true;
    isOnMe = false;
    isOnGuild = true;
    getChannels();
    get_users();
    refreshInviteId();
    getId('channel-info').textContent = currentChannelName;
    getId('guild-name').innerText = currentGuildName;
    isDropdownOpen = false;
    dropDown.style.display = 'none';
  
    isChangingPage = false;
}


socket.on('voice_users_response',function(data) {
    const channel_id = data.channel_id;
    playAudio('/static/sounds/joinvoice.mp3');
    clearVoiceChannel(currentVoiceChannelId);
    const sp = getId('sound-panel');
    sp.style.display = 'flex';
    currentVoiceChannelId = channel_id;
    if(isOnGuild) {
        currentVoiceChannelGuild = data.guild_id;
    }
    const soundInfoIcon = getId('sound-info-icon');
    soundInfoIcon.innerText = `${currentChannelName} / ${currentGuildName}`;
    if (!usersInVoice[channel_id]) {
        usersInVoice[channel_id] = [];
    }
    const buttonContainer = channelsUl.querySelector(`li[id="${currentVoiceChannelId}"]`);
    const channelSpan = buttonContainer.querySelector('.channelSpan');
    channelSpan.style.marginRight = '30px';
    if(!usersInVoice[channel_id].includes(currentUserId)) {
        usersInVoice[channel_id].push(currentUserId);
    }
    usersInVoice[channel_id] = data.users_list;
});

function joinVoiceChannel(channel_id) {
    if(currentVoiceChannelId == channel_id) { return; }
    const data = { 'guild_id' : currentGuildId, 'channel_id' : channel_id }
    socket.emit('join_voice_channel',data);
    return;
}



function refreshInviteId() {
    if(!current_invite_ids) { return; }
    socket.emit('get_current_invite_id',{'guild_id' : currentGuildId});
}

function clickMainLogo() {
    logoClicked ++;
    if(logoClicked >= 14) {
        logoClicked = 0;
        const audioUrl = "https://github.com/TheLp281/LiventCord/raw/main/liventocordolowpitch.mp3";
        try {
            let audio = new Audio(audioUrl);
            audio.play();
        }
        catch(error) {
            console.log(error);
        }
        
          
    } 
    loadMainMenu();
}


function changeUrlWithFireWorks(guild_id,channel_id,guild_id) { 
    loadGuild(guild_id,channel_id,guild_id,currentUserId)
    createFireWorks();
    permissions_map[guild_id] = {
        "read_messages": 1,
        "send_messages": 1,
        "manage_roles": 1,
        "kick_members": 1,
        "ban_members": 1,
        "manage_channels": 1,
        "mention_everyone": 1,
        "add_reaction": 1,
        "is_admin": 1,
        "can_invite": 1
    }
    
}




function closeSettings() {
    if(isUnsaved) {
        shakeScreen();
        return;
    }
    enableSnowOnSettings()
    getId('settings-menu').style.animation = 'settings-menu-disappear-animation 0.3s forwards';



    setTimeout(() => {
        getId('settings-overlay').style.display = 'none';
    }, 300);

    isSettingsOpen = false;

    
    

}
let changeNicknameTimeout;
function changeNickname() {
    const newNicknameInput = getId('new-nickname-input');
    const newNickname = newNicknameInput.value.trim();

    if (newNickname !== '' && !changeNicknameTimeout && newNickname != currentUserName) {

        console.log("Changed your nickname to: " + newNickname);
        userNick = newNickname;
        socket.emit('set_nick', newNickname);

        newNicknameInput.value = newNickname;
        changeNicknameTimeout = setTimeout(() => {
            changeNicknameTimeout = null;
        }, 1000);

    }
}

let changeGuildNameTimeout;
function changeGuildName() {
    const newGuildInput = getId('guild-overview-name-input');
    const newGuildName = newGuildInput.value.trim();
    if (newGuildName !== '' && !changeGuildNameTimeout && newGuildName != currentGuildName) {
        console.log("Changed guild name to: " + newGuildName);
        const objecttosend = {'' : newGuildName,'guild_id' : currentGuildId};
        socket.emit('set_guild_name', objecttosend);
        const setInfoNick = getId('set-info-nick');
        if(setInfoNick) {
            setInfoNick.innerText = newGuildName;
        }
        newGuildInput.value = newGuildName;
        changeGuildNameTimeout = setTimeout(() => {
            changeGuildNameTimeout = null;
        }, 1000);

    }
}



function logOutPrompt() {
    askUser('Çıkış Yap','Çıkış yapmak istediğine emin misin?','Çıkış Yap',logOut,color=isRed=true);
}


function logOut() {
    socket.disconnect();

    fetch('/auth/logout', {
        method: 'POST',
        credentials: 'same-origin'
    })
    .then(response => {
        if (response.ok) {
            document.body.innerHTML = '';
            window.location.href = '/';
        } else {
            console.error('Logout failed:', response.statusText);

        }
    })
    .catch(error => {
        console.error('Error during logout:', error);
    });
}
function changePageToMe() {
    window.location.href = "/channels/@me";
}
function changePageToGuild() {
    window.location.href = "/";
}




document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        if(isUnread)
        setActiveIcon();
    } else {
        setInactiveIcon();
    }
});









let isDisconnected = false;
let disconnectTimer = null;
let currentTimeout;
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



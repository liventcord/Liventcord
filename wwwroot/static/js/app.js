let isDomLoaded = false;

let isOnMe = true;
let isOnDm = false;

let cachedFriMenuContent;
let userListFriActiveHtml;










const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            loadObservedContent(entry.target);
        }
    });
}, { threshold: 0.1 });


function getId(string) { return document.getElementById(string);}






function assignElements() {
    const cookieSnow = loadBooleanCookie('isSnow');
    if(cookieSnow) {
        enableSnow();
    }
    isSnow = cookieSnow;
    chatInput = getId('user-input');
    userList = getId('user-list');
    channelTitle = getId("channel-info");
    
    
    guildsList = getId('guilds-list');
    channelList = getId('channel-list');
    channelsUl = channelList.querySelector('ul');
    


    addChannelSearchListeners();
    

}







document.addEventListener('DOMContentLoaded', function () {
    window.scrollTo(0,0)
    assignElements();
    initializeChatComponents();

    urlToBase64(defaultProfileImageUrl)
        .then(base64 => defaultProfileImageUrl = base64)
        .catch(error => console.error(error));
            
        urlToBase64(defaultMediaImageUrl)
            .then(base64 => defaultMediaImageUrl = base64)
            .catch(error => console.error(error));



    getId('guild-container').addEventListener('click', function(event) {
        if (event.target.id === 'guild-container' || event.target.id === 'guild-name') {
            toggleDropdown(); 
        }
    });

    createChatScrollButton();
    
    chatContainer.addEventListener('scroll', handleScroll);

    initialisechatInput();
    document.addEventListener('click', (event) => {
        if (!userMentionDropdown.contains(event.target) && event.target !== chatInput) {
            userMentionDropdown.style.display = 'none';
        }
    });

    closeReplyMenu();
    adjustHeight();

    setDropHandler();
    
    const guildContainer = getId('guild-container');
    guildContainer.addEventListener('mouseover',function() {
        guildContainer.style.backgroundColor= '#333538';
    });
    guildContainer.addEventListener('mouseout',function() {   
        guildContainer.style.backgroundColor= '#2b2d31';
    });
    

    const friendContainer = getId('friend-container-item');
    friendContainer.addEventListener('click',loadMainMenu);


    isDomLoaded = true;
    currentUserId = passed_user_id;
    currentUserName = user_name;
    currentDiscriminator = user_discriminator;

    getId('self-name').textContent = user_name;
    getId('self-discriminator').textContent = '#'+user_discriminator;
    
    
    getId('tb-showprofile').addEventListener('click', toggleUsersList);
    selectSettingCategory(MyAccount);
    selfProfileImage = getId("self-profile-image");

    selfProfileImage.addEventListener("mouseover", function() { this.style.borderRadius = '0px'; });
    selfProfileImage.addEventListener("mouseout", function() { this.style.borderRadius = '50%'; });


    console.log("Loading initial guild: ",passed_guild_id,passed_channel_id,passed_guild_name,passed_owner_id);

    initialiseMe();
   
    function isDefined(variable) {
        return typeof variable !== 'undefined' && variable !== null;
    }

    if (window.location.pathname.startsWith('/channels/@me/')) {
        const parts = window.location.pathname.split('/');
        const friendId = parts[3];
        if (isDefined(friendId)) {
            OpenDm(friendId);
        }
    } else if (isDefined(passed_guild_id) && passed_channel_id && isDefined(passed_owner_id)) {
        loadGuild(passed_guild_id, passed_channel_id, passed_guild_name, passed_owner_id);
    }

    if (isDefined(passed_message_readen)) {
        readenMessagesCache = passed_message_readen;
    }

    if (isDefined(friends_status) && typeof friends_status === 'object') {
        friends_cache = friends_status;
    }

    if (isDefined(passed_friend_id)) {
        addUser(passed_friend_id, passed_friend_name, passed_friend_discriminator, passed_friend_blocked);
    }

    if (isDefined(passed_typing_members)) {
        typing_members = passed_typing_members;
    }

    if (isOnMe) {
        if (!isPathnameCorrect(window.location.pathname)) {
            window.history.pushState(null, null, "/channels/@me");
        }
    }

    if (isOnGuild) {
        if (currentGuildData && !(passed_guild_id in currentGuildData)) {
            window.history.pushState(null, null, "/channels/@me");
        }
    }

    if (isDefined(guild_members) && isDefined(passed_guild_id)) {
        console.log(passed_guild_id);
        cacheInterface.updateMembers(passed_guild_id, guild_members);
        updateMemberList(guild_members, true);
    }


    
    
    addContextListeners();
    const val = loadBooleanCookie('isParty');
    isParty = val;

    
    if (isParty && isAudioPlaying) {
        enableBorderMovement();
    }
    
    getId("data-script").remove();

    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 20);

    if (guilds_data && guilds_data.length > 0) {
        guilds_data.forEach(data => {
            console.warn(data,isOnGuild);
            if(isOnGuild) {
                cacheInterface.addChannel(data.GuildId,data.GuildChannels);
                updateChannels(data.GuildChannels);
            }
        });
    }

    guildCache.initialiseGuildOwnerIds(passedGuildOwnerIds);


    
    const isCookieUsersOpen = loadBooleanCookie('isUsersOpen');
    setUsersList(isCookieUsersOpen, true);
    disableElement('loading-screen');

    
});







function readCurrentMessages() {
    if (!currentChannelId ) { return; }
    socket.emit('read_message',{'channelId' : currentChannelId,'guildId' : currentGuildId});
    getId('newMessagesBar').style.display = 'none';
}





function createReplyBar(newMessage,messageId,user_id,content,attachment_urls) {
    if(newMessage.querySelector('.replyBar')) { return; }
    const smallDate = newMessage.querySelector('.small-date-element');
    if(smallDate)  {
        smallDate.remove();
    }

    const replyBar = createEl('div',{className:'replyBar'});
    newMessage.appendChild(replyBar);
    newMessage.classList.add('replyMessage');
    const messageContentElement = newMessage.querySelector('#message-content-element')


    const nick = getUserNick(user_id);
    replyBar.style.height = '100px';
    const replyAvatar = createEl('img', {className : 'profile-pic', id : user_id});
    replyAvatar.classList.add('reply-avatar');
    replyAvatar.style.width = '15px';
    replyAvatar.style.height = '15px';

    setProfilePic(replyAvatar,user_id);
    const replyNick = createEl('span',{textContent:nick,className:'reply-nick'});
    const textToWrite = content ? content : attachment_urls ? attachment_urls : 'Eki görüntülemek için tıkla';
    const replyContent = createEl('span',{className:'replyContent', textContent:textToWrite})

    
    replyContent.onclick = () => {
        const originalMsg = getId(messageId);
        if(originalMsg) {
            scrollToMessage(originalMsg);
        } else {
            fetchReplies(newMessage.dataset.reply_to_id, null, goToOld=true);
        }
    }
    replyBar.appendChild(replyAvatar);
    replyBar.appendChild(replyNick);
    replyBar.appendChild(replyContent);
    
}









function removeDm(user_id) {


}

function getGuildName(guildId) {
    const guild = currentGuildData[guildId];
    return guild ? guild.name : 'Unknown Guild';
}

function getManageableGuilds() {
    if(!permissionsMap) { return [] }
    const guildsWeAreAdminOn = [];
    let isFoundAny = false;
    for (const key in permissionsMap) {
        if (permissionsMap[key].isAdmin) {
            guildsWeAreAdminOn.push(key);
            isFoundAny = true;
        }
    }
    return isFoundAny ? guildsWeAreAdminOn : null;
}














function initialiseMe() {
    enableElement('dms-title');
    userList.innerHTML = userListTitleHTML;
    loadMainToolbar();
    isInitialized = true;
}


let isChangingPage = false;

function userExistsDm(userId) {
    return userId in dm_friends;
}
function OpenDm(friend_id) {
    const wasOnDm = isOnDm;
    isOnDm = true;
    currentDmId = friend_id;
    lastSenderID = '';
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
    console.log("Loading main menu...");

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
        const onlineText = getId('nowonline');
        if(onlineText) onlineText.style.fontWeight = 'bolder';
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
    disableElement("settings-dropdown-button");
  
    isChangingPage = false;
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
    console.log("Loading app with friend id:", friend_id);

    if(!friend_id) {
        isOnGuild = true;
        isOnDm = false;
        if(currentDmId) {
            lastDmId = currentDmId;
        }
        console.log(isDomLoaded);
        
        fetchMembers();
        getChannels();
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
        chatInput.placeholder = '@' + friendNick + ' kullanıcısına mesaj gönder';
        channelTitle.textContent = friendNick;
        disableElement('hash-sign');
        enableElement('dm-profile-sign')
        const dmProfSign = getId('dm-profile-sign');
        setProfilePic(dmProfSign,friend_id);
        dmProfSign.dataset.cid = friend_id;
        
        UpdateDmFriendList(friend_id,friendNick,passed_friend_discriminator);
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
    channelTitle.textContent = friendNick;
    chatInput.placeholder = '@' + friendNick + ' kullanıcısına mesaj gönder';
    const dmProfSign = getId('dm-profile-sign');
    setProfilePic(dmProfSign,friend_id);
    dmProfSign.dataset.cid = friend_id;
    UpdateDmFriendList(friend_id,friendNick)

    isChangingPage = false;
}











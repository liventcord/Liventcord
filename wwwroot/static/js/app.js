let isDomLoaded = false;
let chatContainer;
let chatContent;
let userInput ;
let userList;
let channelInfo;
let gifMenu;
let gifsMenuSearchBar;
let gifsMenuContainer;
let fileImagePreview;
let channelList;
let channelsUl;
let currentChannels;
let currentGuildId;
let currentDmId;
let isDropdownOpen = false;
let guildSettingsDropdown;
let selfBubble;
let replyInfo;
let replyContainer;
let replyCloseButton;
let isUpdatingUsers = false;
let imagePreviewContainer;
let jsonPreviewContainer;
let previewImage;
let currentLastDate;
let jsonPreviewElement;
let fileInput;
let fileButton;
let current_invite_ids = {};
let isGifsOpen = false;

let isEmojisOpen = false;
let isOldMessageCd = false;
let isReachedChannelEnd = false;
let isDeveloperMode = true;
let chatContentInitHtml;
let isLastSendMessageStart = false;
let baseImagePath = `${location.origin}/images/`;
let lastMessageDateTime = null;
const maxWidth = 512;
const maxHeight = 384;
const maxTenorWidth = 512 *1.5;
const maxTenorHeight = 384 * 1.5;
const CLYDE_ID = '1';
let defaultMediaImageUrl = '/static/images/defaultmediaimage.png'

let currentCustomEmojis = [];

function getEmojiPath(emojiName) {   return `${baseImagePath}${emojiName}.png`; }

let lastSenderID = '';
let typingTimeout;
let currentChannelName = null;
let currentReplyingTo = '';


let currentUserId;
let currentDiscriminator = null;
let currentUserName;
let currentChannelId;
let currentVoiceChannelId;
let lastConfirmedProfileImg;
let currentGuildName = '';
let currentGuildIndex = 0;
let userNames = {};
userNames['1'] = {
    nick: 'Clyde',
    discriminator: '0000',
    is_blocked: false
};

let currentEscHandler;
let isOnMe = true;
let isOnDm = false;

let cachedFriMenuContent;
let userListFriActiveHtml;

let contextList = {};
let messageContextList = {};

let channels_cache = {}; // <guildId> <channels_list>
let guild_users_cache = {}; // <guildId> <users_list>

let usersInVoice = {};
let readenMessagesCache = {};
let guildAuthorIds = {};

let permissionManager;





const Permission = {
    READ_MESSAGES: 'read_messages',
    SEND_MESSAGES: 'send_messages',
    MANAGE_ROLES: 'manage_roles',
    KICK_MEMBERS: 'kick_members',
    BAN_MEMBERS: 'ban_members',
    MANAGE_CHANNELS: 'manage_channels',
    MENTION_EVERYONE: 'mention_everyone',
    ADD_REACTION: 'add_reaction',
    IS_ADMIN: 'is_admin',
    CAN_INVITE: 'can_invite'
};

let inputElement;

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            loadObservedContent(entry);
        }
    });
}, { threshold: 0.1 });

class PermissionManager {
    constructor(permissionsMap, currentGuildId) {
        this.permissionsMap = permissionsMap;
        this.currentGuildId = currentGuildId;
    }

    getPermission(permType) {
        return this.permissionsMap[this.currentGuildId]?.[permType] || 0;
    }

    canInvite() {
        return Boolean(this.getPermission(Permission.CAN_INVITE));
    }

    canManageChannels() {
        return Boolean(this.getPermission(Permission.MANAGE_CHANNELS));
    }
    
    isSelfAdmin() {
        return Boolean(this.getPermission(Permission.IS_ADMIN));
    }
}
function getId(string) { return document.getElementById(string);}

function reloadCSS() {
    const approvedDomains = ['localhost'];
    function getDomain(url) {
        const link = createEl('a');
        link.href = url;
        return link.hostname;
    }
    const links = document.getElementsByTagName('link');
    for (let i = 0; i < links.length; i++) {
        const link = links[i];
        if (link.rel === 'stylesheet') {
            const href = link.href;
            const domain = getDomain(href);
            if (approvedDomains.includes(domain)) {
                const newHref = href.indexOf('?') !== -1 ? `${href}&_=${new Date().getTime()}` : `${href}?_=${new Date().getTime()}`;
                link.href = newHref;
            }
        }
    }
}

//window.addEventListener('focus', reloadCSS);





function openSearchPop() {

}

function assignElements() {
    const cookieSnow = loadBooleanCookie('isSnow');
    if(cookieSnow) {
        enableSnow();
    }
    isSnow = cookieSnow;
    userInput = getId('user-input');
    userList = getId('user-list');
    channelInfo = getId("channel-info");
    replyInfo = getId("reply-info");
    replyContainer  = getId("reply-container");
    replyCloseButton = getId("reply-close-button");
    imagePreviewContainer = getId('image-preview-container');
    jsonPreviewContainer = getId('json-preview-container');
    previewImage = getId('preview-image');
    jsonPreviewElement = getId('json-preview-element')
    chatContainer = getId('chat-container');
    chatContent = getId('chat-content');
    guildSettingsDropdown = getId('guild-settings-dropdown');
    gifMenu = getId('gif-menu');
    gifsMenuSearchBar= getId('gifs-menu-searchbar');
    gifsMenuContainer = getId('gifs-menu-container');
    fileImagePreview = getId('image-preview');
    fileInput = getId('fileInput');
    fileButton = getId('file-button');
    guildsList = getId('guilds-list');
    channelList = getId('channel-list');
    inputElement = getId('channelSearchInput');

    channelsUl = channelList.querySelector('ul');
    chatContentInitHtml = chatContent.innerHTML;

    const searchDropdown = getId('search-dropdown');
    



    document.addEventListener('click', (event) => {
        if (!event.target.closest('#channelSearchInput')) {
            searchDropdown.classList.add('hidden');
            if(!inputElement.value.trim()) {
                inputElement.style.width = '150px';
            }
        }
    });

}








document.addEventListener('DOMContentLoaded', function () {
    window.scrollTo(0,0)
    assignElements();

    urlToBase64(defaultProfileImageUrl)
        .then(base64 => defaultProfileImageUrl = base64)
        .catch(error => console.error(error));
            
        urlToBase64(defaultMediaImageUrl)
            .then(base64 => defaultMediaImageUrl = base64)
            .catch(error => console.error(error));

    
    getId('globalSearchInput').addEventListener('click', function(){
        openSearchPop();
    });

    getId('guild-container').addEventListener('click', function(event) {
        if (event.target.id === 'guild-container' || event.target.id === 'guild-name') {
            toggleDropdown(); 
        }
    });
    gifsMenuSearchBar.addEventListener('keydown', debounce(async function(event) {
        await loadGifContent();
    }, 300));
    createChatScrollButton();
    
    chatContainer.addEventListener('scroll', handleScroll);

    initialiseUserInput();
    document.addEventListener('click', (event) => {
        if (!userMentionDropdown.contains(event.target) && event.target !== userInput) {
            userMentionDropdown.style.display = 'none';
        }
    });

    closeReplyMenu();
    adjustHeight();

    setDropHandler();
    
    updateFileImageBorder();
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


    selfBubble = getId("self-bubble");
    console.log("Loading initial guild: ",passed_guild_id,passed_channel_id,passed_guild_name,passed_author_id);

    initialiseMe();
    if (window.location.pathname.startsWith('/channels/@me/')) {
        const parts = window.location.pathname.split('/');
        const friendId = parts[3];
        OpenDm(friendId);
        
    } else  if (typeof passed_guild_id !== 'undefined' && typeof passed_channel_id !== 'undefined' && typeof passed_author_id !== 'undefined') {
        loadGuild(passed_guild_id,passed_channel_id,passed_guild_name,passed_author_id);
    }
    if (typeof passed_message_readen !== 'undefined') {
        readenMessagesCache = passed_message_readen;
    }
    if (typeof friends_status === 'object' && friends_status !== null) {
        friends_cache = friends_status;
    } 
    if(typeof passed_friend_id !== 'undefined') {
        addUser(passed_friend_id,passed_friend_name,passed_friend_discriminator,passed_friend_blocked)
    }

    if(isOnMe) {
        if(!isPathnameCorrect(window.location.pathname)) window.history.pushState(null, null, "/channels/@me" );
    }
    if(isOnGuild) {
        if(currentGuildData && !passed_guild_id in currentGuildData) {
            window.history.pushState(null,null, "/channels/@me")
        }
    }
    if(guild_users) {
        updateUserList(guild_users,true);
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
            channels_cache[data.GuildId] = data.GuildChannels;
            if(isOnGuild) {
                updateChannels(data.GuildChannels);
            }
        });
    }

    
    


    
});







function readCurrentMessages() {
    if (!currentChannelId ) { return; }
    //const lasttime = lastMessageDateTime;   'last_time' : lasttime,
    socket.emit('read_message',{'channelId' : currentChannelId,'guildId' : currentGuildId});
    getId('newMessagesBar').style.display = 'none';
}


function isAuthor(user_id){
    return guildAuthorIds[currentGuildId] == user_id 
}
function isSelfAuthor() {
    return isAuthor(currentUserId);
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
    if(!permissions_map) { return [] }
    const guildsWeAreAdminOn = [];
    let isFoundAny = false;
    for (const key in permissions_map) {
        if (permissions_map[key].is_admin) {
            guildsWeAreAdminOn.push(key);
            isFoundAny = true;
        }
    }
    return isFoundAny ? guildsWeAreAdminOn : null;
}








let isUsersOpen = true;







function getLastSecondMessageDate() {
    const messages = chatContent.children;
    if (messages.length < 2) return  '';

    const secondToLastMessage = messages[messages.length - 2];
    if (secondToLastMessage) {
        const dateGathered = secondToLastMessage.getAttribute('data-date');
        if(dateGathered) {
            const parsedDate = new Date(dateGathered);
            const formattedDate = formatDate(parsedDate);
            return formattedDate;
        }
    }
    return '';
}



function initialiseMe() {
    enableElement('dms-title');
    userList.innerHTML = userListTitleHTML;
    loadMainToolbar();
    isInitialized = true;
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
        
        fetchUsers();
        getChannels();
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











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

    chatInput = getId("user-input");
    userList = getId("user-list");
    channelTitle = getId("channel-info");
    
    
    guildsList = getId("guilds-list");
    channelList = getId("channel-list");
    channelsUl = channelList.querySelector("ul");
    


    addChannelSearchListeners();
    

}
const createBlackImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 50;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
};

const renderGuilds = (guilds) => {
    const blackImage = createBlackImage();
    const uniqueGuildIds = new Set();
    return guilds.map(({ guildId, rootChannel, guildName, ownerId }) => {
        if (uniqueGuildIds.has(guildId)) return '';
        uniqueGuildIds.add(guildId);
        return createGuildListItem(String(guildId), `/guilds/${guildId}`, blackImage, rootChannel, guildName || '');
    }).join('');
};

const createGuildListItem = (guildIdStr, imgSrc, blackImage, rootChannel, guildNameStr) => `
    <li>
        <img id="${guildIdStr}" src="${imgSrc}" style="width: 50px; height: 50px; border: none;" 
        onerror="this.onerror=null;this.src='${blackImage}';" 
        onclick="loadGuild('${encodeURIComponent(guildIdStr)}', '${encodeURIComponent(rootChannel)}', '${guildNameStr}')" />
        <div class="white-rod"></div>
    </li>
`;


const preventDrag = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.addEventListener('dragstart', function(event) {
            event.preventDefault();
        });
    }
};
let initialGuildId;
let initialChannelId;
let initialOwnerId;
let initialUserId;
let initialNickname;
let initialDiscriminator;
let initialPermissionsMap;
let maskedEmail;
function initialiseState(data) {
    const {
        email,
        userId,
        nickName: nick_name,
        userDiscriminator: user_discriminator,
        guildId,
        friendId,
        channelId,
        guildName,
        ownerId,
        messagesReaden,
        sharedGuildsMap: shared_guilds_map,
        permissionsMap,
        friendsStatus: passed_friends_status,
        dmFriends: passed_dm_friends = [],
        guildsJson,
        guildMembers: guild_members
    } = data;  
    
    console.log('Data loaded:', data);

    initialGuildId = guildId;
    initialChannelId = channelId;
    initialOwnerId = ownerId;
    initialUserId = userId;
    initialNickname = nick_name;
    initialDiscriminator = user_discriminator;
    initialPermissionsMap = permissionsMap;
    updateDmsList(passed_dm_friends);
    friendCache.initialiseFriends(passed_friends_status);

    maskedEmail = getMaskedEmail(email);
    currentGuildId = guildId; 

    const guildsList = document.getElementById('guilds-list');
    
    if (Array.isArray(guildsJson)) {
        guildsJson.forEach(guild => {
            cacheInterface.setMemberIds(guild.guildId, guild.guildMembers);
            guild.guildMembers.forEach(console.log);
            guild.guildChannels.forEach(console.log);
        });
        guildsList.innerHTML += renderGuilds(guildsJson);
    } else {
        console.error("Non-array guild data");
    }

    const selectedGuild = guildsList.querySelector(`img[id="${currentGuildId}"]`);
    if (selectedGuild) {
        selectedGuild.parentNode.classList.add('selected-guild');
    }

    preventDrag('main-logo');
    preventDrag('preview-image');
    addKeybinds();
}

async function loadInitialData() {
    try {
        const response = await fetch("/api/init");
        if (!response.ok) {
            throw new Error('Failed to load initial data');
        }
        const rawResponse = await response.text(); 
        const initData = JSON.parse(rawResponse); 
        initialiseState(initData); 
        initializeApp();
    } catch (error) {
        console.error("Error loading initial data:", error);
    }
}
document.addEventListener("DOMContentLoaded", function () {
    loadInitialData();
    setTimeout(() => window.scrollTo(0, 0), 20);

});

function initializeApp() {
    window.scrollTo(0, 0);
    assignElements();
    initializeChatComponents();
    initializeImages();
    initializeElements();
    initializeSettings();
    initializeListeners();
    initializeGuild();
    initializeProfile();
    initialiseAudio();
    initializeCookies(); 
    isDomLoaded = true;
}
function initialiseAudio() {
    if(toggleManager.states["party-toggle"] && isAudioPlaying) {
        enableBorderMovement();
    }
}
function initializeImages() {
    urlToBase64(defaultProfileImageUrl)
        .then(base64 => defaultProfileImageUrl = base64)
        .catch(error => console.error(error));

    urlToBase64(defaultMediaImageUrl)
        .then(base64 => defaultMediaImageUrl = base64)
        .catch(error => console.error(error));
}

function initializeElements() {
    createChatScrollButton();
    chatContainer.addEventListener("scroll", handleScroll);
    initialisechatInput();
    closeReplyMenu();
    adjustHeight();
    setDropHandler();


    const guildContainer = getId("guild-container");
    guildContainer.addEventListener("mouseover", () => guildContainer.style.backgroundColor = "#333538");
    guildContainer.addEventListener("mouseout", () => guildContainer.style.backgroundColor = "#2b2d31");

    const friendContainer = getId("friend-container-item");
    friendContainer.addEventListener("click", loadDmHome);

    getId("tb-showprofile").addEventListener("click", toggleUsersList);
    selfProfileImage = getId("self-profile-image");
    selfProfileImage.addEventListener("mouseover", function () { this.style.borderRadius = "0px"; });
    selfProfileImage.addEventListener("mouseout", function () { this.style.borderRadius = "50%"; });
}

function initializeSettings() {
    
    updateSelfProfile(currentUserId);
    const isCookieUsersOpen = loadBooleanCookie("isUsersOpen");
    setUsersList(isCookieUsersOpen, true);
    disableElement("loading-screen");
}

function initializeListeners() {
    document.addEventListener("click", (event) => {
        if (!userMentionDropdown.contains(event.target) && event.target !== chatInput) {
            userMentionDropdown.style.display = "none";
        }
    });
    getId("global-search-input").addEventListener("click", function(){
        openSearchPop();
    });

    const guildContainer = getId("guild-container");
    guildContainer.addEventListener("click", handleGuildClick);

    addContextListeners();
}

function handleGuildClick(event) {
    if (event.target.id === "guild-container" || event.target.id === "guild-name") {
        toggleDropdown();
    }
}
function isDefined(variable) {
    return typeof variable !== "undefined" && variable !== null;
}
function initializeGuild() {
    initialiseMe();
    if(validateRoute()) {
        loadGuild(initialGuildId, passed_channel_id, passed_guild_name,false,true);
    } else {
        console.warn("Route cannot be validated!!");
        return;
    }

    if (isDefined(passed_message_readen)) {
        readenMessagesCache = passed_message_readen;
    }

    if (isDefined(passed_friend_id)) {
        addUser(passed_friend_id, passed_friend_name, passed_friend_discriminator, passed_friend_blocked);
    }

    if (isDefined(guild_members) && isDefined(initialGuildId)) {
        cacheInterface.updateMembers(initialGuildId, guild_members);
        updateMemberList(guild_members, true);
    }

    if (isOnGuild && guilds_data && guilds_data.length > 0) {
        guilds_data.forEach(data => {
            cacheInterface.addChannel(data.guildId, data.guildChannels);
            updateChannels(data.guildChannels);
        });
    }

    guildCache.initialiseGuildOwnerIds(passedGuildOwnerIds);
}
function initializeProfile() {
    currentUserId = initialUserId;
    currentUserNick = initialNickname;
    currentDiscriminator = initialDiscriminator;
    getId("self-name").textContent = currentUserNick;
    getId("self-discriminator").textContent = "#"+initialDiscriminator;
    updateSelfProfile(currentUserId);
}







function readCurrentMessages() {
    if (!currentChannelId ) { return; }
    apiClient.send("read_message",{"channelId" : currentChannelId,"guildId" : currentGuildId});
    getId("newMessagesBar").style.display = "none";
}





function createReplyBar(newMessage,messageId,userId,content,attachmentUrls) {
    if(newMessage.querySelector(".replyBar")) { return; }
    const smallDate = newMessage.querySelector(".small-date-element");
    if(smallDate)  {
        smallDate.remove();
    }

    const replyBar = createEl("div",{className:"replyBar"});
    newMessage.appendChild(replyBar);
    newMessage.classList.add("replyMessage");
    const messageContentElement = newMessage.querySelector("#message-content-element")


    const nick = getUserNick(userId);
    replyBar.style.height = "100px";
    const replyAvatar = createEl("img", {className : "profile-pic", id : userId});
    replyAvatar.classList.add("reply-avatar");
    replyAvatar.style.width = "15px";
    replyAvatar.style.height = "15px";

    setProfilePic(replyAvatar,userId);
    const replyNick = createEl("span",{textContent:nick,className:"reply-nick"});
    const textToWrite = content ? content : attachmentUrls ? attachmentUrls : "Eki görüntülemek için tıkla";
    const replyContent = createEl("span",{className:"replyContent", textContent:textToWrite})

    
    replyContent.onclick = () => {
        const originalMsg = getId(messageId);
        if(originalMsg) {
            scrollToMessage(originalMsg);
        } else {
            fetchReplies(newMessage.dataset.replyToId, null, goToOld=true);
        }
    }
    replyBar.appendChild(replyAvatar);
    replyBar.appendChild(replyNick);
    replyBar.appendChild(replyContent);
    
}









function removeDm(userId) {


}















function initialiseMe() {
    if(!isOnMe) {
        console.log("Cant initialise me while isOnMe is false");
        return;
    }
    enableElement("dms-title");
    updateUserListText();
    loadMainToolbar();
    isInitialized = true;
}


let isChangingPage = false;

function userExistsDm(userId) {
    return userId in dm_friends;
}
function openDm(friendId) {
    const wasOnDm = isOnDm;
    isOnDm = true;
    currentDmId = friendId;
    lastSenderID = "";
    activateDmContainer(friendId);
    const url = constructDmPage(friendId);
    if(url != window.location.pathname) {
        window.history.pushState(null, null, url);
    }
    if(!userExistsDm(friendId)) {
        apiClient.send("add_dm",{"friend_id" : friendId});
    }
    loadApp(friendId);
    if(wasOnDm) {
        changeCurrentDm(friendId);
    }
    GetHistoryFromOneChannel(friendId,true);
}


let lastDmId;

function loadDmHome(isChangingUrl=true) {
    console.log("Loading main menu...");

    function handleMenu() {
        selectGuildList("main-logo");
        if(isChangingUrl) {
            window.history.pushState(null, null, "/channels/@me");
        }
        enableElement("friends-container",false,true);
        getId("friend-container-item").classList.add("dm-selected");
        disableDmContainers();
        lastDmId = "";
        currentDmId = "";
        enableElement("channel-info-container-for-friend");
        disableElement("channel-info-container-for-index");
        loadMainToolbar();
        disableElement("chat-container");
        disableElement("message-input-container");
        getId("friend-container-item").style.color = "white";

        updateUserListText();
        userList.classList.add("friendactive");
        if(userListFriActiveHtml) {
            userList.innerHTML = userListFriActiveHtml;
        }
        const nowOnlineTitle = getId("nowonline");
        if(nowOnlineTitle) nowOnlineTitle.style.fontWeight = "bolder";
        if(isOnMe) { return; }
        isOnMe = true;
        isOnGuild = false;
    }
    
    function handleDm() {
        openDm(lastDmId)
        disableElement("friends-container");
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


    enableElement("friend-container-item");
    getId("guild-name").innerText = "";
    disableElement("guild-settings-button");
    enableElement("global-search-input",false,true);
    enableElement("friends-container-item");
    
    enableElement("dms-title");
    enableElement("dm-container-parent",false, true);
    channelsUl.innerHTML = "";

    enableElement("guild-container",false,true);
    
    
    const chanList = getId("channel-list");
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
    getId("channel-info").textContent = currentChannelName;
    getId("guild-name").innerText = currentGuildName;
    isDropdownOpen = false;
    disableElement("settings-dropdown-button");
  
    isChangingPage = false;
}

function loadApp(friendId=null,isInitial=false) {
    if(isChangingPage) {return;  }
    isChangingPage = true;
    const userList = getId("user-list");

    if(isOnMe) {
        userListFriActiveHtml = userList.innerHTML;
    }
    
    isOnMe = false;

    userList.innerHTML = ""; 
    userList.classList.remove("friendactive"); 
    enableElement("guild-name");
    console.log("Loading app with friend id:", friendId);

    if(!friendId) {
        isOnGuild = true;
        isOnDm = false;
        if(currentDmId) {
            lastDmId = currentDmId;
        }
        if(!isInitial) {
            fetchMembers();
            getChannels();

        }
        disableElement("dms-title");
        disableElement("dm-container-parent");
        disableElement("friend-container-item");
        enableElement("guild-settings-button");
        enableElement("hash-sign");
        getId("guild-name").innerText = currentGuildName;
        disableElement("global-search-input");
        disableElement("dm-profile-sign-bubble");
        disableElement("dm-profile-sign");
        loadGuildToolbar();
    } else {
        loadDmToolbar();
        isOnGuild = false;
        isOnDm = true;
        enableElement("dm-profile-sign-bubble");
        enableElement("dm-profile-sign");
        enableElement("guild-container",false,true);
        disableElement("guild-settings-button");
        activateDmContainer(friendId);
        const friendNick = passed_friend_name != undefined && passed_friend_id == friendId ? passed_friend_name : getUserNick(friendId);
        chatInput.placeholder = translations.getDmPlaceHolder(friendNick);

        channelTitle.textContent = friendNick;
        disableElement("hash-sign");
        enableElement("dm-profile-sign")
        const dmProfSign = getId("dm-profile-sign");
        setProfilePic(dmProfSign,friendId);
        dmProfSign.dataset.cid = friendId;
        
        updateDmFriendList(friendId,friendNick,passed_friend_discriminator);
    }
    
    
    disableElement("channel-info-container-for-friend");
    disableElement("friends-container");
    document.querySelector(".horizontal-line").style.display = "none";
    
    enableElement("channel-info-container-for-index");
    enableElement("chat-container",true);
    enableElement("message-input-container",false,true);
    adjustHeight();
    
    handleResize();
    isChangingPage = false;
}

function changeCurrentDm(friendId) {
    isChangingPage = true;
    isOnMe = false;
    isOnGuild = false;
    isOnDm = true;
    isReachedChannelEnd = false;
    
    const friendNick = getUserNick(friendId);
    channelTitle.textContent = friendNick;
    chatInput.placeholder = translations.getDmPlaceHolder(friendNick);
    const dmProfSign = getId("dm-profile-sign");
    setProfilePic(dmProfSign,friendId);
    dmProfSign.dataset.cid = friendId;
    updateDmFriendList(friendId,friendNick)

    isChangingPage = false;
}











let contextMenu = null;


const Overview = 'Overview';
const Roles = 'Roles';
const Emoji = 'Emoji';
const Invites = 'Invites';
const DeleteGuild = 'Delete Guild';
const textChanHtml = '<svg class="icon_d8bfb3" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M10.99 3.16A1 1 0 1 0 9 2.84L8.15 8H4a1 1 0 0 0 0 2h3.82l-.67 4H3a1 1 0 1 0 0 2h3.82l-.8 4.84a1 1 0 0 0 1.97.32L8.85 16h4.97l-.8 4.84a1 1 0 0 0 1.97.32l.86-5.16H20a1 1 0 1 0 0-2h-3.82l.67-4H21a1 1 0 1 0 0-2h-3.82l.8-4.84a1 1 0 1 0-1.97-.32L15.15 8h-4.97l.8-4.84ZM14.15 14l.67-4H9.85l-.67 4h4.97Z" clip-rule="evenodd" class=""></path></svg>'
const voiceChanHtml = '<svg class="icon_d8bfb3" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3a1 1 0 0 0-1-1h-.06a1 1 0 0 0-.74.32L5.92 7H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2.92l4.28 4.68a1 1 0 0 0 .74.32H11a1 1 0 0 0 1-1V3ZM15.1 20.75c-.58.14-1.1-.33-1.1-.92v-.03c0-.5.37-.92.85-1.05a7 7 0 0 0 0-13.5A1.11 1.11 0 0 1 14 4.2v-.03c0-.6.52-1.06 1.1-.92a9 9 0 0 1 0 17.5Z" class=""></path><path fill="currentColor" d="M15.16 16.51c-.57.28-1.16-.2-1.16-.83v-.14c0-.43.28-.8.63-1.02a3 3 0 0 0 0-5.04c-.35-.23-.63-.6-.63-1.02v-.14c0-.63.59-1.1 1.16-.83a5 5 0 0 1 0 9.02Z" class=""></path></svg>'

const inviteHtml = '<svg class="actionIcon_f6f816" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M14.5 8a3 3 0 1 0-2.7-4.3c-.2.4.06.86.44 1.12a5 5 0 0 1 2.14 3.08c.01.06.06.1.12.1ZM16.62 13.17c-.22.29-.65.37-.92.14-.34-.3-.7-.57-1.09-.82-.52-.33-.7-1.05-.47-1.63.11-.27.2-.57.26-.87.11-.54.55-1 1.1-.92 1.6.2 3.04.92 4.15 1.98.3.27-.25.95-.65.95a3 3 0 0 0-2.38 1.17ZM15.19 15.61c.13.16.02.39-.19.39a3 3 0 0 0-1.52 5.59c.2.12.26.41.02.41h-8a.5.5 0 0 1-.5-.5v-2.1c0-.25-.31-.33-.42-.1-.32.67-.67 1.58-.88 2.54a.2.2 0 0 1-.2.16A1.5 1.5 0 0 1 2 20.5a7.5 7.5 0 0 1 13.19-4.89ZM9.5 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM15.5 22Z" class=""></path><path fill="currentColor" d="M19 14a1 1 0 0 1 1 1v3h3a1 1 0 0 1 0 2h-3v3a1 1 0 0 1-2 0v-3h-3a1 1 0 1 1 0-2h3v-3a1 1 0 0 1 1-1Z" class=""></path></svg>';
const settingsHtml = '<svg class="actionIcon_f6f816" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M10.56 1.1c-.46.05-.7.53-.64.98.18 1.16-.19 2.2-.98 2.53-.8.33-1.79-.15-2.49-1.1-.27-.36-.78-.52-1.14-.24-.77.59-1.45 1.27-2.04 2.04-.28.36-.12.87.24 1.14.96.7 1.43 1.7 1.1 2.49-.33.8-1.37 1.16-2.53.98-.45-.07-.93.18-.99.64a11.1 11.1 0 0 0 0 2.88c.06.46.54.7.99.64 1.16-.18 2.2.19 2.53.98.33.8-.14 1.79-1.1 2.49-.36.27-.52.78-.24 1.14.59.77 1.27 1.45 2.04 2.04.36.28.87.12 1.14-.24.7-.95 1.7-1.43 2.49-1.1.8.33 1.16 1.37.98 2.53-.07.45.18.93.64.99a11.1 11.1 0 0 0 2.88 0c.46-.06.7-.54.64-.99-.18-1.16.19-2.2.98-2.53.8-.33 1.79.14 2.49 1.1.27.36.78.52 1.14.24.77-.59 1.45-1.27 2.04-2.04.28-.36.12-.87-.24-1.14-.96-.7-1.43-1.7-1.1-2.49.33-.8 1.37-1.16 2.53-.98.45.07.93-.18.99-.64a11.1 11.1 0 0 0 0-2.88c-.06-.46-.54-.7-.99-.64-1.16.18-2.2-.19-2.53-.98-.33-.8.14-1.79 1.1-2.49.36-.27.52-.78.24-1.14a11.07 11.07 0 0 0-2.04-2.04c-.36-.28-.87-.12-1.14.24-.7.96-1.7 1.43-2.49 1.1-.8-.33-1.16-1.37-.98-2.53.07-.45-.18-.93-.64-.99a11.1 11.1 0 0 0-2.88 0ZM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clip-rule="evenodd" class=""></path></svg>';
const muteHtml = '<svg class="icon_cdc675" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="m2.7 22.7 20-20a1 1 0 0 0-1.4-1.4l-20 20a1 1 0 1 0 1.4 1.4ZM10.8 17.32c-.21.21-.1.58.2.62V20H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2.06A8 8 0 0 0 20 10a1 1 0 0 0-2 0c0 1.45-.52 2.79-1.38 3.83l-.02.02A5.99 5.99 0 0 1 12.32 16a.52.52 0 0 0-.34.15l-1.18 1.18ZM15.36 4.52c.15-.15.19-.38.08-.56A4 4 0 0 0 8 6v4c0 .3.03.58.1.86.07.34.49.43.74.18l6.52-6.52ZM5.06 13.98c.16.28.53.31.75.09l.75-.75c.16-.16.19-.4.08-.61A5.97 5.97 0 0 1 6 10a1 1 0 0 0-2 0c0 1.45.39 2.81 1.06 3.98Z" class=""></path></svg>';
const inviteVoiceHtml = '<svg class="icon_cdc675" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M13 3a1 1 0 1 0-2 0v8H3a1 1 0 1 0 0 2h8v8a1 1 0 0 0 2 0v-8h8a1 1 0 0 0 0-2h-8V3Z" class=""></path></svg>';

const selectedChanColor = 'rgb(64, 66, 73)';
const hoveredChanColor = 'rgb(53, 55, 60';



const loadingScreen = createEl('div', { id: 'loading-screen' });
document.body.appendChild(loadingScreen);
const loadingElement = createEl('img', { id: 'loading-element' });
loadingScreen.appendChild(loadingElement);
loadingElement.src = '/static/images/icons/icon.png';




function toggleEmail() {
    const eyeIcon = getId('set-info-email-eye');
    isEmailToggled = !isEmailToggled;
    getId("set-info-email").textContent = isEmailToggled ? email : masked_email;    
    if (isEmailToggled) {
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
}



function handleToggleClick(toggleElement, toggleClickCallback) {
    toggleElement.addEventListener('click', function() {
        this.classList.toggle('active');
        this.querySelector('#toggle-switch').classList.toggle('active');
        toggleClickCallback();
    });
}


function handleResize() {
    
    if(window.innerWidth < 1200) {
        if(isOnMe) {
            disableElement('user-list');
            const userLine = document.querySelector('.horizontal-line');
            userLine.style.display = 'none';
        } else {
            setUserListLine();
        }   
    }  else {
        setUserListLine();
    }
    
    const inputRightToSet = userList.style.display === 'flex' ? '463px' : '76px';
    const addFriendInputButton = getId('addfriendinputbutton');
    if (addFriendInputButton) {
        addFriendInputButton.style.right = inputRightToSet;
    }
}


function loadMainToolbar() {
    disableElement('tb-call')
    disableElement('tb-video-call')
    disableElement('tb-pin')
    disableElement('tb-createdm')
    disableElement('tb-showprofile')
    disableElement('tb-search')
}
function loadGuildToolbar() {
    disableElement('tb-call')
    disableElement('tb-video-call')
    enableElement('tb-pin')
    disableElement('tb-createdm')
    enableElement('tb-showprofile')
    enableElement('tb-search')
}
function loadDmToolbar() {
    enableElement('tb-call')
    enableElement('tb-video-call')
    enableElement('tb-pin')
    enableElement('tb-createdm')
    enableElement('tb-showprofile')
    enableElement('tb-search')
}


function fillDropDownContent() {
    if(permissionManager.canManageChannels()) {
        enableElement('channel-dropdown-button');
    } else {
        disableElement('channel-dropdown-button');
    }
    if(permissionManager.canManageChannels()) {
        enableElement('invite-dropdown-button');
    } else {
        disableElement('invite-dropdown-button');
    }

    if(isSelfAuthor()) {
        disableElement('exit-dropdown-button');
    } else {
        enableElement('exit-dropdown-button');
    }
}

function setActiveIcon() {
    let favicon = getId('favicon');
    let activeIconHref = '/static/images/icons/iconactive.png';
    favicon.href = activeIconHref;
}
function setInactiveIcon() {
    let favicon = getId('favicon');
    let activeIconHref =  '/static/images/icons/icon.png';
    favicon.href = activeIconHref;
}






function keydownHandler(event) {
    if (event.key === 'Escape') {
        event.preventDefault();
        if (isSettingsOpen) {
            closeSettings();
            return;
        }
        if (isImagePreviewOpen) {
            hideImagePreviewRequest();
        }
    }
}

document.addEventListener('keydown', keydownHandler);


function isProfilePopOpen() {
    return Boolean(getId('profilePopContainer'))    
}

document.body.addEventListener('click', function(event) {
    if (gifMenu && !gifMenu.contains(event.target) && event.target.id !== 'gifbtn') {
        closeGifs();
    }
});

function hideLoadingScreen() {
    loadingScreen.style.display = 'none';
}










function createMsgOptionButton(message,isReply) {
    const textc = isReply ? '↪' : '⋯'; 
    
    const newButton = createEl('button',{className:'message-button'});

        const textEl = createEl('div', { textContent: textc, className: 'message-button-text' });
        newButton.appendChild(textEl);
    if(isReply) {
        newButton.onclick = function() {
            showReplyMenu(message.id,message.dataset.user_id);
        }

    }

    newButton.addEventListener("mousedown", function() {
        newButton.style.border = "2px solid #000000";
    });    
    newButton.addEventListener("mouseup", function() {
        newButton.style.border = "none";
    });
    newButton.addEventListener("mouseover", function() {
        newButton.style.backgroundColor = '#393a3b';
    });    
    newButton.addEventListener("mouseout", function() {
        newButton.style.backgroundColor = '#313338';
    });
    newButton.addEventListener('focus', () => {
        newButton.classList.add('is-focused');
    });
    newButton.addEventListener('blur', () => {
        newButton.classList.remove('is-focused');
    });
    let buttonContainer = message.querySelector('.message-button-container');
    if (!buttonContainer) {
        buttonContainer = createEl('div');
        buttonContainer.classList.add('message-button-container');
        message.appendChild(buttonContainer);
    }

    buttonContainer.appendChild(newButton);
    return newButton;
}

//Context
const ActionType = {
    COPY_ID: "ID'yi Kopyala",
    COPY_USER_ID: "Kullanıcı ID'sini Kopyala",
    INVITE_TO_GUILD: "Sunucuya Davet Et",
    BLOCK_USER: "Engelle",
    REPORT_USER: "Kullanıcı Profilini Bildir",
    REMOVE_USER: "Arkadaşı Çıkar",
    EDIT_GUILD_PROFILE: "Sunucu Profilini Düzenle",
    MENTION_USER : "Bahset"
};
const ChannelsActionType = {
    MARK_AS_READ: "Okundu olarak işaretle",
    COPY_LINK: "Bağlantıyı Kopyala",
    MUTE_CHANNEL: "Kanalı Sessize Al",
    NOTIFY_SETTINGS: "Bildirim Ayarları",
    EDIT_CHANNEL: "Kanalı Düzenle",
    DELETE_CHANNEL: "Kanalı Sil"

}
const VoiceActionType = {
    OPEN_PROFILE: "Profil",
    MENTION_USER: "Bahset",
    MUTE_USER: "Sustur",
    DEAFEN_USER: "Sağırlaştır"
    
}
function createUserContext(user_id) {
    let context = {};


    if(!isProfilePopOpen()) {
        context[VoiceActionType.OPEN_PROFILE] = { action: () => drawProfilePop(user_id) };
    }

    context[VoiceActionType.MENTION_USER] = () => mentionUser(user_id),
    context[VoiceActionType.MUTE_USER] = () => muteUser(user_id),
    context[VoiceActionType.DEAFEN_USER] = () => deafenUser(user_id)

    if (user_id === currentUserId) {
        context[ActionType.EDIT_GUILD_PROFILE] = () => editGuildProfile();
    }

    if (isDeveloperMode) {
        context[ActionType.COPY_ID] = () => copyId(user_id);
    }

    return context;
}

function createProfileContext(userData) {
    const user_id = userData.UserId;
    let context = {};


    if(!isProfilePopOpen()) {
        context[VoiceActionType.OPEN_PROFILE] = { action: () => drawProfilePop(userData) };
    }


    if (user_id !== currentUserId) {
        const guildSubOptions = getManageableGuilds();
        if (Array.isArray(guildSubOptions) && guildSubOptions.length > 0) {
            context[ActionType.INVITE_TO_GUILD] = {
                action: () => {},
                subOptions: guildSubOptions.map(subOption => ({
                    label: getGuildName(subOption),
                    action: () => inviteUser(user_id, subOption)
                }))
            };
        }
    }

    if (!isOnMe) {
        context[ActionType.MENTION_USER] = {
            action: () => mentionUser(user_id)
        };
    }

    if (user_id == currentUserId) {
        context[ActionType.EDIT_GUILD_PROFILE] = {
            action: () => editGuildProfile()
        };
    } else {
        context[ActionType.BLOCK_USER] = {
            action: () => blockUser(user_id)
        };
        context[ActionType.REPORT_USER] = {
            action: () => reportUser(user_id)
        };
    }

    if (isFriend(user_id)) {
        context[ActionType.REMOVE_USER] = {
            action: () => removeFriend(user_id)
        };
    }

    if (isDeveloperMode) {
        context[ActionType.COPY_USER_ID] = {
            action: () => copyId(user_id)
        };
    }

    return context;
}



function addContextListeners() {
    document.addEventListener('contextmenu', function (event) {
        event.preventDefault();

        let options = null;

        if (event.target.id && contextList.hasOwnProperty(event.target.id)) {
            options = contextList[event.target.id];
        } else if (event.target.dataset.m_id && messageContextList.hasOwnProperty(event.target.dataset.m_id)) {
            options = messageContextList[event.target.dataset.m_id];
        } else if (event.target.dataset.cid && contextList.hasOwnProperty(event.target.dataset.cid)) {
            options = contextList[event.target.dataset.cid];
        }

        if (options) {
            showContextMenu(event.pageX, event.pageY, options);
        }
    });

    document.addEventListener('click', function (event) {
        if (event.target.dataset.m_id && messageContextList.hasOwnProperty(event.target.dataset.m_id)) {
            const options = messageContextList[event.target.dataset.m_id];
            if (options) {
                hideContextMenu();
                showContextMenu(event.pageX, event.pageY, options);
            }
        }

        if (event.target.classList && !event.target.classList.contains('message') && event.target.id && messageContextList.hasOwnProperty(event.target.id)) {
            const options = messageContextList[event.target.id];
            if (options) {
                hideContextMenu();
                showContextMenu(event.pageX, event.pageY, options);
            }
        }
    });
}

function createChannelsContext(channelId) {
    let context = {};
    context[ChannelsActionType.MARK_AS_READ] = { action: () => readCurrentMessages() };
    context[ChannelsActionType.COPY_LINK] = { action: () => copyChannelLink(currentGuildId, channelId) };
    context[ChannelsActionType.MUTE_CHANNEL] = { action: () => muteChannel(channelId) };
    context[ChannelsActionType.NOTIFY_SETTINGS] = { action: () => showNotifyMenu(channelId) };

    if (isSelfAuthor()) {
        context[ChannelsActionType.EDIT_CHANNEL] = { action: () => editChannel(channelId) };
        context[ChannelsActionType.DELETE_CHANNEL] = { action: () => deleteChannel(channelId, currentGuildId) };
    }

    if (isDeveloperMode) {
        context[ActionType.COPY_ID] = { action: () => copyId(channelId) };
    }

    return context;
}

function createMessageContext(messageId, user_id) {
    let context = {};

    context[MessagesActionType.ADD_REACTION] = { action: () => openReactionMenu(messageId) };

    if (user_id === currentUserId) {
        context[MessagesActionType.EDIT_MESSAGE] = { action: () => openEditMessage(messageId) };
    }

    if (isSelfAuthor() || (isOnDm && user_id === currentUserId)) {
        context[MessagesActionType.PIN_MESSAGE] = { action: () => pinMessage(messageId) };
    }

    context[MessagesActionType.REPLY] = { action: () => showReplyMenu(messageId, user_id) };
    context[MessagesActionType.MARK_AS_UNREAD] = { action: () => markAsUnread(messageId) };

    if (isSelfAuthor() || (isOnDm && user_id === currentUserId)) {
        context[MessagesActionType.DELETE_MESSAGE] = { action: () => deleteMessage(messageId) };
    }

    if (isDeveloperMode) {
        context[ActionType.COPY_ID] = { action: () => copyId(messageId) };
    }

    return context;
}

function createMenuItem(label, itemOptions) {
    const li = createEl('li', { textContent: label });
    li.addEventListener('click', function(event) {
        event.stopPropagation();
        hideContextMenu();
        if (itemOptions.action) {
            itemOptions.action();
        }
    });

    if (itemOptions.subOptions) {
        const subUl = createEl('ul');
        itemOptions.subOptions.forEach(subOption => {
            const subLi = createMenuItem(subOption.label, { action: subOption.action });
            subUl.appendChild(subLi);
        });
        li.appendChild(subUl);

        li.addEventListener('mouseenter', function() {
            const subMenu = li.querySelector('ul');
            subMenu.style.display = 'block';
            
            subMenu.style.left = '100%';
            subMenu.style.right = 'auto';
            
            const subRect = subMenu.getBoundingClientRect();
            const viewportWidth = window.innerWidth;

            if (subRect.right > viewportWidth) {
                subMenu.style.left = 'auto';
                subMenu.style.right = '100%';
            } else if (subRect.left < 0) { 
                subMenu.style.left = '0';
                subMenu.style.right = 'auto';
            }
        });

        li.addEventListener('mouseleave', function() {
            const subMenu = li.querySelector('ul');
            subMenu.style.display = 'none'; 
        });
    }

    return li;
}


function showContextMenu(x, y, options) {
    hideContextMenu();
    const tempContextMenu = createEl('div', { id: 'contextMenu', className: 'context-menu' });
    const ul = createEl('ul');
    for (const key in options) {
        if (options.hasOwnProperty(key)) {
            const itemOptions = options[key];
            const li = createMenuItem(key, itemOptions);
            ul.appendChild(li);
        }
    }
    tempContextMenu.appendChild(ul);
    document.body.appendChild(tempContextMenu);

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = tempContextMenu.offsetWidth;
    const menuHeight = tempContextMenu.offsetHeight;

    let left = Math.min(x, viewportWidth - menuWidth);
    let top = Math.min(y, viewportHeight - menuHeight);

    tempContextMenu.style.setProperty('--menu-left', `${left}px`);
    tempContextMenu.style.setProperty('--menu-top', `${top}px`);

    contextMenu = tempContextMenu;

    document.addEventListener('click', clickOutsideContextMenu);
}



function clickOutsideContextMenu(event) {
    if (contextMenu && !contextMenu.contains(event.target) && !contextList[event.target.id]) {
        hideContextMenu();
    }
}

function hideContextMenu() {
    if (contextMenu) {
        contextMenu.remove();
        contextMenu = null; // Reset contextMenu variable
        document.removeEventListener('click', clickOutsideContextMenu);
    }
}








function handleUserClick(userName) {
    alert(`User ${userName} clicked!`);
}


function openGuildSettingsDd(event) {
    const clicked_id = event.target.id;
    toggleDropdown();

    if ( clicked_id === 'invite-dropdown-button' ) {
        createInviteUsersPop();
    }
    else if ( clicked_id ===  'settings-dropdown-button') {
        reconstructSettings(true);
        openSettings(true);
        selectSettingCategory(Overview);
    }
    else if ( clicked_id===  "channel-dropdown-button") {
        createChannelsPop();
    }
    else if (clicked_id ===  "notifications-dropdown-button") {
        
    }
    else if ( clicked_id ===  "exit-dropdown-button") {
        askUser('Sunucudan ayrıl', 'Sunucudan ayrılmak istediğine emin misin?','Sunucudan ayrıl',leaveCurrentGuild)
    }

    
}







//Generic
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


function alertUser(subject, content) {
    const popUpSubject = createEl('h1', { className: 'pop-up-subject', textContent: subject });
    const popUpContent = createEl('p', { className: 'pop-up-content', textContent: content });

    const popAcceptButton = createEl('button', { className: 'pop-up-accept', textContent: 'Tamam' });
    const popRefuseButton = createEl('button', { className: 'pop-up-refuse', textContent: 'İptal' });

    const buttonContainer = createEl('div', { className: 'pop-button-container' });
    buttonContainer.appendChild(popAcceptButton);
    buttonContainer.appendChild(popRefuseButton);

    const contentElements = [popUpSubject, popUpContent, buttonContainer];

    popAcceptButton.addEventListener('click', function () {
        closePopUp(outerParent, outerParent.firstChild);
    });
    popRefuseButton.addEventListener('click', function () {
        closePopUp(outerParent, outerParent.firstChild);
    });

    outerParent = createPopUp({
        contentElements: contentElements,
        id: null 
    });
}

function askUser(subject, content, successText, acceptCallback, isRed = false) {
    const popUpSubject = createEl('h1', { className: 'pop-up-subject', textContent: subject });
    const popUpContent = createEl('p', { className: 'pop-up-content', textContent: content });
    const popAcceptButton = createEl('button', { className: 'pop-up-accept', textContent: successText });
    if (isRed) {
        popAcceptButton.style.backgroundColor = 'rgb(218, 55, 60)';
    }
    let outerParent;
    popAcceptButton.addEventListener('click', function () {
        acceptCallback();
        closePopUp(outerParent, outerParent.firstChild);
    });

    const popRefuseButton = createEl('button', { className: 'pop-up-refuse', textContent: 'İptal' });
    popRefuseButton.addEventListener('click', function () {
        closePopUp(outerParent, outerParent.firstChild);
    });

    const buttonContainer = createEl('div', { className: 'pop-button-container' });
    buttonContainer.appendChild(popAcceptButton);
    buttonContainer.appendChild(popRefuseButton);

    const contentElements = [popUpSubject, popUpContent, buttonContainer];

    outerParent = createPopUp({
        contentElements: contentElements,
        id: null 
    });
}




async function setGuildPic(guildImg , guildId) {
    setPicture(guildImg , guildId,false)
}
async function setProfilePic(profileImg, userId, isTimestamp = false) {
    setPicture(profileImg,userId,true,isTimestamp)
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


function logOutPrompt() {
    askUser('Çıkış Yap','Çıkış yapmak istediğine emin misin?','Çıkış Yap',logOut,color=isRed=true);
}

function loadObservedContent(jsonData) {

    const sanitizedHTML = sanitizeHTML(jsonData);

    const tempDiv = createEl('div');
    tempDiv.innerHTML = sanitizedHTML;

    while (tempDiv.firstChild) {
        entry.target.appendChild(tempDiv.firstChild);
    }

    observer.unobserve(entry.target);
}


// media preview
function beautifyJson(jsonData) {
    try {
        const beautifiedJson = JSON.stringify(jsonData, null, '\t');
        return beautifiedJson;
    } catch (error) {
        console.error('Error beautifying JSON:', error);
        return null;
    }
}





function displayImagePreview(sourceimage) {
    imagePreviewContainer.style.display = 'flex';
    previewImage.style.animation = 'preview-image-animation 0.2s forwards';
    previewImage.src = sourceimage;
    currentSelectedImg = sourceimage;
    const previewBtn  = getId('preview-image-button')
    if (!sourceimage.startsWith('data:')) { 
        previewBtn.href = sourceimage;
        previewBtn.target = sourceimage;
    } else {
        previewBtn.href = sourceimage;
        previewBtn.target = sourceimage;
    }

}

function displayJsonPreview(sourceJson) {
    jsonPreviewContainer.style.display = 'flex';
    jsonPreviewElement.dataset.content_observe = sourceJson;
    jsonPreviewElement.style.userSelect = 'text';
    jsonPreviewElement.style.whiteSpace = 'pre-wrap';
    observer.observe(jsonPreviewElement);
}


function hideImagePreviewRequest(event) {
    if(event.target.id ==='image-preview-container') {
        hideImagePreview();
    }
}
function hideImagePreview() {
    previewImage.style.animation = 'preview-image-disappear-animation 0.15s forwards';
    setTimeout(() => {
        imagePreviewContainer.style.display = 'none';
        previewImage.src = '';
    }, 150);

}


function hideJsonPreview(event) {
    if(event.target.id ==='json-preview-container') {
        
        jsonPreviewContainer.style.display = 'none';
    }
}






// gifs/emojis/stickers section

function displayGIFs(gifDatas) {
    gifsMenuContainer.innerHTML = ''; 

    gifDatas.forEach(gifData => {
        const img = createEl('img',{className:'gif-content',src:gifData.preview});
        gifsMenuContainer.appendChild(img);
        img.addEventListener('click',function() {
            toggleGifs();
            sendMessage(gifData.gif);
        });
    });

}
async function loadGifContent() {
    const query = gifsMenuSearchBar.value;
    if(!query) {
        gifsMenuContainer.innerHTML = '';
        return;
    } 

    const url = `https://liventcord-gif-worker.efekantunc0.workers.dev?q=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(`API error: ${data.error}`);
        }
        console.warn(data.results);

        const gifElements = data.results.map(result => ({
            gif: result.media_formats.gif.url,
            preview: result.media_formats.tinygif.url,
        }));

        displayGIFs(gifElements);
    } catch (error) {
        console.error('Error fetching or parsing GIFs:', error);
    }
}

function toggleEmojis() {
    if(isGifsOpen) {
        closeGifs();
    } else {
        gifMenu.style.display = 'block';
    }
    isGifsOpen = !isGifsOpen;
}
function closeGifs() {
    gifMenu.style.display = 'none';
}
async function toggleGifs() {
    if (isGifsOpen) {
        closeGifs();
    } else {
        gifMenu.style.display = 'block';
    }
    isGifsOpen = !isGifsOpen;
}
const addfriendhighlightedcolor = '#248046';
const addfrienddefaultcolor = '#248046';
const highlightedColor = '#43444b';
const defaultColor = '#313338';
const  grayColor = '#c2c2c2';
let isFriendsOpen = false;
let defaultProfileImageUrl = `/static/images/guest.png`;
const offline = 'offline';
const online = 'online';
const all = 'all';
const pending = 'pending';
const blocked = 'blocked';
var ButtonsList = null; 
let currentSelectedStatus = null;
let friendsContainer = null;
let friends_cache = {};
let fetchUsersTimeout = null;



function getId(string) { return document.getElementById(string);}



function activateDmContainer(friend_id) {
    getId('friend-container-item').classList.remove('dm-selected');
    if(!existingUsersDmContainers || existingUsersDmContainers.size < 1) { return }
    
    existingUsersDmContainers.forEach(dmContainer => {
        if(dmContainer.id == friend_id) {
            dmContainer.classList.add('dm-selected');
        } else {
            dmContainer.classList.remove('dm-selected');
        }
    });
}
function disableDmContainers() {
    if(!existingUsersDmContainers || existingUsersDmContainers.size < 1) { return }
        
    existingUsersDmContainers.forEach(dmContainer => {
        dmContainer.classList.remove('dm-selected');
    });
}

let existingUsersDmContainers = new Set(); 
let existingUsersIds = new Set();
function createDmContainer(user) {
    const dmContainer = createEl('div', { className: 'dm-container', id: user.user_id });

    if(user.user_id == currentDmId) {
        dmContainer.classList.add('dm-selected');
    }
    const profileImg = createEl('img', { className: 'dm-profile-img' });

    setProfilePic(profileImg, user.user_id);
    const bubble = createDmBubble(user.is_online);
    profileImg.style.transition = 'border-radius 0.5s ease-out';
    bubble.style.transition = 'opacity 0.5s ease-in-out';
    let hoverTimeout;
    // Mouseover event to handle the hover effect
    profileImg.addEventListener('mouseover', function() {
        this.style.borderRadius = '0px';
        if (bubble) {
            clearTimeout(hoverTimeout); // Clear any previous timeout
            bubble.style.opacity = '0'; // Start fading out
            // Set a timeout to hide the element completely after the fade-out
            hoverTimeout = setTimeout(function() {
                bubble.style.display = 'none';
            }, 500); // Duration of the opacity transition
        }
    });

    // Mouseout event to revert the hover effect
    profileImg.addEventListener('mouseout', function() {
        this.style.borderRadius = '25px';
        if (bubble) {
            clearTimeout(hoverTimeout); // Clear any previous timeout
            bubble.style.display = 'block'; // Show the element
            // Use a short delay to ensure the display property takes effect
            setTimeout(function() {
                bubble.style.opacity = '1'; // Start fading in
            }, 10); // Small delay to ensure display property is applied
        }
    });
    

    dmContainer.addEventListener('click', () => {
        OpenDm(user.user_id);
    });

    appendToProfileContextList(user, user.user_id);

    dmContainer.appendChild(bubble);
    dmContainer.appendChild(profileImg);

    const titleContent = createEl('p',{className:'content',textContent:user.nickname});
    dmContainer.appendChild(titleContent);

    const closeBtn = createEl('div');
    closeBtn.classList.add('close-dm-btn');
    closeBtn.textContent = 'X';
    closeBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        removeDm(user.user_id); // Implement this function to handle removal
    });
    dmContainer.appendChild(closeBtn);

    return dmContainer;
}





function appendToDmList(user) {
    if (existingUsersIds.has(user.user_id)) {return; }

    const dmContainer = createDmContainer(user);
    const dmContainerParent = getId('dm-container-parent');

    dmContainerParent.appendChild(dmContainer);
    existingUsersDmContainers.add(dmContainer);
    existingUsersIds.add(user.user_id);
    return dmContainer;
}


function updateDmsList(users) {
    if (typeof users !== 'object' || users === null) {
        console.error('Expected a dictionary of users');
        return;
    }
    
    // Collect new user IDs
    const newUserIds = new Set(Object.keys(users));

    // Compare new user IDs with existing ones
    if (existingUsersIds.size === newUserIds.size && [...existingUsersIds].every(user_id => newUserIds.has(user_id))) {
        return; // No changes detected
    }

    // Remove existing DM containers
    existingUsersDmContainers.forEach(dmContainer => dmContainer.remove());
    existingUsersDmContainers.clear();
    existingUsersIds.clear();

    // Create and append new DM containers
    Object.entries(users).forEach(([user_id, user]) => {
        const dmContainer = createDmContainer({ user_id, ...user });
        const dmContainerParent = document.getElementById('dm-container-parent');

        dmContainerParent.appendChild(dmContainer);
        existingUsersDmContainers.add(dmContainer);
        existingUsersIds.add(user_id);
    });
}







function loadMainMenu() {
        
}

function isOffline(bubble) {
    return bubble.getAttribute('isOffline') === 'true';
}


function selectFriendMenuStatus(status) {
    if(status == online) {
        selectFriendMenu(OnlineButton);
    } else if(status == all) {
        selectFriendMenu(AllButton);
    } else if(status == pending) {
        selectFriendMenu(blockedButton);
    } else if(status == blocked) {
        selectFriendMenu(blockedButton);
    }
}





document.addEventListener('DOMContentLoaded', function () {
    

    
    updateDmsList(dm_friends);
    
    window.addEventListener('resize',handleResize);
    
    
    friendsContainer = getId('friends-container');
    const OnlineButton = getId("OnlineButton");
    const AllButton = getId("AllButton");
    const pendingButton = getId("PendingButton");
    const blockedButton = getId("BlockedButton");
    

    
    ButtonsList = [OnlineButton, AllButton, pendingButton, blockedButton];

    initializeButtonsList(ButtonsList);
    selectFriendMenu(OnlineButton);


    
}); 
let messageTimeout;

function print_message(message) {
    const messagetext = createEl('div');
    messagetext.className = 'messagetext'; 
    messagetext.textContent = message;
    const parentNode = getId('friends-popup-container');
    parentNode.appendChild(messagetext);

    if (messageTimeout) {
        clearTimeout(messageTimeout);
    }

    messageTimeout = setTimeout(() => {
        messagetext.remove();
        messageTimeout = null;
    }, 10000);
}
const ErrorType = {
    INVALID_EVENT: 'INVALID_EVENT',
    CANNOT_ADD_SELF: 'CANNOT_ADD_SELF',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    INVALID_IDENTIFIER: 'INVALID_IDENTIFIER',
    FRIEND_REQUEST_EXISTS: 'FRIEND_REQUEST_EXISTS',
    FRIEND_REQUEST_NOT_EXISTS : 'FRIEND_REQUEST_NOT_EXISTS',
    REQUEST_ALREADY_ACCEPTED: 'REQUEST_ALREADY_ACCEPTED',
    NOT_FRIENDS: 'NOT_FRIENDS',
    REQUEST_NOT_SENT: 'REQUEST_NOT_SENT',
    SUCCESS: 'SUCCESS'
};
const RequestType = {
    add_friend_request: 'add_friend_request',
    accept_friend_request: 'accept_friend_request',
    remove_friend_request: 'remove_friend_request',
    remove_friend: 'remove_friend',
    deny_friend: 'deny_friend'
}

const errorMessages = {
    [ErrorType.INVALID_EVENT]: 'Bilinmeyen hata!',
    [ErrorType.CANNOT_ADD_SELF]: 'Kendinle arkadaş olamazsın!',
    [ErrorType.USER_NOT_FOUND]: 'Kullanıcı bulunamadı!',
    [ErrorType.INVALID_IDENTIFIER]: 'Geçersiz tanımlayıcı!',
    [ErrorType.FRIEND_REQUEST_EXISTS]: 'Bu kullanıcıya zaten istek gönderdin!',
    [ErrorType.FRIEND_REQUEST_NOT_EXISTS]: 'Bu kullanıcıya istek göndermedin!',
    [ErrorType.REQUEST_ALREADY_ACCEPTED]: 'Bu isteği zaten kabul ettin!',
    [ErrorType.NOT_FRIENDS]: 'Bu kullanıcıyla arkadaş değilsin!',
    [ErrorType.REQUEST_NOT_SENT]: 'Bu kullanıcı sana istek göndermedi!',
    [ErrorType.SUCCESS]: 'İşlem başarıyla gerçekleştirildi!'
};

function displayFriendsMessage(msg) {
    print_message(msg);
    if(currentSelectedStatus === pending && !isFriendsOpen) {
        fetchUsersFromAPI(pending);
    }
}
function addToDmList(userData) {
    const dmContainerParent = getId('dm-container-parent');
    const existingDmContainer =  dmContainerParent.querySelector(`#${CSS.escape(userData.user_id)}`);
    if(existingDmContainer) {
        dmContainerParent.insertBefore(existingDmContainer, dmContainerParent.firstChild); 
        return; 
    }

    const newContainer = appendToDmList(userData);
    dmContainerParent.insertBefore(newContainer, dmContainerParent.firstChild);

}

function handleFriendEventResponse(message) {
    const type = message.type;
    const isSuccess = message.success;
    const user_id = message.user_id;
    const userData = message.user_data;
    let user_nick = getUserNick(user_id);

    if(user_nick == deletedUser) {
        user_nick = message.user_nick
    }

    let text = '';

    if(!message.error ){
        switch(type) {
            case RequestType.add_friend_request:
                text = isSuccess
                    ? `${user_nick} kullanıcısına arkadaşlık isteği gönderildi.`
                    : errorMessages[ErrorType.FRIEND_REQUEST_EXISTS];
                break;
            case RequestType.add_friend_request_id:
                text = isSuccess
                    ? `${user_nick} kullanıcısına arkadaşlık isteği gönderildi.`
                    : errorMessages[ErrorType.FRIEND_REQUEST_EXISTS];
                break;
            case RequestType.accept_friend_request:
                text = isSuccess
                    ? `${user_nick} kullanıcısından gelen arkadaşlık isteği kabul edildi.`
                    : errorMessages[ErrorType.REQUEST_ALREADY_ACCEPTED];
                
                friends_cache[user_id] = userData;
                disableElement('pendingAlertRight');
                disableElement('pendingAlertLeft');
                document.title = 'LiventCord';
                
                break;
            case RequestType.remove_friend_request:
                text = isSuccess
                    ? `${user_nick} kullanıcısına giden istek silindi.`
                    : errorMessages[ErrorType.FRIEND_REQUEST_NOT_EXISTS];
                break;
            case RequestType.remove_friend : 
                text = isSuccess
                ? `${user_nick} kullanıcısı arkadaşlıktan çıkarıldı.`
                : errorMessages[ErrorType.NOT_FRIENDS];
                break;
            case RequestType.deny_friend_request:
                text = isSuccess
                    ? `${user_nick} kullanıcısından gelen arkadaşlık isteği reddedildi.`
                    : errorMessages[ErrorType.REQUEST_NOT_SENT];
                break;
            default:
                if(type) {
                    text = `${errorMessages[ErrorType.INVALID_EVENT]} ${type}`;
                } else {
                    text = errorMessages[ErrorType.INVALID_EVENT];
                }
        }

    } else {
        text = errorMessages[message.error];
    }
    if(type == 'remove_friend') {
        const friCard = friendsContainer.querySelector(`#${CSS.escape(user_id)}`);
        if(friCard) { 
            friCard.remove();
        }
        reCalculateFriTitle();
    }
    if(type == 'add_friend' || type == 'accept_friend_request') {
        friends_cache[user_id] = userData;
        addToDmList(userData);
    }
    
    displayFriendsMessage(text);



    console.log(message);
}



let isFetchingUsers = false;
function selectFriendMenu(clickedButton) {
    if (isFetchingUsers) { 
        console.warn("isFetchingUsers, returning.");
        return;
    }
    
    if (isPopulating) {
        console.warn("Populating, returning."); 
        return;
    }
    getId("open-friends-button").style.backgroundColor = '#248046'; // set friend add button to green
    getId("open-friends-button").style.color = 'white';

    isFriendsOpen = false;
    currentSelectedStatus = getRequestType(clickedButton);
    if(!ButtonsList) {
        const OnlineButton = getId("OnlineButton");
        const AllButton = getId("AllButton");
        const pendingButton = getId("PendingButton");
        const blockedButton = getId("BlockedButton");
        ButtonsList = [OnlineButton, AllButton, pendingButton, blockedButton];
        
    }
    for (const button of ButtonsList) {
        const reqType = getRequestType(button);

        if (reqType === currentSelectedStatus) {
            button.style.backgroundColor = highlightedColor;
            button.style.color = 'white';
        } else {
            button.style.backgroundColor = defaultColor;
            button.style.color = grayColor;
        }

    }
    fetchUsersFromAPI(currentSelectedStatus);

}   
function setWindowName(pendingCounter) {
    if(pendingCounter) {
        document.title = `LiventCord (${pendingCounter})`;
    }
}
let isInitializedPendingUsers = false;

function updateFriendsList(data,isPending) {
    if (!data) { data = {} } 
    if (isFriendsOpen) {return;}


    const mapUser = user => ({
        user_id : user.user_id,
        name: user.nickname,
        discriminator : user.discriminator,
        status: user.status,
        is_online: user.is_online,
        description: user.description,
        created_at: user.created_at,
        last_login: user.last_login,
        social_media_links: user.social_media_links,
        is_friends_requests_to_user : user.is_friends_requests_to_user
    });
    
    const users = Object.values(data).map(mapUser);

    if(!isInitializedPendingUsers && isPending) {
        console.log(data);

        let pendingCounter = 0;
        users.forEach(user => {
            if(user.is_friends_requests_to_user) {
                pendingCounter += 1;
            }
        });
        if(pendingCounter > 0) {
            getId('pendingAlertLeft').textContent = pendingCounter;
            enableElement('pendingAlertLeft');
            getId('pendingAlertRight').textContent = pendingCounter;
            enableElement('pendingAlertRight');
            setWindowName(pendingCounter);
        }

        console.log(pendingCounter);
        
        isInitializedPendingUsers = true;
        return;
    }

    populateFriendsContainer(users,isPending);


}
function getRequestType(btn) {
    const OnlineButton = getId("OnlineButton");
    const AllButton = getId("AllButton");
    const pendingButton = getId("PendingButton");
    const blockedButton = getId("BlockedButton");
    let reqType = '';
    if (btn){
        
        switch (btn) {
            case OnlineButton:
                reqType = 'online';
                break;
            case AllButton:
                reqType = 'all';
                break;
            case pendingButton:
                reqType = 'pending';
                break;
            case blockedButton:
                reqType = 'blocked';
                break;
            default:
                reqType = 'online';
                break;
                break;
        }
    }
    return reqType;
}
function initializeButtonsList(ButtonsList) {
    for (let element of ButtonsList) {
        const reqType = getRequestType(element);
        element.addEventListener('click', function() {
            selectFriendMenu(element);
        });

        element.addEventListener('mouseenter', function() {
            element.style.backgroundColor = highlightedColor;
            element.style.color = 'white';
        });
        
        element.addEventListener('mouseleave', function() {
            if (reqType === currentSelectedStatus && !isFriendsOpen) {
                element.style.backgroundColor = highlightedColor;
                element.style.color = 'white';
            }
            else {
                element.style.backgroundColor = defaultColor;
                element.style.color = grayColor;
            }
            
        });
        
        
    }
}
function resetButtons() {
    for (let element of ButtonsList) {
        if (element){
            element.style.backgroundColor = defaultColor;
            element.style.color = grayColor;
        }
        
    }
}



function createGraySphere(content, contentClass = '', hoverText = '') {
    const graySphere = createEl('div', { className: 'gray-sphere friend_button_element' });

    if(hoverText) {
        graySphere.addEventListener('mouseenter', function() {
            const descriptionRectangle = createEl('div', { className: 'description-rectangle'});
            const textEl = createEl('div', { className: 'description-rectangle-text', textContent: hoverText  });
    
            descriptionRectangle.appendChild(textEl);
            graySphere.appendChild(descriptionRectangle);
        });
        graySphere.addEventListener('mouseleave', function() {
            const descriptionRectangle = graySphere.querySelector('.description-rectangle');
            if (descriptionRectangle) {
                descriptionRectangle.remove();
            }
        });

    }
    if (content instanceof HTMLElement) {
        graySphere.appendChild(content);
    } else {
        const textElement = createEl('div', { className: contentClass, textContent: content });
        graySphere.appendChild(textElement);
    }
    return graySphere;
}
function createButtonWithBubblesImg(button,html,hoverText) {
    const icon = createEl('div', { innerHTML:html });
    icon.style.pointerEvents = 'none';
    const iconSphere = createGraySphere(icon,"",hoverText);
    button.appendChild(iconSphere);
    return iconSphere;
}
const ButtonTypes = {
    SendMsgBtn: `<svg role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 22a10 10 0 1 0-8.45-4.64c.13.19.11.44-.04.61l-2.06 2.37A1 1 0 0 0 2.2 22H12Z" class=""></path></svg>`,
    TickBtn: `<svg class="icon_e01b91" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M21.7 5.3a1 1 0 0 1 0 1.4l-12 12a1 1 0 0 1-1.4 0l-6-6a1 1 0 1 1 1.4-1.4L9 16.58l11.3-11.3a1 1 0 0 1 1.4 0Z" class=""></path></svg>`,
    CloseBtn : `<svg role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M17.3 18.7a1 1 0 0 0 1.4-1.4L13.42 12l5.3-5.3a1 1 0 0 0-1.42-1.4L12 10.58l-5.3-5.3a1 1 0 0 0-1.4 1.42L10.58 12l-5.3 5.3a1 1 0 1 0 1.42 1.4L12 13.42l5.3 5.3Z" class=""></path></svg>`,
    OptionsBtn : `<svg role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M10 4a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm2 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" clip-rule="evenodd" class=""></path></svg>`,
}

function updateUsersStatus(friend) { 
    const activityCard = createEl('div', { className: 'activity-card', id: friend.user_id });
    const contentDiv = createEl('div', { className: 'activity-card-content' });
    const avatarImg = createEl('img', { className: 'activity-card-avatar' });
    setProfilePic(avatarImg, friend.user_id);
    const nickHeading = createEl('h2', { className: 'activity-card-nick' });
    nickHeading.textContent = friend.name || getUserNick(friend.user_id);
    const titleSpan = createEl('span', { className: 'activity-card-title' });
    titleSpan.textContent = friend.activity || '';
    contentDiv.appendChild(avatarImg);
    contentDiv.appendChild(nickHeading);
    contentDiv.appendChild(titleSpan);

    const iconImg = createEl('img', { className: 'activity-card-icon', src: '/static/images/defaultmediaimage.png' });

    activityCard.appendChild(contentDiv);
    activityCard.appendChild(iconImg);


    getId('user-list').appendChild(activityCard);
    
}

function createFriendCard(friend,isPending,friendsContainer) {
    console.log(friend);
    const friendCard = createEl('div',{className:'friend-card', id: friend.user_id});
    const img = createEl('img');
    
    setProfilePic(img,friend.user_id);

    img.classList.add('friend-image');
    let bubble = createFriendCardBubble(friend.is_online);
    img.style.transition = 'border-radius 0.5s ease-out';
    bubble.style.transition = 'display 0.5s ease-in-out';
    if(isPending) {
        bubble.remove();
    } else {
        friendCard.appendChild(bubble);
    }
    
    
    
    img.addEventListener('mouseover', function() {
        this.style.borderRadius = '0px';
        if (bubble && !isPending && !friend.is_online) {
            bubble.style.display = 'none'; 
        }
    });
    
    img.addEventListener('mouseout', function() {
        this.style.borderRadius = '25px';
        if (bubble && !isPending) {
            bubble.style.display = friend.is_online ? 'none' : 'block'; 
        }
    });
    
    appendToProfileContextList(friend,friend.user_id);



    const friendButton = createEl('div', { className: 'friend-button' });
    const friendInfo = createEl('div', { className: 'friend-info' });
    const friendName = createEl('div', { className: 'friend-name', textContent: friend.name });
    const friendDiscriminator = createEl('div',{ className : 'friend-discriminator', textContent: `#${friend.discriminator}`});
    const onlineText = friend.is_online ? OnlineText : OfflineText;
    const friendStatus = createEl('div', { className: 'friend-status', textContent: isPending ? (friend.is_friends_requests_to_user ? 'Gelen Arkadaş İsteği' : 'Giden Arkadaş İsteği') : onlineText });
    friendInfo.appendChild(friendName);
    friendInfo.appendChild(friendDiscriminator);
    friendInfo.appendChild(friendStatus);
    friendCard.appendChild(img);
    friendCard.appendChild(friendInfo);
    friendCard.appendChild(friendButton);
    
    if (friend.is_friends_requests_to_user && isPending) {
        let acceptButton = createButtonWithBubblesImg(friendButton, ButtonTypes.TickBtn,'Kabul Et');
        acceptButton.addEventListener('click', function(event) {
            if(event.target == acceptButton) {
                event.stopPropagation();
                socket.emit('accept_friend_request', { 'friendId': friend.user_id });
            }
        });
    }

    if (isPending) {
        let closeButton = createButtonWithBubblesImg(friendButton, ButtonTypes.CloseBtn, 'İptal Et'); //friend.is_friends_requests_to_user ? 'Yoksay' : 'İptal Et'
        closeButton.addEventListener('click', function(event) {
            if(event.target == closeButton) {

                event.stopPropagation();
                if (friend.is_friends_requests_to_user) {
                    socket.emit('deny_friend_request', { 'friendId': friend.user_id });
                } else {
                    socket.emit('remove_friend_request', { 'friendId': friend.user_id });
                }
            }
        });
    } else {
        const sendMsgBtn = createButtonWithBubblesImg(friendButton,ButtonTypes.SendMsgBtn,'Mesaj Gönder');
        sendMsgBtn.addEventListener('click', function(event) {
            OpenDm(friend.user_id);
        });

        friendCard.addEventListener('click', () => {
            OpenDm(friend.user_id);
        })
        let optionsButton = createButtonWithBubblesImg(friendButton,ButtonTypes.OptionsBtn,'');
        optionsButton.id = friend.user_id;
        optionsButton.addEventListener('click', function(event) {
            console.log(event.target, optionsButton);
            if(event.target == optionsButton) {
                event.preventDefault();
                const options = contextList[event.target.id];
                console.log(options);
                if (options) {
                    showContextMenu(event.pageX, event.pageY, options);
                }

            }
        });
    }
    
    friendsContainer.appendChild(friendCard);
    friendCard.dataset.name = friend.name;
}


let lastRequestTime = 0;

async function fetchUsersFromAPI(request_type) {
    const currentTime = Date.now();
    
    if (currentTime - lastRequestTime < 60000) {
        console.log('Cooldown active, try again later.');
        return; 
    }

    if (!isFriendsOpen && !isPopulating) {
        isFetchingUsers = true;
        try {
            socket.emit(EventType.GET_FRIENDS, { 'requestType': request_type });
            lastRequestTime = currentTime;
        } catch (error) {
            console.error('Error fetching users:', error);
        }
        setTimeout(() => {
            isFetchingUsers = false;
        }, 100);
    }
}

let existingFriends = null;
let isPopulating = false; 




const OnlineText = 'Çevrim İçi';
const OfflineText = 'Çevrim Dışı';
const PendingText = 'Bekleyen';
const BlockedText = 'Engellenen';
const allText = 'Tümü';
function getFriendsTranslation() {
    switch (currentSelectedStatus) {
        case online:
            return OnlineText;
        case offline:
            return OfflineText;
        case pending:
            return PendingText;
        case blocked:
            return BlockedText;
        case all:
            return allText;
        default:
            return ''
    }
}

function filterFriends() {
    const input = getId('friendsSearchInput').value.toLowerCase();
    const friends = document.getElementsByClassName('friend-card');

    for (let i = 0; i < friends.length; i++) {
        const friendName = friends[i].getAttribute('data-name').toLowerCase();
        if (friendName.includes(input)) {
            friends[i].classList.add('visible');
        } else {
            friends[i].classList.remove('visible');
        }
    }
}
function reCalculateFriTitle() {
    const friendsCount = friendsContainer.children.length;
    const textToWrite = friendsCount !== 0 ? getFriendsTranslation() + ' — ' + friendsCount : '';
    getId('friendsTitleContainer').textContent = textToWrite;
}
function populateFriendsContainer(friends, isPending) {
    friends.forEach(user => {
        addUser(user.user_id, user.name, user.discriminator);
    });
    if (isPopulating || !currentSelectedStatus) {  return;  }
    isPopulating = true;
    const friendsContainer = getId('friends-container');
    try {
        
        if (currentSelectedStatus == online) {
            friends = friends.filter(user => user.is_online);
        } else if (currentSelectedStatus == all) {
        } else if (currentSelectedStatus == blocked) {
            friends = friends.filter(user => isBlocked(user.user_id));
        } else if(currentSelectedStatus == pending) {
        } else {
            console.warn("Unhandled status:" + currentSelectedStatus);
            return;
        }
        
        const friendsCount = friends.length;
        const textToWrite = friendsCount !== 0 ? getFriendsTranslation() + ' — ' + friendsCount : '';
        const friendsTitleContainer = createEl('h2',{marginRight: '50px', marginTop: '100px',textContent:textToWrite, id:"friendsTitleContainer"});
        
        if (friendsCount === 0) {
            if(friendsContainer.querySelector('#wumpusalone')) { return; }
            friendsContainer.innerHTML = '';
            const imgElement = createEl('img');
            imgElement.id = 'wumpusalone';
            imgElement.src = '/static/images/wumpusalone.png';
            imgElement.style.userSelect = 'none';
            disableElement('friendsTitleContainer');
            friendsContainer.appendChild(imgElement);
        } else {
            const initialFriendsContainerHtml = `<input id='friendsSearchInput' autocomplete='off' placeholder='Ara' onkeyup="filterFriends()"></input>`;
            friendsContainer.innerHTML = initialFriendsContainerHtml;
            friendsContainer.appendChild(friendsTitleContainer);
            setTimeout(() => {
                filterFriends();
            }, 10);
            for (const friend of friends) {
                createFriendCard({ ...friend }, isPending,friendsContainer);
                if(friend.activity) {
                    updateUsersStatus(friend)
                }
            }
            enableElement('friendsTitleContainer');
        }

        existingFriends = friends;
    } catch (error) {
        console.error('Error populating friends container:', error);
    } finally {
        isPopulating = false;
    }
}


function createFriendCardBubble(isOnline) {
    const bubble = createEl('span',{className:'status-bubble'})
    bubble.style.marginLeft = '20px';
    bubble.style.marginTop = '25px';
    bubble.style.padding = '5px';
    bubble.style.border = '3px solid #2f3136';

    if (isOnline) {
        bubble.setAttribute('isOffline', false);
        bubble.classList.add('online');
    } else {
        bubble.setAttribute('isOffline', true);
        bubble.classList.add('offline');
    }

    return bubble;
}

function createDmBubble(isOnline) {
    const bubble = createEl('span',{className:'dm-bubble'});

    if (isOnline) {
        bubble.setAttribute('isOffline', false);
        bubble.classList.add('online');
    } else {
        bubble.setAttribute('isOffline', true);
        bubble.classList.add('offline');
    }

    return bubble;
}

function toggleButtonState(booleanstate) {
    if (booleanstate) {
        addButton.classList.add('active');
        addButton.classList.remove('inactive');
    } else {
        addButton.classList.add('inactive');
        addButton.classList.remove('active');
    }
}
function isFriend(user_id) {
    if(user_id == currentUserId) { return false }
    if (!friends_cache) {  return false }
    return user_id in friends_cache;
}
function isOnline(user_id) {
    if (!friends_cache || !friends_cache[user_id]) {  return false }
    return friends_cache[user_id].is_online;
}
function openAddFriend() {
    resetButtons();
    isFriendsOpen = true;


    let friendsBtn = getId("open-friends-button");
    friendsBtn.style.color = "#2fc770";
    friendsBtn.style.backgroundColor = 'transparent';

    friendsContainer.innerHTML = '';
    


    const addfriendtext = createEl('div', { id: 'addfriendtext',textContent:'ARKADAŞ EKLE' });
    const addfrienddetailtext= createEl('div', { id: 'addfrienddetailtext',textContent:'Arkadaşlarını LiventCord kullanıcı adı ile ekleyebilirsin.' });
    const addfriendinputcontainer = createEl('div');
    const addfriendinput = createEl('input', { id: 'addfriendinputfield', placeholder: 'Arkadaşlarını LiventCord kullanıcı adı ile ekleyebilirsin.',  autocomplete:"off"});
    const addfriendinputbutton = createEl('button', { id: 'addfriendinputbutton', textContent: 'Arkadaşlık İsteği Gönder'});

    const userlistline = createEl('hr', { className:"vertical-line-long"});

    addfriendinputbutton.classList.add('inactive'); 

    addfriendinput.addEventListener('input', () => {
        const inputValue = addfriendinput.value.trim();
        toggleButtonState(inputValue !== ''); 
    });

    function toggleButtonState(isActive) {
        if (isActive) {
            addfriendinputbutton.classList.remove('inactive');
            addfriendinputbutton.classList.add('active');
        } else {
            addfriendinputbutton.classList.remove('active');
            addfriendinputbutton.classList.add('inactive');
        }
    }

    addfriendinputbutton.addEventListener('click', () => {
        submitAddFriend();
    });



    addfriendinputcontainer.appendChild(addfriendinput);
    addfriendinputcontainer.appendChild(addfriendinputbutton);
    
    friendsContainer.appendChild(addfriendtext);
    friendsContainer.appendChild(addfrienddetailtext);
    friendsContainer.appendChild(addfriendinputcontainer);
    friendsContainer.appendChild(userlistline);


    const inputrighttoset = userList.style.display === 'flex' ? '463px' : '76px'

    addfriendinputbutton.style.right = inputrighttoset;
    if (addfriendinputbutton) {
        addfriendinputbutton.style.right = inputrighttoset;
    }

    const imgElement = createEl('img',{id:'gifanny'});
    imgElement.src = 'https://64.media.tumblr.com/0637f963f01f172f6a525fae0faa3730/tumblr_ncc0wsA0VC1tmbpmjo1_500.gifv';
    friendsContainer.appendChild(imgElement);
    
    
}
function isValidFriendName(input) {
    const pattern = /^[^#]+#\d{4}$/;
    return pattern.test(input);
}


const addFriendDiscriminatorErrorText = 'Tanımlayıcı geçersiz! (#0000)';
function parseUsernameDiscriminator(input) {
    let parts = input.split('#');
    if (parts.length !== 2) {
        return;
    }
    let username = parts[0];
    let discriminator = parts[1];
  
    return {
      username: username,
      discriminator: discriminator
    };
}

function addFriend(user_id) {
    socket.emit('add_friend_request',{'friendId' : user_id});
}
function submitAddFriend() {
    const addfriendinput = getId('addfriendinputfield');
    const currentValue = addfriendinput.value.trim();

    if (currentValue && currentValue.length > 0 ) {
        if(!isValidFriendName(currentValue)) {
            displayFriendsMessage(addFriendDiscriminatorErrorText);
            return;
        }

        const { username, discriminator } = parseUsernameDiscriminator(currentValue);
        if(!username || !discriminator) { return }
        
        socket.emit('add_friend_request',{'friendName': username , 'friendDiscriminator' : discriminator});
    }
}


function areJsonsEqual(existing_data, new_data) {
    if (existing_data == null || new_data == null) {
        return false;
    }

    if (typeof existing_data !== 'object' || typeof new_data !== 'object') {
        return false;
    }

    const existingJson = JSON.stringify(existing_data);
    const newJson = JSON.stringify(new_data);
    return existingJson === newJson;
}


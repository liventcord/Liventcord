

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
    const dmContainer = createEl('div', { className: 'dm-container', id: user.userId });

    if(user.userId == currentDmId) {
        dmContainer.classList.add('dm-selected');
    }
    const profileImg = createEl('img', { className: 'dm-profile-img' });

    setProfilePic(profileImg, user.userId);
    const bubble = createDmBubble(user.is_online);
    profileImg.style.transition = 'border-radius 0.5s ease-out';
    bubble.style.transition = 'opacity 0.5s ease-in-out';
    let hoverTimeout;
    profileImg.addEventListener('mouseover', function() {
        this.style.borderRadius = '0px';
        if (bubble) {
            clearTimeout(hoverTimeout); 
            bubble.style.opacity = '0';
            hoverTimeout = setTimeout(function() {
                bubble.style.display = 'none';
            }, 500); 
        }
    });

    profileImg.addEventListener('mouseout', function() {
        this.style.borderRadius = '25px';
        if (bubble) {
            clearTimeout(hoverTimeout); 
            bubble.style.display = 'block'; 
            setTimeout(function() {
                bubble.style.opacity = '1';
            }, 10);
        }
    });
    

    dmContainer.addEventListener('click', () => {
        OpenDm(user.userId);
    });

    appendToProfileContextList(user, user.userId);

    dmContainer.appendChild(bubble);
    dmContainer.appendChild(profileImg);

    const titleContent = createEl('p',{className:'content',textContent:user.nickname});
    dmContainer.appendChild(titleContent);

    const closeBtn = createEl('div');
    closeBtn.classList.add('close-dm-btn');
    closeBtn.textContent = 'X';
    closeBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        removeDm(user.userId); 
    });
    dmContainer.appendChild(closeBtn);

    return dmContainer;
}





function appendToDmList(user) {
    if (existingUsersIds.has(user.userId)) {return; }

    const dmContainer = createDmContainer(user);
    const dmContainerParent = getId('dm-container-parent');

    dmContainerParent.appendChild(dmContainer);
    existingUsersDmContainers.add(dmContainer);
    existingUsersIds.add(user.userId);
    return dmContainer;
}


function updateDmsList(users) {
    if (typeof users !== 'object' || users === null) {
        console.error('Expected a dictionary of users');
        return;
    }
    
    const newUserIds = new Set(Object.keys(users));

    if (existingUsersIds.size === newUserIds.size && [...existingUsersIds].every(userId => newUserIds.has(userId))) {
        return; 
    }

    existingUsersDmContainers.forEach(dmContainer => dmContainer.remove());
    existingUsersDmContainers.clear();
    existingUsersIds.clear();

    Object.entries(users).forEach(([userId, user]) => {
        const dmContainer = createDmContainer({ userId, ...user });
        const dmContainerParent = document.getElementById('dm-container-parent');

        dmContainerParent.appendChild(dmContainer);
        existingUsersDmContainers.add(dmContainer);
        existingUsersIds.add(userId);
    });
}
let notifyTimeout;

function print_message(message) {
    const messagetext = createEl('div');
    messagetext.className = 'messagetext'; 
    messagetext.textContent = message;
    const parentNode = getId('friends-popup-container');
    parentNode.appendChild(messagetext);

    if (notifyTimeout) {
        clearTimeout(notifyTimeout);
    }

    notifyTimeout = setTimeout(() => {
        messagetext.remove();
        notifyTimeout = null;
    }, 10000);
}
function addToDmList(userData) {
    const dmContainerParent = getId('dm-container-parent');
    const existingDmContainer =  dmContainerParent.querySelector(`#${CSS.escape(userData.userId)}`);
    if(existingDmContainer) {
        dmContainerParent.insertBefore(existingDmContainer, dmContainerParent.firstChild); 
        return; 
    }

    const newContainer = appendToDmList(userData);
    dmContainerParent.insertBefore(newContainer, dmContainerParent.firstChild);

}


function selectFriendMenuStatus(status) {
    const statusMap = {
        online: buttonElements.online,
        all: buttonElements.all,
        pending: buttonElements.pending,
        blocked: buttonElements.blocked
    };
    
    selectFriendMenu(statusMap[status] || buttonElements.online);
}

function selectFriendMenu(clickedButton) {
    if (isPopulating) {
        console.warn(isPopulating , "Populating friends list, returning.");
        return;
    }

    getId("open-friends-button").style.backgroundColor = '#248046';
    getId("open-friends-button").style.color = 'white';

    isAddFriendsOpen = false;
    currentSelectedStatus = getRequestType(clickedButton);

    if (!ButtonsList) {
        ButtonsList = Object.values(buttonElements);
    }

    ButtonsList.forEach(button => {
        const reqType = getRequestType(button);

        button.style.backgroundColor = reqType === currentSelectedStatus ? highlightedColor : defaultColor;
        button.style.color = reqType === currentSelectedStatus ? 'white' : grayColor;
    });

    getFriends(currentSelectedStatus);
}

function getRequestType(btn) {
    return Object.keys(buttonElements).find(key => buttonElements[key] === btn) || 'online';
}

function initializeButtonsList(ButtonsList) {
    ButtonsList.forEach(element => {
        const reqType = getRequestType(element);

        element.addEventListener('click', () => selectFriendMenu(element));
        element.addEventListener('mouseenter', () => {
            element.style.backgroundColor = highlightedColor;
            element.style.color = 'white';
        });

        element.addEventListener('mouseleave', () => {
            const isActive = reqType === currentSelectedStatus && !isAddFriendsOpen;
            element.style.backgroundColor = isActive ? highlightedColor : defaultColor;
            element.style.color = isActive ? 'white' : grayColor;
        });
    });
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
    const activityCard = createEl('div', { className: 'activity-card', id: friend.userId });
    const contentDiv = createEl('div', { className: 'activity-card-content' });
    const avatarImg = createEl('img', { className: 'activity-card-avatar' });
    setProfilePic(avatarImg, friend.userId);
    const nickHeading = createEl('h2', { className: 'activity-card-nick' });
    nickHeading.textContent = friend.nickName || getUserNick(friend.userId);
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
function openAddFriend() {
    resetButtons();
    isAddFriendsOpen = true;

    updateFriendButton();
    clearFriendContainer();
    createAddFriendForm();
    adjustButtonPosition();
    addGifImage();
}

function updateFriendButton() {
    let friendsBtn = getId("open-friends-button");
    friendsBtn.style.color = "#2fc770";
    friendsBtn.style.backgroundColor = 'transparent';
}

function clearFriendContainer() {
    friendsContainer.innerHTML = '';
}

function createAddFriendForm() {
    const addfriendtext = createEl('div', { id: 'addfriendtext', textContent: 'ARKADAŞ EKLE' });
    const addfrienddetailtext = createEl('div', { id: 'addfrienddetailtext', textContent: 'Arkadaşlarını LiventCord kullanıcı adı ile ekleyebilirsin.' });
    const addfriendinputcontainer = createEl('div');
    const addfriendinput = createEl('input', { id: 'addfriendinputfield', placeholder: 'Arkadaşlarını LiventCord kullanıcı adı ile ekleyebilirsin.', autocomplete: "off" });
    const addfriendinputbutton = createEl('button', { id: 'addfriendinputbutton', textContent: 'Arkadaşlık İsteği Gönder' });

    const userlistline = createEl('hr', { className: "vertical-line-long" });

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
}

function adjustButtonPosition() {
    const inputrighttoset = userList.style.display === 'flex' ? '463px' : '76px';
    const addfriendinputbutton = getId('addfriendinputbutton');
    addfriendinputbutton.style.right = inputrighttoset;
}

function addGifImage() {
    const imgElement = createEl('img', { id: 'gifanny' });
    imgElement.src = 'https://64.media.tumblr.com/0637f963f01f172f6a525fae0faa3730/tumblr_ncc0wsA0VC1tmbpmjo1_500.gif';
    friendsContainer.appendChild(imgElement);
}



function createFriendCardBubble(isOnline) {
    const bubble = createEl('span',{className:'status-bubble'})
    bubble.style.marginLeft = '20px';
    bubble.style.marginTop = '25px';
    bubble.style.padding = '5px';
    bubble.style.border = '3px solid #2f3136';

    if (isOnline) {
        bubble.classList.add('online');
    } else {
        bubble.classList.add('offline');
    }

    return bubble;
}

function createDmBubble(isOnline) {
    const bubble = createEl('span',{className:'dm-bubble'});

    if (isOnline) {
        bubble.classList.add('online');
    } else {
        bubble.classList.add('offline');
    }

    return bubble;
}

function populateFriendsContainer(friends, isPending) {
    friends.forEach(user => {
        addUser(user.userId, user.nickName, user.discriminator);
    });
    if (isPopulating || !currentSelectedStatus) {  return;  }
    isPopulating = true;
    const friendsContainer = getId('friends-container');
    try {
        
        if (currentSelectedStatus == online) {
            friends = friends.filter(user => user.is_online);
        } else if (currentSelectedStatus == all) {
        } else if (currentSelectedStatus == blocked) {
            friends = friends.filter(user => isBlocked(user.userId));
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
function createFriendCard(friend, isPending, friendsContainer) {
    const friendCard = createEl('div', { className: 'friend-card', id: friend.userId });
    const img = createEl('img');
    setProfilePic(img, friend.userId);
    img.classList.add('friend-image');
    img.style.transition = 'border-radius 0.5s ease-out';

    const bubble = createFriendCardBubble(friend.is_online);
    bubble.style.transition = 'display 0.5s ease-in-out';
    if (!isPending) friendCard.appendChild(bubble);

    img.addEventListener('mouseover', () => handleImageHover(img, bubble, isPending, friend.is_online, true));
    img.addEventListener('mouseout', () => handleImageHover(img, bubble, isPending, friend.is_online, false));

    appendToProfileContextList(friend, friend.userId);

    const friendInfo = createEl('div', { className: 'friend-info' });
    friendInfo.appendChild(createEl('div', { className: 'friend-name', textContent: friend.name }));
    friendInfo.appendChild(createEl('div', { className: 'friend-discriminator', textContent: `#${friend.discriminator}` }));
    const onlineStatus = isPending ? 
        (friend.is_friends_requests_to_user ? 'Gelen Arkadaş İsteği' : 'Giden Arkadaş İsteği') : 
        (friend.is_online ? OnlineText : OfflineText);
    friendInfo.appendChild(createEl('div', { className: 'friend-status', textContent: onlineStatus }));

    const friendButton = createEl('div', { className: 'friend-button' });

    if (isPending) {
        addPendingButtons(friendButton, friend);
    } else {
        addFriendButtons(friendButton, friend);
    }

    friendCard.appendChild(img);
    friendCard.appendChild(friendInfo);
    friendCard.appendChild(friendButton);
    friendsContainer.appendChild(friendCard);
    friendCard.dataset.name = friend.name;
}

function handleImageHover(img, bubble, isPending, isOnline, isMouseOver) {
    img.style.borderRadius = isMouseOver ? '0px' : '25px';
    if (bubble && !isPending) {
        bubble.style.display = (isMouseOver || isOnline) ? 'none' : 'block';
    }
}



function addFriendButtons(friendButton, friend) {
    const sendMsgBtn = createButtonWithBubblesImg(friendButton, ButtonTypes.SendMsgBtn, 'Mesaj Gönder');
    sendMsgBtn.addEventListener('click', () => OpenDm(friend.userId));

    const optionsButton = createButtonWithBubblesImg(friendButton, ButtonTypes.OptionsBtn, '');
    optionsButton.id = friend.userId;
    optionsButton.addEventListener('click', (event) => handleOptionsClick(event, optionsButton));
}

function handleOptionsClick(event, optionsButton) {
    event.preventDefault();
    const options = contextList[optionsButton.id];
    if (options) {
        showContextMenu(event.pageX, event.pageY, options);
    }
}

let userList;

function renderTitle(titleText, container, headingLevel = 1) {
    const titleElement = createEl(`h${headingLevel}`);
    titleElement.innerText = titleText;
    titleElement.style.fontSize = '12px';
    titleElement.style.color = 'rgb(148, 155, 153)';
    container.appendChild(titleElement);
}
function createUserProfile(userData, isUserOnline) {
    const profileContainer = createEl('div', { className: 'profile-container', id: userData.userId });
    if (isUserOnline) {
        profileContainer.classList.add('activeprofile');
    }

    const userNameDiv = createEl('span', { textContent: userData.nickname, className: "profileName" });
    userNameDiv.style.color = 'white';

    const profileImg = createEl('img', { className: 'profile-pic' });
    profileImg.width = '30px';
    profileImg.height = '30px';
    profileImg.style.pointerEvents = 'none';
    profileImg.dataset.user_id = userData.userId;

    const bubble = createBubble(isUserOnline);

    profileContainer.appendChild(profileImg);
    profileContainer.appendChild(userNameDiv);

    return { profileContainer, userNameDiv, profileImg, bubble };
}

function setUpEventListeners(profileImg, profileContainer, bubble, isUserOnline) {
    profileImg.addEventListener('mouseover', function () {
        this.style.borderRadius = '0px';
        bubble.style.opacity = 0;
    });
    profileImg.addEventListener('mouseout', function () {
        this.style.borderRadius = '25px';
        if (isUserOnline) bubble.style.opacity = 1;
    });

    profileContainer.addEventListener('mouseenter', function () {
        profileContainer.style.backgroundColor = 'rgb(53, 55, 60)';
    });
    profileContainer.addEventListener('mouseleave', function () {
        profileContainer.style.backgroundColor = 'initial';
    });
}

function renderUsers(users, tbody, isOnline) {
    const fragment = document.createDocumentFragment();

    for (const userData of users) {
        const isUserOnline = userData.IsOnline === true;
        if (isUserOnline === isOnline) {
            const { profileContainer, userNameDiv, profileImg, bubble } = createUserProfile(userData, isUserOnline);
            const guild = guildCache.getGuild(currentGuildId);
            if (isOnGuild && currentGuildId && guild.isOwner(userData.userId, currentGuildId)) {
                const crownEmoji = createEl('img', { src: crownEmojibase64, id: 'crown-symbol' });
                userNameDiv.appendChild(crownEmoji);
            }

            setUpEventListeners(profileImg, profileContainer, bubble, isUserOnline);

            appendToProfileContextList(userData, userData.userId);
            setProfilePic(profileImg, userData.userId);

            profileContainer.appendChild(bubble);
            fragment.appendChild(profileContainer);
        }
    }

    tbody.appendChild(fragment);
}



let isUpdatingUsers = false;


function updateMemberList(members, ignoreIsOnMe = false) {
    if (isOnMe && !ignoreIsOnMe) {
        console.log("Got users while on me page.");
        return;
    }
    if (isUpdatingUsers) {
        console.warn("Already updating members!");
        return;
    }
    console.log("Updating members with:", members);

    isUpdatingUsers = true;
    const { onlineUsers, offlineUsers } = categorizeMembers(members);
    

    userList.innerHTML = '';
    const tableWrapper = createEl('div', { className: 'user-table-wrapper' });
    const table = createEl('table', { className: 'user-table' });
    const tbody = createEl('tbody');

    if (onlineUsers.length > 0) {
        renderTitle(`ÇEVRİM İÇİ — ${onlineUsers.length}`, tbody);
        renderUsers(onlineUsers, tbody, true);
    }

    if (offlineUsers.length > 0) {
        renderTitle(`ÇEVRİM DIŞI — ${offlineUsers.length}`, tbody);
        renderUsers(offlineUsers, tbody, false);
    }

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    userList.appendChild(tableWrapper);

    isUpdatingUsers = false;
}
function categorizeMembers(members) {
    const onlineUsers = members.filter(member => member.Status === "online");
    const offlineUsers = members.filter(member => member.Status !== "online");
    return { onlineUsers, offlineUsers };
}




const crownEmojibase64 = `data:image/png;base64,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`;

function createBubble(isOnline,isProfileBubble) {
    const classn = isProfileBubble ? 'profile-bubble' : 'status-bubble';
    const bubble = createEl('span',{className:classn});
    if (isOnline) {
        bubble.style.backgroundColor = '#23a55a'; 
    } else {
        bubble.style.opacity = 0;
    }

    return bubble;
}

function toggleUsersList() {
    const userList = getId('user-list');
    const isUsersOpen = userList.style.display === 'flex';
    setUsersList(!isUsersOpen);
}
let isUsersOpen = true;

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
let isUsersOpenGlobal;
function setUsersList(isUsersOpen, isLoadingFromCookie = false) {
    const displayToSet = isUsersOpen ? 'flex' : 'none';
    const inputRightToSet = isUsersOpen ? '463px' : '76px';
    const userList = getId('user-list');
    userList.style.display = displayToSet;
    
    const userLine = document.querySelector('.horizontal-line');
    if (userLine) {
        userLine.style.display = displayToSet;
    }
    const addFriendInputButton = getId('addfriendinputbutton');
    if (addFriendInputButton) {
        addFriendInputButton.style.right = inputRightToSet;
    }
    if (!isLoadingFromCookie) {
        saveBooleanCookie('isUsersOpen', isUsersOpen);
    }
    isUsersOpenGlobal = isUsersOpen;
    updateChatWidth();
}

function UpdateDmFriendList(friend_id,friendNick,friendDiscriminator) {
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
    updateMemberList(usersData);
}
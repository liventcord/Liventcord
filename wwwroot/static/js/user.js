let currentUserId;
let currentDiscriminator = null;
let currentUserNick;

const deletedUser = 'Deleted User';
let lastTopSenderId = null;

let userNames = {};
userNames['1'] = {
    nick: 'Clyde',
    discriminator: '0000',
    is_blocked: false
};



function getUserNick(userId) { 
    if(userId && currentUserId && currentUserId == userId) {
        return currentUserNick;
    }
    return userId in userNames ? userNames[userId].nick : deletedUser;
}
function getUserDiscriminator(userId) { 
    return userId in userNames ? userNames[userId].discriminator : '0000';
}


function logOut() {

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
function getUserIdFromNick(nick) {
    for (const [userId, userInfo] of Object.entries(userNames)) {
        if (userInfo.nick === nick) {
            return userId;
        }
    }
    return null;
}
function getCurrentDmFriends() {
    return {
        currentUserId: { nick:  currentUserNick },
        currentDmId: { nick : getUserNick(currentDmId)}
    }
}



function isBlocked(userId) {
    if (!userNames.hasOwnProperty(userId)) {
        return false;
    }
    return userNames[userId].is_blocked;
}

function addUser(userId, nick, discriminator,isBlocked) {
    userNames[userId] = {
      nick: nick,
      discriminator: discriminator,
      is_blocked: Boolean(isBlocked)
    };
}
function refreshUserProfileImage(userId,userNick=null) {
    if (userId == currentUserId) {
        updateSelfProfile(userId,null,true,true);
    }
    // from user list
    const profilesList = userList.querySelectorAll('.profile-pic');
    profilesList.forEach(user => {
        if(userNick) {
            if (user.dataset.userId === userId) {
                user.parentNode.querySelector('.profileName').innerText = userNick;
            }
        }
        if(userId) {
            if (user.dataset.userId === userId) {
                user.src = `/profiles/${userId}.png`;
            }
        }
    });

    // from chat container 
    const usersList = chatContainer.querySelectorAll('.profile-pic');
    usersList.forEach(user => {
        if(userNick) {
            if (user.dataset.userId === userId) {
                user.parentNode.querySelector('.profileName').innerText = userNick;
            }
        }
        if(userId) {
            if (user.dataset.userId === userId) {
                user.src = `/profiles/${userId}.png`;
            }
        }
    });
}


function updateSettingsProfileColor() {
    const settingsProfileImg = getId('settings-self-profile');
    const rightBarTop = getId('settings-rightbartop');
    if(rightBarTop) {
        rightBarTop.style.backgroundColor = getAverageRGB(settingsProfileImg);
    }
}

function updateSelfProfile(userId, userName,is_timestamp=false,is_after_uploading=false) {
    if(!userId) { return; }
    const timestamp = new Date().getTime(); 
    let selfimagepath = is_timestamp ? `/profiles/${userId}.png?ts=${timestamp}` : `/profiles/${userId}.png`;
    const selfProfileImage = getId('self-profile-image');

    selfProfileImage.onerror = () => {
        if (selfProfileImage.src != defaultProfileImageUrl) {
            selfProfileImage.src = defaultProfileImageUrl;
        }
    }
    selfProfileImage.onload = () => {
        updateSettingsProfileColor();
    }
    selfProfileImage.src = selfimagepath;
    
    if(currentSettingsType == MyAccount) {
        const settingsSelfNameElement = getId('settings-self-name');
        const selfNameElement = getId('self-name');
        const settingsSelfProfile = getId('settings-self-profile');
        if(userName){
            settingsSelfNameElement.innerText = userName;
            selfNameElement.innerText = userName;
        }
        settingsSelfProfile.onerror = function() {
            if (settingsSelfProfile.src != defaultProfileImageUrl) {
                settingsSelfProfile.src = defaultProfileImageUrl;
            }
        };
        settingsSelfProfile.onload = function(event) {
            updateSettingsProfileColor();
            if(is_after_uploading) {
                const base64output = getBase64Image(settingsSelfProfile);
                if(base64output) {
                    console.log("Setting self profile as ", userId, userName)
                    lastConfirmedProfileImg = base64output;
                }
            }
        };
        settingsSelfProfile.src = selfimagepath;
        
    }
}

function updateUserOnlineStatus(userId, isOnline) {
    if (userId === currentUserId) return; 

    const guildMembers = guildCache.getMembers(currentGuildId);

    for (const guildId in guildMembers) {
        const users = guildMembers[guildId];
        
        const user = users.find(user => user.userId === userId);
        if (user) {
            user.is_online = isOnline;
            console.log(`User ${userId} online status updated to ${isOnline} in guild ${guildId}`);
            return;
        }
    }

    console.log(`User ${userId} not found in any guild`);
}

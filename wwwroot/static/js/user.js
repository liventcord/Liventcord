let currentUserId;
let currentDiscriminator = null;
let currentUserName;

const deletedUser = 'Deleted User';
let lastTopSenderId = null;

let userNames = {};
userNames['1'] = {
    nick: 'Clyde',
    discriminator: '0000',
    is_blocked: false
};



function getUserNick(user_id) { 
    if(user_id && currentUserId && currentUserId == user_id) {
        return currentUserName;
    }
    return user_id in userNames ? userNames[user_id].nick : deletedUser;
}
function getUserDiscriminator(user_id) { 
    return user_id in userNames ? userNames[user_id].discriminator : '0000';
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
        currentUserId: { nick:  currentUserName },
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
function refreshUserProfileImage(user_id,user_nick=null) {
    if (user_id == currentUserId) {
        updateSelfProfile(user_id,null,true,true);
    }
    // from user list
    const profilesList = userList.querySelectorAll('.profile-pic');
    profilesList.forEach(user => {
        if(user_nick) {
            if (user.dataset.user_id === user_id) {
                user.parentNode.querySelector('.profileName').innerText = user_nick;
            }
        }
        if(user_id) {
            if (user.dataset.user_id === user_id) {
                user.src = `/profiles/${user_id}.png`;
            }
        }
    });

    // from chat container 
    const usersList = chatContainer.querySelectorAll('.profile-pic');
    usersList.forEach(user => {
        if(user_nick) {
            if (user.dataset.user_id === user_id) {
                user.parentNode.querySelector('.profileName').innerText = user_nick;
            }
        }
        if(user_id) {
            if (user.dataset.user_id === user_id) {
                user.src = `/profiles/${user_id}.png`;
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
        
        const user = users.find(user => user.user_id === userId);
        if (user) {
            user.is_online = isOnline;
            console.log(`User ${userId} online status updated to ${isOnline} in guild ${guildId}`);
            return;
        }
    }

    console.log(`User ${userId} not found in any guild`);
}

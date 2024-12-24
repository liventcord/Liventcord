//TODO: make self discriminator be status as default and show discriminator when hovered
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
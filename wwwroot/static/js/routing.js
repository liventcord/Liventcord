const ID_LENGTH = 18


function changePageToMe() {
    window.location.href = "/channels/@me";
}
function changePageToGuild() {
    window.location.href = "/";
}
function isIdDefined(id) {
    return typeof id !== 'undefined' && id !== null && id.length == ID_LENGTH;
}
function validateRoute() {
    if(!isIdDefined(passed_guild_id) | !isIdDefined(passed_channel_id) | !isIdDefined(passed_owner_id)) {
        window.history.pushState(null, null, "/channels/@me");
        return false;
    }

    if (isOnMe && !isPathnameCorrect(window.location.pathname)) {
        window.history.pushState(null, null, "/channels/@me");
        return false;
    }
    if (isOnGuild && cacheInterface.doesGuildExist(passed_guild_id)) {
        window.history.pushState(null, null, "/channels/@me");
        return false;
    }

    return true;
}

document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        if(isUnread)
        setActiveIcon();
    } else {
        setInactiveIcon();
    }
});
window.addEventListener('popstate', function(event) {
    try {
        const pathStr = window.location.pathname;
        if (pathStr === '/channels/@me') {
            loadDmHome(false);
        } else if (pathStr.startsWith('/channels/@me/')) {
            const parts = pathStr.split('/');
            const friendId = parts[3];
            OpenDm(friendId);
        } else if (pathStr.startsWith('/channels/') && pathStr.split('/').length === 4) {
            
            const parts = pathStr.split('/');
            const guildID = parts[2];
            const channelId = parts[3];
            loadGuild(guildID, channelId,  null, false);
        } else {
            console.error('Unknown URL format:', pathStr);
        }
        
    } catch (error) {
        console.error(error);
    }
});
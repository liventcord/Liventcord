function changePageToMe() {
    window.location.href = "/channels/@me";
}
function changePageToGuild() {
    window.location.href = "/";
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
            loadMainMenu(false);
        } else if (pathStr.startsWith('/channels/@me/')) {
            const parts = pathStr.split('/');
            const friendId = parts[3];
            OpenDm(friendId);
        } else if (pathStr.startsWith('/channels/') && pathStr.split('/').length === 4) {
            
            const parts = pathStr.split('/');
            const guildID = parts[2];
            const channelId = parts[3];
            loadGuild(guildID, channelId, null, null, false);
        } else {
            console.error('Unknown URL format:', pathStr);
        }
        
    } catch (error) {
        console.error(error);
    }
});
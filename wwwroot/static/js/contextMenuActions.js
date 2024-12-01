function openReactionMenu(messageId) {
    console.log("Opening react menu for: ",messageId);
}
function openEditMessage(messageId) {
    console.log("Editing message ",messageId);
}
function pinMessage(messageId) {
    console.log("Pinning message ",messageId);
}

function markAsUnread(messageId) {
    console.log("Marking as unread message ",messageId);
}
function deleteMessage(messageId) {
    console.log("Deleting message ",messageId);
    let data = {
        'isDm' : isOnDm,
        'messageId' : messageId,
        'channelId' : isOnGuild ? currentChannelId : currentDmId
    }
    if(isOnGuild) {
        data['guildId'] = currentGuildId;
    }
    socket.emit('message_delete',data);
}
function inviteToGuild(user_id) {
    console.log(user_id);
}
function blockUser(user_id) {
    console.log(user_id);
}
function reportUser(user_id) {
    console.log(user_id);
}



function mentionUser(user_id) {
    const usernick = getUserNick(user_id);
    userInput.value += `@${usernick}`; 
}



function inviteUser(user_id,guildId) {
    if(!user_id || !guildId) { return; }
    console.log("inviting user : ", user_id , ' to guild ' , guildId);
    OpenDm(user_id);
    
}


function removeFriend(user_id) {
    socket.emit('friend_request_event', 'remove_friend', { 'friend_id': user_id });
}

const MessagesActionType = {
    ADD_REACTION: "Tepki Ekle",
    EDIT_MESSAGE: "Mesajı Düzenle",
    PIN_MESSAGE: "Mesajı Sabitle",
    REPLY: "Yanıtla",
    MARK_AS_UNREAD: "Okunmadı olarak işaretle",
    DELETE_MESSAGE: "Mesajı Sil",
}

function copyChannelLink(guildId,channelId) {
    const content = constructAbsoluteAppPage(guildId,channelId);
    navigator.clipboard.writeText(content)
}
function copyId(channelId) {
    navigator.clipboard.writeText(channelId);
}

function muteChannel(channelId) {
    alertUser("Mute channel is not implemented!");

}
function showNotifyMenu(channelId) {
    alertUser("Notify menu is not implemented!");
}
function editChannel(channelId) {
    alertUser("Channel editing is not implemented!");
    
}
function deleteChannel(channelId,guildId) {
    const data = {
        'guildId' : guildId,
        'channelId' : channelId
    }
    socket.emit('remove_channel',data);
    
}

function togglePin() {
    console.log("Toggle pin!");
}
function appendToChannelContextList(channelId) {
    contextList[channelId] = createChannelsContext(channelId);
}

function appendToMessageContextList(messageId,user_id) {
    messageContextList[messageId] = createMessageContext(messageId,user_id);
}
function appendToProfileContextList(userData,user_id) {
    if(user_id && userData) {
        contextList[user_id] = createProfileContext(userData,user_id);
    }
}


socket.on('update_guilds',data => {
    updateGuildList(data);
});

function getLastSecondMessageDate() {
    const messages = chatContent.children;
    if (messages.length < 2) return  '';

    const secondToLastMessage = messages[messages.length - 2];
    if (secondToLastMessage) {
        const dateGathered = secondToLastMessage.getAttribute('data-date');
        if(dateGathered) {
            const parsedDate = new Date(dateGathered);
            const formattedDate = formatDate(parsedDate);
            return formattedDate;
        }
    }
    return '';
}

socket.on('deletion_message', data=> {
    deleteLocalMessage(data.messageId,data.guildId,data.channelId,data.isDm);
    guildCache.removeMessage(data.messageId,data.channelId,data.guildId);
    const msgdate = messages_raw_cache[data.messageId].date;
    if(lastMessageDate == new Date(msgdate).setHours(0, 0, 0, 0)) {
        lastMessageDate = new Date(getLastSecondMessageDate()).setHours(0, 0, 0, 0)
        
    }
    if(bottomestChatDateStr  == msgdate) {
        bottomestChatDateStr = getLastSecondMessageDate();
    }
    delete messages_raw_cache[data.messageId];
});

socket.on('join_guild_response',data=> {
    if(!data.success) {
        const errormsg = "DAVET BAĞLANTISI - Davet geçersiz ya da geçerliliğini yitirmiş.";
        getId('create-guild-title').textContent = errormsg;
        getId('create-guild-title').style.color = 'red';
        return;
    }
    if(!permissionManager.permissionsMap[data.guildId]) { permissionManager.permissionsMap[data.guildId] = [] };
    
    
    permissionManager.permissionsMap[data.guildId] = data.permissionsMap;
    loadGuild(data.joined_guildId,data.joined_channelId,data.joined_guild_name,data.joined_owner_id);

    if(closeCurrentJoinPop) {
        closeCurrentJoinPop();
    }
});



socket.on('message_readen', data => {
    if(data) {
        console.log(data);
        Object.keys(data).forEach(key => {
            
        })
    }
});
socket.on('deleted_guild', data => {
    if(typeof(data) == 'object') {
        if(data.success) {
            closeSettings();
            removeFromGuildList(data.guildId);
            loadMainMenu();
        } else {
            alertUser('Sunucu silme başarısız.');
        }
        
    } else {
        alertUser('Sunucu silme hatası',data);
    }
});
socket.on('get_invites', data => {
    if (data && data.invite_ids) {
        guildCache.addInvites(guildId,data.invite_ids);
    } else {
        console.warn("Invite ids do not exist. ",data);
    }
});

socket.on('update_guild_name',data => {
    if(data.guildId == currentGuildId) {
        getId('guild-name').innerText = currentGuildName;
    }
})
socket.on('update_guild_image',data => {
    updateGuild(data)
    
})
socket.on('old_messages_response', function(data) {
    handleOldMessagesResponse(data);
});




socket.on('update_user_profile', data => {
    refreshUserProfileImage(data.userId);
});




socket.on('create_channel_response', data => {
    if(data.success == undefined || data.success == true) return;
    alertUser(`${currentGuildName} sunucusunda kanal yönetme iznin yok!`);
});



socket.on('bulk_reply_response', data => {
    const replies = data.bulk_replies;
    replies.forEach(reply => {
        const { messageId, userId, content, attachment_urls } = reply;
        if (!replyCache[messageId]) {
            replyCache[messageId] = {
                messageId: messageId,
                replies: []
            };
        }
        replyCache[messageId].replies.push({ userId, content, attachment_urls });
    });
    setTimeout(() => {
        handleReplies();
    }, 100);
});




socket.on('get_channels', data => {
    const guildCache = new GuildCache(); 
    const guildId = data.guildId;
    if (data && data.channels && guildId) {
        cacheInterface.addChannel(guildId, data.channels);
        updateChannels(data.channels); 
    }
});


socket.on('channel_update', data => {
    if (!data) return;
    // TODO edit this to use post put delete
    const updateType = data.type;
    const removeType = 'remove';
    const editType = 'edit';
    const createType = 'create';

    if(updateType == createType) {
        const channel = {
            guildId : data.guildId,
            channelId: data.channelId,
            channel_name: data.channel_name,
            is_text_channel: data.is_text_channel
        };
        
        
        addChannel(channel);
    }
    else if (updateType === removeType) {
        removeChannel(data);
    } else if (updateType === editType) {
        editChannel(data);
    }
});

socket.on('get_members', data => {
    const members = data.members;
    const guildId = data.guildId;
    if (!data || !members || !guildId) { 
        console.error("Malformed members data: ",data);
        return; 
    }
    
    cacheInterface.updateMembers(guildId,members);
    updateMemberList(members);   
    
});


socket.on('user_status', (data) => {
    const userId = data.userId;
    const is_online = data.is_online;
    updateUserOnlineStatus(userId, is_online)
});

socket.on('message', (data) => {
    try {
        const { isDm, messageId, userId, content, channelId, date, attachment_urls, reply_to_id,is_bot, guildId, last_edited, reaction_emojis_ids} = data;
        const idToCompare = isDm ? currentDmId : currentChannelId;
        
        if (data.guildId != currentGuildId || idToCompare != channelId) {
            console.log(`${idToCompare} is not ${channelId} so returning`);
            if (userId !== currentUserId) {
                playNotification();
                setActiveIcon();
            }
            return;
        }

        displayChatMessage(data);

        fetchReplies(data);

    } catch (error) {
        console.error('Error processing message:', error);
    }
});

socket.on('message_date_response', (data)=> {
    const message_date = data.message_date;
    messageDates[data.messageId] = message_date;
    console.log(currentLastDate,message_date)
    if(currentLastDate && currentLastDate > message_date) {
        GetOldMessages(message_date,data.messageId);
    } else {
        console.log("Is less than!", currentLastDate, message_date)
    }
});



socket.on('get_history', (data) => {
    handleHistoryResponse(data);  
});


socket.on('update_nick',data => {
    const userid = data.userId;
    const newNickname = data.userName;
    if(userid == currentUserId) {
        
        const settingsNameText = getId('settings-self-name');
        const setInfoNick = getId('set-info-nick');
        const selfName = getId('self-name');
        
        selfName.innerText = newNickname;
        if(setInfoNick) {
            setInfoNick.innerText = newNickname;
        }
        if(settingsNameText) {
            settingsNameText.innerText = newNickname;
        }
        currentUserNick = newNickname;
        return;
    }
    
    refreshUserProfileImage(null,newNickname);
});



socket.on('users_data_response', data => {
    updateFriendsList(data.users,data.isPending);  
});

//friend
socket.on('add_friend', function (message) {
    handleFriendEventResponse(message);
});

socket.on('accept_friend_request', function (message) {
    handleFriendEventResponse(message);
});

socket.on('remove_friend', function (message) {
    handleFriendEventResponse(message);
});

socket.on('deny_friend_request', function (message) {
    handleFriendEventResponse(message);
});


//audio

socket.on('voice_users_response',function(data) {
    const channelId = data.channelId;
    playAudio('/static/sounds/joinvoice.mp3');
    clearVoiceChannel(currentVoiceChannelId);
    const sp = getId('sound-panel');
    sp.style.display = 'flex';
    currentVoiceChannelId = channelId;
    if(isOnGuild) {
        currentVoiceChannelGuild = data.guildId;
    }
    const soundInfoIcon = getId('sound-info-icon');
    soundInfoIcon.innerText = `${currentChannelName} / ${currentGuildName}`;
    if (!usersInVoice[channelId]) {
        usersInVoice[channelId] = [];
    }
    const buttonContainer = channelsUl.querySelector(`li[id="${currentVoiceChannelId}"]`);
    const channelSpan = buttonContainer.querySelector('.channelSpan');
    channelSpan.style.marginRight = '30px';
    if(!usersInVoice[channelId].includes(currentUserId)) {
        usersInVoice[channelId].push(currentUserId);
    }
    usersInVoice[channelId] = data.usersList;
});
socket.on('incoming_audio', async data => {

    if (data && data.byteLength > 0) {
        try {
            const arrayBuffer = convertToArrayBuffer(data);
            const decodedData = await decodeAudioDataAsync(arrayBuffer);
            if (decodedData) {
                playAudioBuffer(decodedData);
            } else {
                console.log('Decoded audio data is empty or invalid');
            }
        } catch (error) {
            console.log('Error decoding audio data:');

        }
    } else {
        console.log('Received silent or invalid audio data');
    }
});
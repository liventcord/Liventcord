let channelList;
let channelsUl;

let channelTitle;

let currentChannels;
let currentChannelName = null;
let currentVoiceChannelId;
let currentChannelId;


function getChannels() {
    if (currentChannelId) {
        const channels = guildCache.getChannels(currentGuildId);
        if (channels.length > 0) {
            updateChannels(channels);
        } else {
            socket.emit('get_channels', { 'guildId': currentGuildId }); 
        }
    } else {
        console.warn("Current channel id is null!");
    }
}

async function changeChannel(newChannel) {
    console.log("channel changed: ",newChannel);
    if(isOnMe || isOnDm) { return; }
    const channelId = newChannel.ChannelId;
    const isTextChannel = newChannel.IsTextChannel;
    const url = constructAppPage(currentGuildId,channelId);
    if(url != window.location.pathname && isTextChannel) {
        window.history.pushState(null, null, url);
    }
    const newChannelName = newChannel.ChannelName;
    isReachedChannelEnd = false;
    
    if(isTextChannel) {
        currentChannelId = channelId;
        currentChannelName = newChannelName;
        chatInput.placeholder = '#' + truncateString(newChannelName,30) + ' kanalına mesaj gönder';
        channelTitle.textContent = newChannelName;
        lastSenderID = '';
        chatContent.innerHTML = '';
        currentLastDate = '';
        GetHistoryFromOneChannel(currentChannelId);
        closeReplyMenu();
    } else {
        joinVoiceChannel(channelId);
    }

    if(!currentChannels) { return; }

    currentChannels.forEach((channel, index) => {
        const channelButton = channelsUl.querySelector(`li[id="${channel.ChannelId}"]`);
        if(channelButton) {
            if(channel.ChannelId != channelId) {
                mouseHoverChannelButton(channelButton,channel.IsTextChannel,channel.ChannelId);
                mouseLeaveChannelButton(channelButton,channel.IsTextChannel,channel.ChannelId);
            } else if(!isTextChannel) {
                const usersInChannel = usersInVoice[channelId];
                if(usersInChannel) {

                    let allUsersContainer = channelButton.querySelector('.channel-users-container');
                    if(!allUsersContainer) {
                        allUsersContainer = createEl('div',{className:'channel-users-container'});
                    }
                    channelButton.style.width = '100%';
                    usersInChannel.forEach((user_id,index) => {
                        drawVoiceChannelUser(index,user_id,channelId,channelButton,allUsersContainer,isTextChannel);
                    });
                }
            }
        }
    });
}


//channels
function isChannelMatching(channelId,isTextChannel) {
    if(isTextChannel) {
        return currentChannelId == channelId;
    } else {
        return currentVoiceChannelId == channelId;
    }
}

function mouseHoverChannelButton(channelButton,isTextChannel,channelId) {
    if(!channelButton) { return; }
    const contentWrapper = channelButton.querySelector('.content-wrapper');


    contentWrapper.style.display = 'flex';
    if(isTextChannel) {
        channelButton.style.backgroundColor = isChannelMatching(channelId,isTextChannel) ? selectedChanColor : hoveredChanColor;
    } else {
        channelButton.style.backgroundColor = hoveredChanColor;
    }
    channelButton.style.color = 'white';
}
function hashChildElements(channelButton) {
    return channelButton.querySelector('.channel-users-container') != null;
}
function mouseLeaveChannelButton(channelButton,isTextChannel,channelId) {
    if(!channelButton) { return; }
    const contentWrapper = channelButton.querySelector('.content-wrapper');
    const channelSpan = channelButton.querySelector('.channelSpan');



    if(channelSpan && !isTextChannel) {
        channelSpan.style.marginRight = hashChildElements(channelButton) ? '30px' : '0px';
    }
    if(contentWrapper) {
        if(!isTextChannel) {
            if(currentVoiceChannelId == channelId) {
                contentWrapper.style.display = 'flex';
            } else {
                contentWrapper.style.display = 'none';
            }
            
        }  else  if (currentChannelId != channelId){
            contentWrapper.style.display = 'none';
            
        }
    }
    if(isTextChannel) {
        channelButton.style.backgroundColor = isChannelMatching(channelId,isTextChannel) ? selectedChanColor : 'transparent';
    } else {
        channelButton.style.backgroundColor = 'transparent';
        
    }
    channelButton.style.color = isChannelMatching(channelId,isTextChannel) ? 'white' : 'rgb(148, 155, 164)';
}
function handleKeydown(event) {
    if (isKeyDown || isOnMe) return;
    currentChannels.forEach((channel, index) => {
        let hotkey = index < 9 ? (index + 1).toString() : (index === 9 ? '0' : null);
        if (hotkey && event.key === hotkey && event.altKey) {
            changeChannel(channel);
        }
    });
    if (event.altKey) { 
        if (event.key === "ArrowUp") {
            moveChannel(-1);
        } else if (event.key === "ArrowDown") {
            moveChannel(1);
        }
    }
    isKeyDown = true;
}
function editChannelElement(channelId, new_channel_name) {
    const existingChannelButton = channelsUl.querySelector(`li[id="${channelId}"]`);
    if (!existingChannelButton) { return; }
    existingChannelButton.querySelector('channelSpan').textContent = new_channel_name;
}
function removeChannelElement(channelId) {
    const existingChannelButton = channelsUl.querySelector(`li[id="${channelId}"]`);
    if (!existingChannelButton) { return; }
    existingChannelButton.remove();
}
function createChannelElement(channel) {
    const channelId = channel.ChannelId;
    const channel_name = channel.ChannelName;
    const isTextChannel = channel.IsTextChannel;
    const last_read_datetime = channel.LastReadDatetime;
    console.log(channelId,channel_name,isTextChannel);
    const existingChannelButton = channelsUl.querySelector(`li[id="${channelId}"]`);
    if (existingChannelButton) { return; }
    const htmlToSet = isTextChannel ? textChanHtml : voiceChanHtml;
    const channelButton = createEl('li', { className: 'channel-button', id: channelId });
    channelButton.style.marginLeft = '-80px';

    const contentWrapper = createEl('div', { className: 'content-wrapper'});
    contentWrapper.style.display = 'none';
    const hashtagSpan = createEl('span', { innerHTML: htmlToSet, marginLeft: '50px' });
    hashtagSpan.style.color = 'rgb(128, 132, 142)';
    const channelSpan = createEl('span', { className: 'channelSpan', textContent: channel_name, });
    channelSpan.style.marginRight = '30px';
    channelSpan.style.width = '100%';
    channelButton.style.width = '70%';
    contentWrapper.style.marginRight = '100px';
    contentWrapper.style.marginTop = '4px';
    const settingsSpan = createEl('span', { innerHTML: settingsHtml });
    settingsSpan.addEventListener('click', () => {
        console.log("Click to settings on:", channel_name);
    })
    if(permissionManager.canInvite()) {
        const inviteSpan = createEl('span', { innerHTML: inviteHtml });
        inviteSpan.addEventListener('click', () => {
            console.log("Click to invite on:", channel_name);
        })
        contentWrapper.appendChild(inviteSpan);
    }
    contentWrapper.appendChild(settingsSpan);
    channelButton.appendChild(hashtagSpan);
    channelButton.appendChild(channelSpan);
    channelButton.appendChild(contentWrapper);
    appendToChannelContextList(channelId);
    channelsUl.appendChild(channelButton);

    channelButton.addEventListener('mouseover', function(event) {
        if(event.target.id == channelId) {
            mouseHoverChannelButton(channelButton, isTextChannel,channelId);
        }
    });
    channelButton.addEventListener('mouseleave', function(event) {
        if(event.target.id == channelId) {
            mouseLeaveChannelButton(channelButton, isTextChannel,channelId);
        }
    });
    mouseLeaveChannelButton(channelButton, isTextChannel,channelId);
    channelButton.addEventListener('click', function() {
        changeChannel(channel);
    });

    if (channelId == currentChannelId) {
        setTimeout(() => {
            changeChannel(channel);
        }, 50);
    }


}
function resetKeydown() {
    isKeyDown = false;
}


function updateChannels(channels) {
    console.log("updating channels with:",channels)
    if (channels == null || !Array.isArray(channels)) { 
        console.log("Invalid channels format");
        return; 
    }

    channelsUl.innerHTML = "";
    if (!isOnMe) {
        disableElement('dm-container-parent');
    }
    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('keyup', resetKeydown);

    channels.forEach(channel => {
        const channelId = channel.ChannelId;
        const channelName = channel.ChannelName;
        const isTextChannel = channel.IsTextChannel;
        const lastReadDatetime = channel.LastReadDatetime;

        const channelObj = {
            ChannelId: channelId,
            ChannelName: channelName,
            IsTextChannel: isTextChannel,
            LastReadDatetime: lastReadDatetime
        };

        createChannelElement(channelObj);
    });

    currentChannels = channels;

    if (currentChannels.length > 1) {
        document.addEventListener('keydown', handleKeydown);
        document.addEventListener('keyup', resetKeydown);
    }
}
let isKeyDown = false;
let currentChannelIndex = 0;
function moveChannel(direction) {
    let newIndex = currentChannelIndex + direction;
    if (newIndex < 0) {
        newIndex = currentChannels.length - 1;
    }
    else if (newIndex >= currentChannels.length) {
        newIndex = 0;
    }
    changeChannel(currentChannels[newIndex]);
    currentChannelIndex = newIndex; 
}


function addChannel(channel) {
    console.log(typeof(channel), channel);
    currentChannels.push(channel);

    guildCache.channels.addChannel(channel.guild_id, channel);

    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('keyup', resetKeydown);
    createChannelElement(channel);
    if (currentChannels.length > 1) {
        document.addEventListener('keydown', handleKeydown);
        document.addEventListener('keyup', resetKeydown);
    }
}

function removeChannel(data) {
    guildCache.removeChannel(data.guild_id, data.ChannelId);

    const channelsArray = guildCache.channels.getChannels(data.guild_id);
    currentChannels = channelsArray;
    removeChannelElement(data.ChannelId);
    if(currentChannelId == data.ChannelId) {
        const firstChannel = channelsArray[0].ChannelId;
        loadGuild(currentGuildId, firstChannel);
    }
}

function editChannel(data) {
    guildCache.editChannel(data.guild_id, data.ChannelId, { ChannelName: data.ChannelName });

    const channelsArray = guildCache.channels.getChannels(data.guild_id);
    currentChannels = channelsArray;
}


// voice


function drawVoiceChannelUser(index,user_id,channelId,channelButton,allUsersContainer,isTextChannel) {
    
    const userName = getUserNick(user_id);
    const userContainer = createEl('li', { className: 'channel-button',id : user_id });
    userContainer.addEventListener('mouseover', function(event) {
        //mouseHoverChannelButton(userContainer, isTextChannel,channelId);
    });
    userContainer.addEventListener('mouseleave', function(event) {
        //mouseLeaveChannelButton(userContainer, isTextChannel,channelId);
    });


    createUserContext(user_id);
    
    userContainer.id = `user-${user_id}`;
    const userElement = createEl('img', { style: 'width: 25px; height: 25px; border-radius: 50px; position:fixed; margin-right: 170px;' });
    setProfilePic(userElement,user_id);
    userContainer.appendChild(userElement);
    userContainer.style.marginTop = index == 0 ? '30px' : '10px';
    userContainer.style.marginLeft = '-220px'; 
    userContainer.style.width = '90%';
    userContainer.style.justifyContent = 'center';
    userContainer.style.alignItems = 'center';

    const contentWrapper = createEl('div', { className: 'content-wrapper' });
    const userSpan = createEl('span', { className: 'channelSpan', textContent: userName ,style:'position: fixed;'});
    userSpan.style.color = 'rgb(128, 132, 142)';
    userSpan.style.border = 'none';
    userSpan.style.width = 'auto';

    const muteSpan = createEl('span', { innerHTML: muteHtml });
    const inviteVoiceSpan = createEl('span', { innerHTML: inviteVoiceHtml });
    contentWrapper.appendChild(muteSpan);
    contentWrapper.appendChild(inviteVoiceSpan);
    contentWrapper.style.marginRight = '-115px';
    userContainer.appendChild(userSpan);
    userContainer.appendChild(contentWrapper);
    allUsersContainer.appendChild(userContainer)
    channelButton.appendChild(allUsersContainer);
}



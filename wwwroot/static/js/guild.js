let currentGuildId;
let currentDmId;
let currentGuildName = '';



function getGuildName(guildId) {
    const guild = currentGuildData[guildId];
    return guild ? guild.name : 'Unknown Guild';
}

function getManageableGuilds() {
    if(!permissionsMap) { return [] }
    const guildsWeAreAdminOn = [];
    let isFoundAny = false;
    for (const key in permissionsMap) {
        if (permissionsMap[key].isAdmin) {
            guildsWeAreAdminOn.push(key);
            isFoundAny = true;
        }
    }
    return isFoundAny ? guildsWeAreAdminOn : null;
}




function updateGuildList(guildData) {
    if (!guildData) {
        console.warn("Tried to update guild list without data.");
        return;
    }

    currentGuildData = guildData;
    guildsList.innerHTML = "";

    const mainLogoImg = createEl('img', {
        id: 'main-logo',
        src: '/static/images/icons/icon.png',
        'data-src': '/static/images/icons/icon.png',
        style: 'width: 30px; height: 30px; border: 10px solid rgb(49, 51, 56); user-select: none;'
    });
    mainLogoImg.addEventListener('mousedown', () => {
        mainLogoImg.style.transform = 'translateY(50px)';
    });
    mainLogoImg.addEventListener('mouseup', mainLogoImg.addEventListener.bind(mainLogoImg, 'mouseleave', () => {
        mainLogoImg.style.transform = 'translateY(0)';
    }));
    mainLogoImg.addEventListener('click', clickMainLogo);

    const mainLogo = createEl('li');
    mainLogo.appendChild(mainLogoImg);
    guildsList.appendChild(mainLogo);

    guildData.guilds.forEach((guild) => {
        if (getId(guild.GuildId)) return;
        const guildName = guild.guildName;
        const ownerId = guild.ownerId;
        const guildId = guild.guildId;
        const rootChannel = guild.rootChannel;
        
        const imgSrc = guild.IsGuildUploadedImg ? `/guilds/${guildId}` : createBlackImage();
        
        cacheInterface.setGuildOwner(guildId, ownerId)
        const li = createEl('li');
        const img = createEl('img', { className: 'guilds-list', id: guildId, src: imgSrc });
        img.addEventListener('click', () => {
            loadGuild(guildId, rootChannel, guildName);
        });
        
        li.appendChild(img);
        li.appendChild(createEl('div', { className: 'white-rod' }));
        guildsList.appendChild(li);
        guildNames[guildId] = guildName;
    });
    
    addKeybinds();
}

function appendToGuildList(guild) {
    const guildsList = getId('guilds-list');
    if (guildsList.querySelector(`#${guild.id}`)) return;

    const li = createEl('li');
    const img = createEl('img', { className: 'guilds-list', id: guild.id, src: guild.src });
    img.addEventListener('click', () => {
        loadGuild(guild.id, guild.rootChannel, guild.name);
    });
    
    li.appendChild(img);
    li.appendChild(createEl('div', { className: 'white-rod' }));
    guildsList.appendChild(li);
    guildNames[guild.id] = guild.name;
    addKeybinds();
}

function removeFromGuildList(guildId) {
    const guildImg = getId(guildId);
    if (guildImg) {
        const parentLi = guildImg.closest('li');
        if (parentLi) parentLi.remove();
    }
}

function updateGuild(uploadedGuildId) {
    const guildList = getId('guilds-list').querySelectorAll('img');
    guildList.forEach((img) => {
        if (img.id === uploadedGuildId) {
            img.src = !uploadedGuildId ? createBlackImage() : `/guilds/${uploadedGuildId}`;
        }
    });

}


function createGuild() {
    const guildName = getId('guild-name-input').value;
    const guildPhotoFile = getId('guildImageInput').files[0];

    if (guildPhotoFile) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/gif', 'image/png', 'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml'];
        if (!allowedTypes.includes(guildPhotoFile.type)) {
            alertUser('Yalnızca resim dosyaları yükleyebilirsiniz (JPG, PNG veya GIF)!');
            getId('guildImageInput').value = '';
            getId('guildImg').style.backgroundImage = '';
            return; 
        }

        if (guildPhotoFile.size > 8 * 1024 * 1024) {
            alertUser('Dosya boyutu 8 MB\'den küçük olmalıdır!');
            getId('guildImageInput').value = '';
            getId('guildImg').style.backgroundImage = '';
            return; 
        }
    }

    let formData = new FormData();
    if (guildPhotoFile) {
        formData.append('Photo', guildPhotoFile);
    }
    formData.append('GuildName', guildName);

    fetch('/api/guilds', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
        return response.text();
    }).then(data => {
        console.log('Guild creation response:', data);
        if (typeof(data) === 'object') {
            const popup = getId('guild-pop-up');
            if (popup) {
                popup.parentNode.remove();
            }
            changeUrlWithFireWorks(data.guildId, data.rootChannel, data.guildName);
        } else {
            alertUser('Sunucu oluşturma hatası', data);
        }
    }).catch(error => {
        console.error('Error:', error);
    });
}

function selectGuildList(guildId) {
    const guildList = getId('guilds-list'); 
    if (!guildList) return; 
    
    const foundGuilds = guildList.querySelectorAll('img');
    
    foundGuilds.forEach(guild => {
        if (guild.id === guildId) {
            guild.parentNode.classList.add('selected-guild');
        } else {
            guild.parentNode.classList.remove('selected-guild');
        }
    });
}

function loadGuild(guildId,channelId,guildName,guildOwnerId,isChangingUrl=true) {
    if(!guildId || !channelId ) {
        console.error("Load guild called with null values: ", guildId,channelId)
        return; 
    }
    console.log("Loading guild: ",guildId,channelId,guildName);
    
    if (isChangingUrl) {
        const state = constructAppPage(guildId,channelId);
        if(window.location.pathname != state) {
            window.history.pushState(null, null, state);
        }
    } else { 
        console.warn("calling from popstate");
    }
    if(isChangingPage) {
        console.warn(" Already changing guild! can not change guild");
        return;
    }
    currentGuildId = guildId;
    permissionManager = new PermissionManager(permissionsMap, currentGuildId);
    selectGuildList(guildId);
    if(guildName) {
        currentGuildName = guildName;
    } else {
        if(guildNames[guildId]) {
            currentGuildName = guildNames[guildId];
        }
    }

    currentChannelId = channelId;
    if(!isChangingUrl) {
        wasNotChangingUrl = true;
    }
    
    if(isOnMe) {
        loadApp();
    } else if (isOnDm) {
        loadApp();
    } else if (isOnGuild){
        changecurrentGuild();
    } 
    
}


function joinVoiceChannel(channelId) {
    if(currentVoiceChannelId == channelId) { return; }
    const data = { 'guildId' : currentGuildId, 'channelId' : channelId }
    socket.emit('join_voice_channel',data);
    return;
}


function refreshInviteId() {
    if(!guildCache.isInvitesEmpty(currentGuildId)) { return; }
    socket.emit('get_invites',{'guildId' : currentGuildId});
}


function addGuild(guildId, guildName, ownerId) {
    const data = {
        "GuildId": guildId,
        "GuildName": guildName,
        "OwnerId": ownerId
    };
    currentGuildData[guildId] = data;
}

function fetchMembers() {
    if(!currentGuildId) {
        console.warn("Current guild id is null! cant fetch members");
        return
    }
    const members = cacheInterface.getMembers(currentGuildId);

    if(members.length > 0) {
        console.log("Using cached members...");
        updateMemberList(members);

    } else {
        console.log("Fetching members...");
        socket.emit('get_members',{'guildId' : currentGuildId});

    }

}


function getGuildUsers() {
    if (!cacheInterface.isMembersEmpty(currentGuildId) || !currentGuildId) { return; }
    
    const guildMembers = cacheInterface.getMembers(currentGuildId);
    if (!guildMembers) { return; }

    let usersToReturn = [];

    for (const userId in guildMembers) {
        const user = guildMembers[userId];
        usersToReturn.push({
            name: user.Nickname,
            image: getProfileUrl(user.userId) 
        });
    }
    console.log(usersToReturn)
    console.log(guildMembers);

    return usersToReturn; 
}


function joinToGuild(inviteId) {
    socket.emit('join_to_guild',{'invite_id':inviteId});
}

function leaveCurrentGuild() {
    socket.emit('leave_from_guild',currentGuildId);
}

function startGuildJoinCreate() {
    showGuildPop('Sunucunu Oluştur','Sunucun, arkadaşlarınla takıldığınız yerdir. Kendi sunucunu oluştur ve konuşmaya başla.');
}


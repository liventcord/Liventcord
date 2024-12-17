
function getGuildSettingsHTML() {
    const guildSettingsHtml = generateSettingsHtml(getGuildSettings(),isGuild=true);
    return guildSettingsHtml;
    
}
function getSettingsHtml() {
    const userSettingsHtml = generateSettingsHtml(userSettings);
    return userSettingsHtml;
    
}
function getActivityPresenceHtml() {
    return `
        <h3 id="activity-title">Etkinlik Gizliliği</h3>
        <h3 id="settings-description">ETKİNLİK DURUMU</h3>
        <div class="toggle-card">
            <label for="activity-toggle">Tespit edilen etkinliği diğerleriyle paylaş</label>
            <label for="activity-toggle">Herkese açık bir Sahne'ye katıldığında LiventCord bu durumunu otomatik olarak günceller.</label>
            <div id="activity-toggle" class="toggle-box">
                <div id="toggle-switch" class="toggle-switch">
                    <div class="enabled-toggle">
                        <svg viewBox="0 0 28 20" preserveAspectRatio="xMinYMid meet" aria-hidden="true" class="icon">
                        <rect fill="white" x="4" y="0" height="20" width="20" rx="10"></rect>
                        <svg viewBox="0 0 20 20" fill="none">
                        <path fill="rgba(35, 165, 90, 1)" d="M7.89561 14.8538L6.30462 13.2629L14.3099 5.25755L15.9009 6.84854L7.89561 14.8538Z"></path>
                        <path fill="rgba(35, 165, 90, 1)" d="M4.08643 11.0903L5.67742 9.49929L9.4485 13.2704L7.85751 14.8614L4.08643 11.0903Z"></path></svg> </svg>
                        
                    </div>
                    <div class="disabled-toggle">
                        <svg viewBox="0 0 28 20" preserveAspectRatio="xMinYMid meet" aria-hidden="true" class="icon">
                        <rect fill="white" x="4" y="0" height="20" width="20" rx="10">
                        </rect><svg viewBox="0 0 20 20" fill="none">
                        <path fill="rgba(128, 132, 142, 1)"  d="M5.13231 6.72963L6.7233 5.13864L14.855 13.2704L13.264 14.8614L5.13231 6.72963Z"></path>
                            <path fill="rgba(128, 132, 142, 1)" d="M13.2704 5.13864L14.8614 6.72963L6.72963 14.8614L5.13864 13.2704L13.2704 5.13864Z"></path></svg></svg>
                    </div>
                </div>
            </div>
        </div>
    `;
}
function getNotificationsHtml() {
    return `
        Bildirimler
    `
}
function getOverviewHtml() {
    return `
    <div id="settings-title">Sunucuya Genel Bakış</div>
    <div id="guild-settings-rightbar">
        <div id="set-info-title-guild-name">SUNUCU ADI</div>
        <input type="text" id="guild-overview-name-input" autocomplete="off" value="${currentGuildName}" onkeydown="onEditNick()" maxlength="32">
        <img id="guild-image" onclick="triggerguildImageUpdate()" style="user-select: none;">
        <p id="guild-image-remove" style="display:none" >Kaldır</p>
        <form id="guildImageForm" enctype="multipart/form-data">
            <input type="file" name="guildImage" id="guildImage" accept="image/*" style="display: none;">
        </form>
    </div>
    `
}
function getMissingHtml(title) {
    return `

    <div id="settings-title">Sunucuya Genel Bakış</div>
    <div id="guild-settings-rightbar">
        <p style="font-size:20px; color:white; font-weight:bold; margin-top: -150px;">${title}</p>
        <img src="https://raw.githubusercontent.com/liventcord/LiventCordPages/refs/heads/main/static/404_files/noodle.gif"><img>

    </div>
    `
}
function getAccountSettingsHtml() {
    return `
    <div id="settings-rightbartop"></div>
    <div id="settings-title">Hesabım</div>
    <div id="settings-rightbar">
        <div id="settings-light-rightbar">
            <div id="set-info-title-nick">KULLANICI ADI</div>
            <div id="set-info-nick">${currentUserNick}</div>
            <div id="set-info-title-email">E POSTA</div>
            <i id="set-info-email-eye" style="cursor:pointer;" class="fas fa-eye toggle-password" onclick="toggleEmail()"> </i>
            <div id="set-info-email">${masked_email}</div>

        </div>
        
        <input type="text" id="new-nickname-input" autocomplete="off" value="${currentUserNick}" onkeydown="onEditNick()" maxlength="32">
        <img id="settings-self-profile" src="/profiles/${currentUserId}" onclick="triggerFileInput()" style="user-select: none;">
        <div class="bubble" style="margin-left:90px; top:35px;"></div>
        <form id="profileImageForm" enctype="multipart/form-data">
            <input type="file" name="profileImage" id="profileImage" accept="image/*" style="display: none;">
        </form>
        <span id="settings-self-name">${currentUserNick}</span>
    </div>
    `
}
function getAppearanceHtml() {
    return `
        <h3>Görünüm</h3>
        <div class="toggle-card">
            <label for="snow-toggle">Kış Modu</label>
            <label for="snow-toggle">Kar yağışını aktifleştir.</label>
            <div id="snow-toggle" class="toggle-box">
                <div id="toggle-switch" class="toggle-switch">
                    <div class="enabled-toggle">
                        <svg viewBox="0 0 28 20" preserveAspectRatio="xMinYMid meet" aria-hidden="true" class="icon">
                        <rect fill="white" x="4" y="0" height="20" width="20" rx="10"></rect>
                        <svg viewBox="0 0 20 20" fill="none">
                        <path fill="rgba(35, 165, 90, 1)" d="M7.89561 14.8538L6.30462 13.2629L14.3099 5.25755L15.9009 6.84854L7.89561 14.8538Z"></path>
                        <path fill="rgba(35, 165, 90, 1)" d="M4.08643 11.0903L5.67742 9.49929L9.4485 13.2704L7.85751 14.8614L4.08643 11.0903Z"></path></svg> </svg>
                        
                    </div>
                    <div class="disabled-toggle">
                        <svg viewBox="0 0 28 20" preserveAspectRatio="xMinYMid meet" aria-hidden="true" class="icon">
                        <rect fill="white" x="4" y="0" height="20" width="20" rx="10">
                        </rect><svg viewBox="0 0 20 20" fill="none">
                        <path fill="rgba(128, 132, 142, 1)"  d="M5.13231 6.72963L6.7233 5.13864L14.855 13.2704L13.264 14.8614L5.13231 6.72963Z"></path>
                            <path fill="rgba(128, 132, 142, 1)" d="M13.2704 5.13864L14.8614 6.72963L6.72963 14.8614L5.13864 13.2704L13.2704 5.13864Z"></path></svg></svg>
                    </div>
                </div>
            </div>
        </div>
        <div class="toggle-card">
            <label for="party-toggle">Parti Modu</label>
            <label for="party-toggle">Parti modunu aktifleştir.</label>
            <div id="party-toggle" class="toggle-box">
                <div id="toggle-switch" class="toggle-switch">
                    <div class="enabled-toggle">
                        <svg viewBox="0 0 28 20" preserveAspectRatio="xMinYMid meet" aria-hidden="true" class="icon">
                        <rect fill="white" x="4" y="0" height="20" width="20" rx="10"></rect>
                        <svg viewBox="0 0 20 20" fill="none">
                        <path fill="rgba(35, 165, 90, 1)" d="M7.89561 14.8538L6.30462 13.2629L14.3099 5.25755L15.9009 6.84854L7.89561 14.8538Z"></path>
                        <path fill="rgba(35, 165, 90, 1)" d="M4.08643 11.0903L5.67742 9.49929L9.4485 13.2704L7.85751 14.8614L4.08643 11.0903Z"></path></svg> </svg>
                        
                    </div>
                    <div class="disabled-toggle">
                        <svg viewBox="0 0 28 20" preserveAspectRatio="xMinYMid meet" aria-hidden="true" class="icon">
                        <rect fill="white" x="4" y="0" height="20" width="20" rx="10">
                        </rect><svg viewBox="0 0 20 20" fill="none">
                        <path fill="rgba(128, 132, 142, 1)"  d="M5.13231 6.72963L6.7233 5.13864L14.855 13.2704L13.264 14.8614L5.13231 6.72963Z"></path>
                            <path fill="rgba(128, 132, 142, 1)" d="M13.2704 5.13864L14.8614 6.72963L6.72963 14.8614L5.13864 13.2704L13.2704 5.13864Z"></path></svg></svg>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateSettingsHtml(settings,isGuild=false) {
    const buttons = settings.map(setting => `
        <button class="settings-buttons" onclick="selectSettingCategory('${setting.category}')">${setting.label}</button>
    `).join('\n');


    if(isGuild) {  return buttons; }
    
    return `
    ${buttons}
        <button class="settings-buttons" style="bottom:10%; left:0px; position:fixed;" onclick="logOutPrompt()">Çıkış yap</button>
    `;
}

const userSettings = [
    { category: 'MyAccount', label: 'Hesabım' },
    { category: 'SoundAndVideo', label: 'Ses Ve Görüntü' },
    { category: 'Notifications', label: 'Bildirimler' },
    { category: 'ActivityPresence', label: 'Etkinlik Gizliliği' },
    { category: 'Appearance', label: 'Görünüm' }
];

const guildSettings = [
    { category: 'Overview', label: 'Genel Görünüm' },
    { category: 'Emoji', label: 'Emoji' },
];


function createDeleteGuildPrompt(guildId,guild_name) {
    if(!guildId) { return }
    var onClickHandler = function() {
        socket.emit(EventType.DELETE_GUILD, guildId);
    }
    const successText = "Sunucuyu sil";
    askUser(`${guild_name} Sunucusunu Sil`,'Bu işlem geri alınamaz.',successText,onClickHandler,isRed=true);

} 

function toggleCheckBox(toggleElement, value) {
    if (value) {
        toggleElement.querySelector('#toggle-switch').classList.add('active');
        toggleElement.classList.add('active');
    }
}


function getGuildSettings() {
    let setToReturn = [...guildSettings]; 
    if (permissionManager.canManageGuild()) {
        setToReturn.push({ category: Invites, label: 'Davetler' });
        setToReturn.push({ category: Roles, label: 'Roller' });
        setToReturn.push({ category: DeleteGuild, label: 'Sunucuyu Sil' });
    }
    return setToReturn; 
}

function selectSettingCategory(settingtype) { 
    if (isUnsaved && settingtype != DeleteGuild) {
        shakeScreen();
        return;
    }
    let settingsContainer = getId('settings-rightcontainer');
    
    currentSettingsType = settingtype;
    let newHTML = null;
    let callback;
    let isDefault = false;

    switch (settingtype) {
        case SoundAndVideo:
            newHTML = `
                <div id="settings-title">Ses Ayarları</div>
                <select class="dropdown" id="sound-mic-dropdown"></select>
                <select class="dropdown" id="sound-output-dropdown"></select>
                <select class="dropdown" id="camera-dropdown"</select>
            `;
            callback = activateMicAndSoundOutput;
            break;
        case MyAccount:
            newHTML = getAccountSettingsHtml();
            callback = () => {
                getId('profileImage').addEventListener('change', onEditProfile);
                updateSelfProfile(currentUserId, currentUserNick); 
            }
            let rightbar = getId('settings-rightbar');
            if(!rightbar) {
                rightbar = createEl('div',{id:'settings-rightbar'});
                settingsContainer.appendChild(rightbar);
            }
            
            break;
        case Notifications :
            newHTML = getNotificationsHtml();
            break;
        case ActivityPresence :
            newHTML = getActivityPresenceHtml();
            callback = () => { 
                const activitySharedToggle = getId('activity-toggle');
                toggleCheckBox(activitySharedToggle, loadBooleanCookie('isActivityShared'));
                handleToggleClick(activitySharedToggle, () => {
                    const isActivityShared = !loadBooleanCookie('isActivityShared');
                    saveBooleanCookie('isActivityShared', isActivityShared);
                });
            }
            break;
        case Appearance:
            newHTML = getAppearanceHtml();
            callback = () => { 
                const snowToggle = getId('snow-toggle');
                const value = loadBooleanCookie('isSnow');
                toggleCheckBox(snowToggle, value);
                isSnow = value;
                handleToggleClick(snowToggle, () => {
                    toggleSnow();
                    saveBooleanCookie('isSnow', isSnow);
                });
    
                const partyToggle = getId('party-toggle');
                const val = loadBooleanCookie('isParty');
                isParty = val;
                if(isParty) {
                    enableBorderMovement();
                } else {
                    stopCurrentMusic();
                }
                toggleCheckBox(partyToggle, val);
                handleToggleClick(partyToggle, () => {
                    toggleParty();
                    saveBooleanCookie('isParty', isParty);
                });
            }
            break;

        // server settings 
        case Overview:
            newHTML = getOverviewHtml();
            callback = () => {
                getId('guild-image').onerror = () => {
                    getId('guild-image').src = createBlackImage();
                }
                if(permissionManager.canManageChannels()) {
                    getId('guild-image').style.cursor = 'pointer';
                    getId('guild-overview-name-input').style.cursor = 'pointer';
                    getId('guildImage').addEventListener('change', onEditGuildProfile);
                    getId('guild-overview-name-input').disabled = false;
                    if(getId('guild-image').src != createBlackImage()) {
                        enableElement('guild-image-remove');
                        getId('guild-image-remove').addEventListener('click',removeguildImage);
                    }
                } else {
                    getId('guild-image').style.cursor = 'now-allowed';
                    getId('guild-overview-name-input').style.cursor = 'now-allowed';
                    getId('guild-overview-name-input').disabled = true;
                }
                
                getId('guild-image').src = `/guilds/${currentGuildId}`;
                
            }
            break;
        case DeleteGuild:
            createDeleteGuildPrompt(currentGuildId,currentGuildName);
            break;
        default:
            isDefault = true;
            newHTML = getMissingHtml(settingtype);
            break;
        }
    if(newHTML) {
        settingsContainer.innerHTML = newHTML;
        settingsContainer.insertBefore(getCloseButtonElement(),settingsContainer.firstChild)
    }
    if(callback) {
        callback();
    }
 
}
function closeSettings() {
    if(isUnsaved) {
        shakeScreen();
        return;
    }
    enableSnowOnSettings()
    getId('settings-menu').style.animation = 'settings-menu-disappear-animation 0.3s forwards';

    setTimeout(() => {
        getId('settings-overlay').style.display = 'none';
    }, 300);
    isSettingsOpen = false;

}
function getCloseButtonElement() {
    const button = createEl('button');
    button.id = 'close-settings-button';
    button.setAttribute('aria-label', 'Close settings');
    button.setAttribute('role', 'button');
    button.tabIndex = 0;

    button.innerHTML = `
        <svg aria-hidden="true" role="img" width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path fill="currentColor" d="M17.3 18.7a1 1 0 0 0 1.4-1.4L13.42 12l5.3-5.3a1 1 0 0 0-1.42-1.4L12 10.58l-5.3-5.3a1 1 0 0 0-1.4 1.42L10.58 12l-5.3 5.3a1 1 0 1 0 1.42 1.4L12 13.42l5.3 5.3Z"></path>
        </svg>
        <span id="close-keybind">ESC</span>
    `;
    button.onclick = closeSettings;
    return button;
}



function reconstructSettings(_isGuildSettings) { //
    const leftBar = getId('settings-leftbar');
    leftBar.innerHTML = '';
    isGuildSettings = _isGuildSettings ;
    if(_isGuildSettings) {
        leftBar.innerHTML = getGuildSettingsHTML();
        selectSettingCategory( Overview );

    } else{ 
        leftBar.innerHTML = getSettingsHtml();
    }

}
function openSettings(isNotLoadingDefault=false) {
    if(!isNotLoadingDefault) {
        reconstructSettings(false);
    }
    disableSnowOnSettingsOpen();
    selectSettingCategory(MyAccount); 

    

    getId('settings-overlay').style.display = 'flex';

    getId('settings-menu').style.animation = 'settings-menu-appear-animation 0.3s forwards';
    isSettingsOpen = true;
    

};
function applyWiggleEffect(profileElement, selfProfileElement) {
    if(profileElement) {
        profileElement.classList.add('dancing-border');
    }
    if(selfProfileElement) {
        selfProfileElement.classList.add('dancing-border');
    }
    setTimeout(() => {
        if(profileElement) {
            profileElement.classList.remove('dancing-border');
        }
        if(selfProfileElement) {
            selfProfileElement.classList.remove('dancing-border');
        }
    }, 500); 
}

function resetWiggleEffect(...elements) {
    elements.forEach(element => {
        if (element) {
            element.style.transition = 'none';
            element.style.borderRadius = '0%'; 
            setTimeout(() => {
                element.style.transition = 'border-radius 0.1s'; 
            }, 0);
        }
    });
}

function hideConfirmationPanel(pop) {
    pop.style.animation = 'slide-down 0.15s ease-in-out forwards';
    setTimeout(() => {
        pop.style.display = 'none';
    }, 1500); 
}

function showConfirmationPanel(pop) {
    pop.style.display = 'block';
    pop.style.animation = 'slide-up 0.5s ease-in-out forwards';
}


function generateConfirmationPanel() {
    const popupDiv = createEl('div',{id:'settings-unsaved-popup'});
  
    const textDiv = createEl('div',{id:'settings-unsaved-popup-text',textContent:'Dikkat — kaydetmediğin değişiklikler var!'});
    popupDiv.appendChild(textDiv);
  
    const resetButton = createEl('span',{id:'settings-unsaved-popup-resetbutton',textContent:'Sıfırla'});


    resetButton.addEventListener('click',function() {

        hideConfirmationPanel(popupDiv);
        const nickinput = getId('new-nickname-input')
        if(nickinput) {
            nickinput.value = currentUserNick;
        }
        const profileimg = getId('profileImage');
        if(profileimg) {
            profileimg.files = null;
        }
        const settingsSelfProfile = getId('settings-self-profile');

        if(lastConfirmedProfileImg) {
            settingsSelfProfile.src = lastConfirmedProfileImg;
        } else {
            
        }

        const guildNameInput = getId('guild-overview-name-input');
        if(guildNameInput) {
            guildNameInput.value = currentGuildName;
        }

        isUnsaved = false;
        isChangedProfile = false;
        getId('');

    });
    popupDiv.appendChild(resetButton);
  
    const applyButton = createEl('button');
    applyButton.id = 'settings-unsaved-popup-applybutton';
    applyButton.textContent = 'Değişiklikleri Kaydet';
    applyButton.onclick = applySettings;
    popupDiv.appendChild(applyButton);
    getId('settings-menu').appendChild(popupDiv);
  
    return popupDiv;
}
function shakeScreen() {
    currentSettingsType = null;
    if (!currentPopUp) { currentPopUp = generateConfirmationPanel(); }
    showConfirmationPanel(currentPopUp);
    currentPopUp.style.backgroundColor = '#ff1717';

    shakeForce += 0.5;
    if (shakeForce > 5) {
        shakeForce = 5;
    }

    clearTimeout(resetTimeout);

    document.body.classList.remove('shake-screen'); 
    void document.body.offsetWidth; 
    document.body.classList.add('shake-screen');

    resetTimeout = setTimeout(() => {
        shakeForce = 1; 
        document.body.classList.remove('shake-screen'); 
        currentPopUp.style.backgroundColor = '#0f0f0f'; 
    }, 5000); 

    return;
}
function openGuildSettingsDd(event) {
    const clicked_id = event.target.id;
    toggleDropdown();

    if ( clicked_id === 'invite-dropdown-button' ) {
        createInviteUsersPop();
    }
    else if ( clicked_id ===  'settings-dropdown-button') {
        reconstructSettings(true);
        openSettings(true);
        selectSettingCategory(Overview);
    }
    else if ( clicked_id===  "channel-dropdown-button") {
        createChannelsPop();
    }
    else if (clicked_id ===  "notifications-dropdown-button") {
        
    }
    else if ( clicked_id ===  "exit-dropdown-button") {
        askUser('Sunucudan ayrıl', 'Sunucudan ayrılmak istediğine emin misin?','Sunucudan ayrıl',leaveCurrentGuild)
    }
    
}



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
                <label for="activity-toggle">Aktif olduğunuzda etkinliği paylaş</label>
                <label for="activity-toggle">Bir etkinliğe katıldığınızda LiventCord, bu durumu otomatik olarak paylaşır.</label>            <div id="activity-toggle" class="toggle-box">
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
function createToggle(id, label, description) {
    return `
        <div class="toggle-card">
            <label for="${id}">${label}</label>
            <label for="${id}">${description}</label>
            <div id="${id}" class="toggle-box">
                <div class="toggle-switch" id="${id}-switch">
                    <div class="enabled-toggle">
                        <svg viewBox="0 0 28 20" preserveAspectRatio="xMinYMid meet" aria-hidden="true" class="icon">
                            <rect fill="white" x="4" y="0" height="20" width="20" rx="10"></rect>
                            <svg viewBox="0 0 20 20" fill="none">
                                <path fill="rgba(35, 165, 90, 1)" d="M7.89561 14.8538L6.30462 13.2629L14.3099 5.25755L15.9009 6.84854L7.89561 14.8538Z"></path>
                                <path fill="rgba(35, 165, 90, 1)" d="M4.08643 11.0903L5.67742 9.49929L9.4485 13.2704L7.85751 14.8614L4.08643 11.0903Z"></path>
                            </svg>
                        </svg>
                    </div>
                    <div class="disabled-toggle">
                        <svg viewBox="0 0 28 20" preserveAspectRatio="xMinYMid meet" aria-hidden="true" class="icon">
                            <rect fill="white" x="4" y="0" height="20" width="20" rx="10"></rect>
                            <svg viewBox="0 0 20 20" fill="none">
                                <path fill="rgba(128, 132, 142, 1)" d="M5.13231 6.72963L6.7233 5.13864L14.855 13.2704L13.264 14.8614L5.13231 6.72963Z"></path>
                                <path fill="rgba(128, 132, 142, 1)" d="M13.2704 5.13864L14.8614 6.72963L6.72963 14.8614L5.13864 13.2704L13.2704 5.13864Z"></path>
                            </svg>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getAppearanceHtml() {
    const toggles = [
        { id: 'snow-toggle', label: 'Kış Modu', description: 'Kar yağışını aktifleştir.' },
        { id: 'party-toggle', label: 'Parti Modu', description: 'Parti modunu aktifleştir.' },
    ];

    return `
        <h3>Görünüm</h3>
        ${toggles.map(toggle => createToggle(toggle.id, toggle.label, toggle.description)).join('')}
    `;
}
function getNotificationsHtml() {
    const toggles = [
        { id: 'notify-toggle', label: 'Bildirimler', description: 'Bildirimleri etkinleştir.' }
    ];
    return `
        <h3>Bildirimler</h3>
        ${toggles.map(toggle => createToggle(toggle.id, toggle.label, toggle.description)).join('')}
    `
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
        apiClient.send(EventType.DELETE_GUILD, guildId);
    }
    const successText = "Sunucuyu sil";
    askUser(`${guild_name} Sunucusunu Sil`,'Bu işlem geri alınamaz.',successText,onClickHandler,isRed=true);

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

// This function ensures that the toggle checkbox is updated based on the boolean value
function toggleCheckBox(toggleElement, value) {
    if (value) {
        toggleElement.querySelector('.toggle-switch').classList.add('active');
        toggleElement.classList.add('active');
    } else {
        toggleElement.querySelector('.toggle-switch').classList.remove('active');
        toggleElement.classList.remove('active');
    }
}
const toggleStates = {
    'notify-toggle': loadBooleanCookie('notify-toggle') ?? false,
    'snow-toggle': loadBooleanCookie('snow-toggle') ?? false,
    'party-toggle': loadBooleanCookie('party-toggle') ?? false,
    'activity-toggle': loadBooleanCookie('activity-toggle') ?? false
};

function toggleState(toggleId) {
    toggleStates[toggleId] = !toggleStates[toggleId];
    saveBooleanCookie(toggleId, toggleStates[toggleId]);
}

function handleToggleChange(toggleId, newValue) {
    toggleStates[toggleId] = newValue;
    saveBooleanCookie(toggleId, newValue);
    const toggleElement = getId(toggleId);
    if (toggleElement) {
        toggleCheckBox(toggleElement, newValue);
    }

    if (toggleId === 'snow-toggle') {
        toggleSnow();
    } else if (toggleId === 'party-toggle') {
        toggleParty();
    }
}

function setupToggle(id) {
    const toggleElement = getId(id);
    if (toggleElement) {
        toggleCheckBox(toggleElement, toggleStates[id]);
        handleToggleClick(toggleElement, () => {
            const newValue = !toggleStates[id];
            handleToggleChange(id, newValue);
        });
    }
}


function getSettingsConfig() {
    return {
        SoundAndVideo: {
            title: 'Ses Ayarları',
            html: `
                <select class="dropdown" id="sound-mic-dropdown"></select>
                <select class="dropdown" id="sound-output-dropdown"></select>
                <select class="dropdown" id="camera-dropdown"></select>
            `
        },
        MyAccount: {
            title: 'Hesabım',
            html: getAccountSettingsHtml()
        },
        Notifications: {
            title: 'Bildirimler',
            html: getNotificationsHtml()
        },
        ActivityPresence: {
            title: 'Etkinlik Durumu',
            html: getActivityPresenceHtml()
        },
        Appearance: {
            title: 'Görünüm',
            html: getAppearanceHtml()
        },
        Overview: {
            title: 'Sunucu Genel Bakış',
            html: getOverviewHtml()
        },
        DeleteGuild: {
            title: 'Sunucu Silme',
            html: `<button id="delete-guild-button">Sunucuyu Sil</button>`
        }
    };
}

function selectSettingCategory(settingType) {
    const settingsContainer = getId('settings-rightcontainer');
    currentSettingsType = settingType;

    const settingConfig = getSettingsConfig()[settingType] || { title: 'Unknown Setting', html: '<h3>Unknown Setting</h3>' };
    settingsContainer.innerHTML = settingConfig.html;

    const closeButton = getCloseButtonElement();
    closeButton.addEventListener('click',closeSettings);
    settingsContainer.insertBefore(closeButton, settingsContainer.firstChild);

    const togglesToSetup = ['activity-toggle', 'snow-toggle', 'party-toggle','notify-toggle'];
    togglesToSetup.forEach(setupToggle);

    if (settingType === 'DeleteGuild') {
        const deleteButton = getId('delete-guild-button');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => createDeleteGuildPrompt(currentGuildId, currentGuildName));
        }
    }
}



function createToggle(id, label, description) {
    return `
        <div class="toggle-card">
            <label for="${id}">${label}</label>
            <label for="${id}">${description}</label>
            <div id="${id}" class="toggle-box">
                <div class="toggle-switch">
                    <div class="enabled-toggle">
                        <svg viewBox="0 0 28 20" preserveAspectRatio="xMinYMid meet" aria-hidden="true" class="icon">
                            <rect fill="white" x="4" y="0" height="20" width="20" rx="10"></rect>
                            <svg viewBox="0 0 20 20" fill="none">
                                <path fill="rgba(35, 165, 90, 1)" d="M7.89561 14.8538L6.30462 13.2629L14.3099 5.25755L15.9009 6.84854L7.89561 14.8538Z"></path>
                                <path fill="rgba(35, 165, 90, 1)" d="M4.08643 11.0903L5.67742 9.49929L9.4485 13.2704L7.85751 14.8614L4.08643 11.0903Z"></path>
                            </svg>
                        </svg>
                    </div>
                    <div class="disabled-toggle">
                        <svg viewBox="0 0 28 20" preserveAspectRatio="xMinYMid meet" aria-hidden="true" class="icon">
                            <rect fill="white" x="4" y="0" height="20" width="20" rx="10"></rect>
                            <svg viewBox="0 0 20 20" fill="none">
                                <path fill="rgba(128, 132, 142, 1)" d="M5.13231 6.72963L6.7233 5.13864L14.855 13.2704L13.264 14.8614L5.13231 6.72963Z"></path>
                                <path fill="rgba(128, 132, 142, 1)" d="M13.2704 5.13864L14.8614 6.72963L6.72963 14.8614L5.13864 13.2704L13.2704 5.13864Z"></path>
                            </svg>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    `;
}


let isUsingSlide =  false;
function openSettings(isNotLoadingDefault = false) {
    if (!isNotLoadingDefault) {
        reconstructSettings(false);
    }
    selectSettingCategory(settingTypes.MyAccount);

    getId('settings-overlay').style.display = 'flex';

    if (isUsingSlide) {
        getId('settings-menu').style.animation = 'settings-menu-slide-in 0.3s forwards';
    } else {
        getId('settings-menu').style.animation = 'settings-menu-scale-appear 0.3s forwards';
    }


    if (isUsingSlide) {
        getId('settings-menu').style.animation = 'settings-menu-slide-in 0.3s forwards';
    } else {
        getId('settings-menu').style.animation = 'settings-menu-scale-appear 0.3s forwards';
    }

    isSettingsOpen = true;
}

function closeSettings() {
    if (isUnsaved) {
        shakeScreen();
        return;
    }

    if (isUsingSlide) {
        getId('settings-menu').style.animation = 'settings-menu-slide-out 0.3s forwards';
    } else {
        getId('settings-menu').style.animation = 'settings-menu-scale-disappear 0.3s forwards';
    }

    setTimeout(() => {
        getId('settings-overlay').style.display = 'none';
    }, 300);
    isSettingsOpen = false;
}


function getCloseButtonElement() {
    const button = createEl('button', {
        id: 'close-settings-button',
        ariaLabel: 'Close settings',
        role: 'button',
        tabindex: '0',
    });

    button.innerHTML = `
        <svg aria-hidden="true" role="img" width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path fill="currentColor" d="M17.3 18.7a1 1 0 0 0 1.4-1.4L13.42 12l5.3-5.3a1 1 0 0 0-1.42-1.4L12 10.58l-5.3-5.3a1 1 0 0 0-1.4 1.42L10.58 12l-5.3 5.3a1 1 0 1 0 1.42 1.4L12 13.42l5.3 5.3Z"></path>
        </svg>
        <span id="close-keybind">ESC</span>
    `;

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
    const SHAKE_FORCE = 1;

    currentSettingsType = null;
    if (!currentPopUp) { currentPopUp = generateConfirmationPanel(); }
    showConfirmationPanel(currentPopUp);
    currentPopUp.style.backgroundColor = '#ff1717';

    SHAKE_FORCE += 0.5;
    if (SHAKE_FORCE > 5) {
        SHAKE_FORCE = 5;
    }

    clearTimeout(resetTimeout);

    document.body.classList.remove('shake-screen'); 
    document.body.classList.add('shake-screen');

    resetTimeout = setTimeout(() => {
        SHAKE_FORCE = 1; 
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

function updateSettingsProfileColor() {
    const settingsProfileImg = getId('settings-self-profile');
    const rightBarTop = getId('settings-rightbartop');
    if(rightBarTop) {
        rightBarTop.style.backgroundColor = getAverageRGB(settingsProfileImg);
    }
}
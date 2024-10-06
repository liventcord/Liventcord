let contextMenu = null;


const Overview = 'Overview';
const Roles = 'Roles';
const Emoji = 'Emoji';
const Invites = 'Invites';
const DeleteGuild = 'Delete Guild';
const textChanHtml = '<svg class="icon_d8bfb3" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M10.99 3.16A1 1 0 1 0 9 2.84L8.15 8H4a1 1 0 0 0 0 2h3.82l-.67 4H3a1 1 0 1 0 0 2h3.82l-.8 4.84a1 1 0 0 0 1.97.32L8.85 16h4.97l-.8 4.84a1 1 0 0 0 1.97.32l.86-5.16H20a1 1 0 1 0 0-2h-3.82l.67-4H21a1 1 0 1 0 0-2h-3.82l.8-4.84a1 1 0 1 0-1.97-.32L15.15 8h-4.97l.8-4.84ZM14.15 14l.67-4H9.85l-.67 4h4.97Z" clip-rule="evenodd" class=""></path></svg>'
const voiceChanHtml = '<svg class="icon_d8bfb3" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3a1 1 0 0 0-1-1h-.06a1 1 0 0 0-.74.32L5.92 7H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2.92l4.28 4.68a1 1 0 0 0 .74.32H11a1 1 0 0 0 1-1V3ZM15.1 20.75c-.58.14-1.1-.33-1.1-.92v-.03c0-.5.37-.92.85-1.05a7 7 0 0 0 0-13.5A1.11 1.11 0 0 1 14 4.2v-.03c0-.6.52-1.06 1.1-.92a9 9 0 0 1 0 17.5Z" class=""></path><path fill="currentColor" d="M15.16 16.51c-.57.28-1.16-.2-1.16-.83v-.14c0-.43.28-.8.63-1.02a3 3 0 0 0 0-5.04c-.35-.23-.63-.6-.63-1.02v-.14c0-.63.59-1.1 1.16-.83a5 5 0 0 1 0 9.02Z" class=""></path></svg>'

const inviteHtml = '<svg class="actionIcon_f6f816" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M14.5 8a3 3 0 1 0-2.7-4.3c-.2.4.06.86.44 1.12a5 5 0 0 1 2.14 3.08c.01.06.06.1.12.1ZM16.62 13.17c-.22.29-.65.37-.92.14-.34-.3-.7-.57-1.09-.82-.52-.33-.7-1.05-.47-1.63.11-.27.2-.57.26-.87.11-.54.55-1 1.1-.92 1.6.2 3.04.92 4.15 1.98.3.27-.25.95-.65.95a3 3 0 0 0-2.38 1.17ZM15.19 15.61c.13.16.02.39-.19.39a3 3 0 0 0-1.52 5.59c.2.12.26.41.02.41h-8a.5.5 0 0 1-.5-.5v-2.1c0-.25-.31-.33-.42-.1-.32.67-.67 1.58-.88 2.54a.2.2 0 0 1-.2.16A1.5 1.5 0 0 1 2 20.5a7.5 7.5 0 0 1 13.19-4.89ZM9.5 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM15.5 22Z" class=""></path><path fill="currentColor" d="M19 14a1 1 0 0 1 1 1v3h3a1 1 0 0 1 0 2h-3v3a1 1 0 0 1-2 0v-3h-3a1 1 0 1 1 0-2h3v-3a1 1 0 0 1 1-1Z" class=""></path></svg>';
const settingsHtml = '<svg class="actionIcon_f6f816" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M10.56 1.1c-.46.05-.7.53-.64.98.18 1.16-.19 2.2-.98 2.53-.8.33-1.79-.15-2.49-1.1-.27-.36-.78-.52-1.14-.24-.77.59-1.45 1.27-2.04 2.04-.28.36-.12.87.24 1.14.96.7 1.43 1.7 1.1 2.49-.33.8-1.37 1.16-2.53.98-.45-.07-.93.18-.99.64a11.1 11.1 0 0 0 0 2.88c.06.46.54.7.99.64 1.16-.18 2.2.19 2.53.98.33.8-.14 1.79-1.1 2.49-.36.27-.52.78-.24 1.14.59.77 1.27 1.45 2.04 2.04.36.28.87.12 1.14-.24.7-.95 1.7-1.43 2.49-1.1.8.33 1.16 1.37.98 2.53-.07.45.18.93.64.99a11.1 11.1 0 0 0 2.88 0c.46-.06.7-.54.64-.99-.18-1.16.19-2.2.98-2.53.8-.33 1.79.14 2.49 1.1.27.36.78.52 1.14.24.77-.59 1.45-1.27 2.04-2.04.28-.36.12-.87-.24-1.14-.96-.7-1.43-1.7-1.1-2.49.33-.8 1.37-1.16 2.53-.98.45.07.93-.18.99-.64a11.1 11.1 0 0 0 0-2.88c-.06-.46-.54-.7-.99-.64-1.16.18-2.2-.19-2.53-.98-.33-.8.14-1.79 1.1-2.49.36-.27.52-.78.24-1.14a11.07 11.07 0 0 0-2.04-2.04c-.36-.28-.87-.12-1.14.24-.7.96-1.7 1.43-2.49 1.1-.8-.33-1.16-1.37-.98-2.53.07-.45-.18-.93-.64-.99a11.1 11.1 0 0 0-2.88 0ZM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clip-rule="evenodd" class=""></path></svg>';
const muteHtml = '<svg class="icon_cdc675" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="m2.7 22.7 20-20a1 1 0 0 0-1.4-1.4l-20 20a1 1 0 1 0 1.4 1.4ZM10.8 17.32c-.21.21-.1.58.2.62V20H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2.06A8 8 0 0 0 20 10a1 1 0 0 0-2 0c0 1.45-.52 2.79-1.38 3.83l-.02.02A5.99 5.99 0 0 1 12.32 16a.52.52 0 0 0-.34.15l-1.18 1.18ZM15.36 4.52c.15-.15.19-.38.08-.56A4 4 0 0 0 8 6v4c0 .3.03.58.1.86.07.34.49.43.74.18l6.52-6.52ZM5.06 13.98c.16.28.53.31.75.09l.75-.75c.16-.16.19-.4.08-.61A5.97 5.97 0 0 1 6 10a1 1 0 0 0-2 0c0 1.45.39 2.81 1.06 3.98Z" class=""></path></svg>';
const inviteVoiceHtml = '<svg class="icon_cdc675" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M13 3a1 1 0 1 0-2 0v8H3a1 1 0 1 0 0 2h8v8a1 1 0 0 0 2 0v-8h8a1 1 0 0 0 0-2h-8V3Z" class=""></path></svg>';

const selectedChanColor = 'rgb(64, 66, 73)';
const hoveredChanColor = 'rgb(53, 55, 60';



const loadingScreen = createEl('div', { id: 'loading-screen' });
document.body.appendChild(loadingScreen);
const loadingElement = createEl('img', { id: 'loading-element' });
loadingScreen.appendChild(loadingElement);
loadingElement.src = '/static/images/icons/icon.png';

async function urlToBase64(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onloadend = () => {
                const base64Data = reader.result.split(',')[1];
                const mimeType = blob.type || 'image/png';
                resolve(`data:${mimeType};base64,${base64Data}`);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error fetching or converting URL to Base64:', error);
        throw error;
    }
}



document.addEventListener('DOMContentLoaded', async function() {

    urlToBase64(defaultProfileImageUrl)
    .then(base64 => defaultProfileImageUrl = base64)
    .catch(error => console.error(error));
        
    urlToBase64(defaultMediaImageUrl)
        .then(base64 => defaultMediaImageUrl = base64)
        .catch(error => console.error(error));
        
})

function disableElement(str) {
    const element = getId(str);
    if(element) {
        element.style.display = 'none';
    }   

}
function enableElement(str, isFlex1 = false, isBlock = false, isInline = false) {
    const element = getId(str);
    if (element) {
        if (isFlex1) {
            element.style.flex = '1';
        }
        
        if (isBlock) {
            element.style.display = 'block';
        } else if (isInline) {
            element.style.display = 'inline-block';
        } else {
            element.style.display = 'flex';
        }

        //console.log("Element", str, 'is enabled.');
    }
}


function toggleEmail() {
    const eyeIcon = getId('set-info-email-eye');
    isEmailToggled = !isEmailToggled;
    getId("set-info-email").textContent = isEmailToggled ? email : masked_email;    

    if (isEmailToggled) {
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
    

}
function getGuildSettings() {
    let setToReturn = [...guildSettings]; 
    if (isSelfAuthor()) {
        setToReturn.push({ category: 'Invites', label: 'Davetler' });
        setToReturn.push({ category: 'Roles', label: 'Roller' });
        setToReturn.push({ category: 'Delete Guild', label: 'Sunucuyu Sil' });
    }
    return setToReturn; 
}


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
        <img src="/static/404_files/noodle.gif"><img>

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
            <div id="set-info-nick">${currentUserName}</div>
            <div id="set-info-title-email">E POSTA</div>
            <i id="set-info-email-eye" style="cursor:pointer;" class="fas fa-eye toggle-password" onclick="toggleEmail()"> </i>
            <div id="set-info-email">${masked_email}</div>

        </div>
        
        <input type="text" id="new-nickname-input" autocomplete="off" value="${currentUserName}" onkeydown="onEditNick()" maxlength="32">
        <img id="settings-self-profile" src="/profiles/${currentUserId}" onclick="triggerFileInput()" style="user-select: none;">
        <div class="bubble" style="margin-left:90px; top:35px;"></div>
        <form id="profileImageForm" enctype="multipart/form-data">
            <input type="file" name="profileImage" id="profileImage" accept="image/*" style="display: none;">
        </form>
        <span id="settings-self-name">${currentUserName}</span>
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
function handleToggleClick(toggleElement, toggleClickCallback) {
    toggleElement.addEventListener('click', function() {
        this.classList.toggle('active');
        this.querySelector('#toggle-switch').classList.toggle('active');
        toggleClickCallback();
    });
}

function toggleCheckBox(toggleElement, value) {
    if (value) {
        toggleElement.querySelector('#toggle-switch').classList.add('active');
        toggleElement.classList.add('active');
    }
}

let isActivityShared = false;
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
                updateSelfProfile(currentUserId, currentUserName); 
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

function getBase64Image(imgElement) {
    const canvas = createEl('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imgElement.naturalWidth;
    canvas.height = imgElement.naturalHeight;
    ctx.drawImage(imgElement, 0, 0);
    return canvas.toDataURL('image/png');
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


function hidePopUp(pop) {
    pop.style.animation = 'slide-down 0.15s ease-in-out forwards';
    setTimeout(() => {
        pop.style.display = 'none';
    }, 1500); 
}

function showUnsavedPopUp(pop) {
    pop.style.display = 'block';
    pop.style.animation = 'slide-up 0.5s ease-in-out forwards';
}


function generateUnsavedPopUp() {
    const popupDiv = createEl('div',{id:'settings-unsaved-popup'});
  
    const textDiv = createEl('div',{id:'settings-unsaved-popup-text',textContent:'Dikkat — kaydetmediğin değişiklikler var!'});
    popupDiv.appendChild(textDiv);
  
    const resetButton = createEl('span',{id:'settings-unsaved-popup-resetbutton',textContent:'Sıfırla'});


    resetButton.addEventListener('click',function() {

        hidePopUp(popupDiv);
        const nickinput = getId('new-nickname-input')
        if(nickinput) {
            nickinput.value = currentUserName;
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

function createCropPop(inputSrc, callbackAfterAccept) {
    const cropTitle = 'Görseli Düzenle';
    const inviteTitle = createEl('p', { id: 'invite-users-title', textContent: cropTitle });

    const imageContainer = createEl('div', { id: 'image-container' });
    const appendButton = createEl('button', { className: 'pop-up-append', textContent: 'Uygula' });
    let parentContainer;
    
    appendButton.addEventListener('click', () => {
        // Get the cropped result as a square image (the output size can be adjusted as needed)
        croppie.result({
            type: 'base64',
            format: 'jpeg',
            quality: 1,
            size: { width: 430, height: 430 }, // Set size to square (adjust if necessary)
            circle: false // Ensure the output is not circular
        }).then(function (base64) {
            callbackAfterAccept(base64);
            parentContainer.remove();
            updateSettingsProfileColor();
        });
    });
    
    const backButton = createEl('button', { textContent: 'İptal', className: 'create-guild-back common-button' });

    backButton.addEventListener('click', () => { parentContainer.remove(); });

    const popBottomContainer = createEl('div', { className: 'popup-bottom-container', id: 'invite-popup-bottom-container' });
    popBottomContainer.style.bottom = '-5%';
    popBottomContainer.style.top = 'auto';
    popBottomContainer.style.height = '10%';
    popBottomContainer.style.zIndex = '-1';
    backButton.style.left = '20px';
    
    const contentElements = [inviteTitle, imageContainer, backButton, appendButton, popBottomContainer];
    
    parentContainer = createPopUp({
        contentElements: contentElements,
        id: 'cropPopContainer',
        closeBtnId: 'invite-close-button'
    });
    
    const imageElement = createEl('img');
    imageElement.src = inputSrc;

    const croppie = new Croppie(imageContainer, {
        viewport: { width: 430, height: 430, type: 'circle' }, 
        boundary: { width: 440, height: 440 }, 
        showZoomer: true,
        enableExif: true
    });

    croppie.bind({
        url: inputSrc
    });
    
    getId('cropPopContainer').style.setProperty('height', '600px', 'important');
    getId('cropPopContainer').style.setProperty('width', '600px', 'important');

    imageContainer.querySelector('.cr-slider-wrap').querySelector('.cr-slider').style.transform = 'scale(1.5);';
}
function shakeScreen() {
    currentSettingsType = null;
    if (!currentPopUp) { currentPopUp = generateUnsavedPopUp(); }
    showUnsavedPopUp(currentPopUp);
    currentPopUp.style.backgroundColor = '#ff1717';

    shakeForce += 0.5;
    if (shakeForce > 5) {
        shakeForce = 5; // Cap the shake force at a maximum value
    }

    clearTimeout(resetTimeout);

    document.body.classList.remove('shake-screen'); // Remove the animation class
    void document.body.offsetWidth; // Trigger reflow to reset animation
    document.body.classList.add('shake-screen'); // Add the animation class with updated force

    resetTimeout = setTimeout(() => {
        shakeForce = 1; // Reset shake force to 1
        document.body.classList.remove('shake-screen'); // Remove the animation class
        currentPopUp.style.backgroundColor = '#0f0f0f'; // Reset background color
    }, 5000); 

    return;
}
function createFireWorks() {
    setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    return;
}

function handleResize() {
    
    if(window.innerWidth < 1200) {
        if(isOnMe) {
            disableElement('user-list');
            const userLine = document.querySelector('.horizontal-line');
            userLine.style.display = 'none';
        } else {
            setUserListLine();
        }   
    }  else {
        setUserListLine();
    }
    
    const inputRightToSet = userList.style.display === 'flex' ? '463px' : '76px';
    const addFriendInputButton = getId('addfriendinputbutton');
    if (addFriendInputButton) {
        addFriendInputButton.style.right = inputRightToSet;
    }
}


function openTbHelp() {
    alertUser('Stop it, get some help')

}
function loadMainToolbar() {
    disableElement('tb-call')
    disableElement('tb-video-call')
    disableElement('tb-pin')
    disableElement('tb-createdm')
    disableElement('tb-showprofile')
    disableElement('tb-search')
}
function loadGuildToolbar() {
    disableElement('tb-call')
    disableElement('tb-video-call')
    enableElement('tb-pin')
    disableElement('tb-createdm')
    enableElement('tb-showprofile')
    enableElement('tb-search')
}
function loadDmToolbar() {
    enableElement('tb-call')
    enableElement('tb-video-call')
    enableElement('tb-pin')
    enableElement('tb-createdm')
    enableElement('tb-showprofile')
    enableElement('tb-search')
}


function fillDropDownContent() {
    if(permissionManager.canManageChannels()) {
        enableElement('channel-dropdown-button');
    } else {
        disableElement('channel-dropdown-button');
    }
    if(permissionManager.canManageChannels) {
        enableElement('invite-dropdown-button');
    } else {
        disableElement('invite-dropdown-button');
    }

    if(isSelfAuthor()) {
        disableElement('exit-dropdown-button');
    } else {
        enableElement('exit-dropdown-button');
    }
}

function setActiveIcon() {
    let favicon = getId('favicon');
    let activeIconHref = '/static/images/icons/iconactive.png';
    favicon.href = activeIconHref;
}
function setInactiveIcon() {
    let favicon = getId('favicon');
    let activeIconHref =  '/static/images/icons/icon.png';
    favicon.href = activeIconHref;
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






function showGuildPop(subject, content) {

    const newPopParent = createEl('div', { className: 'pop-up', id: 'guild-pop-up' });
    const newPopOuterParent = createEl('div', { className: 'outer-parent' });
    const guildPopSubject = createEl('h1', { className: 'guild-pop-up-subject', textContent: subject });
    const guildPopContent = createEl('p', { className: 'guild-pop-up-content', textContent: content });
    const guildPopButtonContainer = createEl('div', { className: 'guild-pop-button-container' });

    const popBottomContainer = createEl('div',{className:'popup-bottom-container'});
    const popOptionButton = createEl('button', { id:'popOptionButton',className: 'guild-pop-up-accept', textContent: 'Kendim Oluşturayım' });
    const closeCallback = function (event) {
        closePopUp(newPopOuterParent, newPopParent);
    }
    
    
    popOptionButton.addEventListener('click', function () { changePopUpToGuildCreation(newPopParent,guildPopButtonContainer,guildPopContent,guildPopSubject,closeCallback); });

    const option2Title = createEl('p', {className:'guild-pop-up-content', id:'guild-popup-option2-title',textContent:'Zaten davetin var mı?' });
    const popOptionButton2 = createEl('button', { id:'popOptionButton2',className: 'guild-pop-up-accept', textContent: 'Bir Sunucuya Katıl' });
    popOptionButton2.addEventListener('click', function () { ChangePopUpToGuildJoining(newPopParent,guildPopButtonContainer,guildPopContent,guildPopSubject,closeCallback); });

    popBottomContainer.appendChild(option2Title);
    popBottomContainer.appendChild(popOptionButton2);

    const closeButton = createEl('button', { className: 'pop-up-accept', className: 'popup-close', textContent: 'X' });
    closeButton.addEventListener('click', function () { closePopUp(newPopOuterParent, newPopParent); });

    newPopParent.appendChild(guildPopSubject);
    newPopParent.appendChild(guildPopContent);
    guildPopButtonContainer.appendChild(popOptionButton);
    guildPopButtonContainer.appendChild(popBottomContainer);
    newPopParent.appendChild(guildPopButtonContainer);
    newPopParent.appendChild(closeButton);

    newPopOuterParent.appendChild(newPopParent);
    newPopOuterParent.style.display = 'flex';

    newPopOuterParent.addEventListener('click',function() {
        if (event.target === newPopOuterParent) {
            closeCallback();
        }
    });

    document.body.appendChild(newPopOuterParent);

}
function clickToCreateGuildBackButton() {
    closePopUp(newPopOuterParent, newPopParent);
}
function clickToJoinGuildBackButton(event,closeCallback) {
    closeCallback(event);
    startGuildJoinCreate();
}

function changePopUpToGuildCreation(newPopParent, popButtonContainer, newPopContent, newPopSubject,closeCallback) {

    if (popButtonContainer && popButtonContainer.parentNode) {
        popButtonContainer.parentNode.removeChild(popButtonContainer);
    }
    newPopSubject.textContent = 'Sunucunu Özelleştir';
    newPopContent.textContent = 'Yeni sunucuna bir isim ve simge ekleyerek ona kişilik kat. Bunları istediğin zaman değiştirebilirsin.';

    const text = currentUserName + ' Kullanıcısının sunucusu';
    const newInput = createEl('input', { value: text, id: 'guild-name-input' });
    const createButton = createEl('button', { textContent: 'Oluştur', className: 'create-guild-verify common-button' });
    const backButton = createEl('button', { textContent: 'Geri', className: 'create-guild-back common-button' });

    backButton.addEventListener('click', function(event) {
        clickToJoinGuildBackButton(event, closeCallback);
    });
    const guildNameTitle = createEl('h1', { textContent: 'SUNUCU ADI', className: 'create-guild-title' });

    const guildImageForm = createEl('div', { id: 'guildImageForm', accept: 'image/*' });
    const guildImageInput = createEl('input', { type: 'file', id: 'guildImageInput', accept: 'image/*', style: 'display: none;' });

    const guildImage = createEl('div', { id: 'guildImg', className: 'fas fa-camera' });
    const uploadText = createEl('p', { id: 'uploadText', textContent: 'UPLOAD' });
    const clearButton = createEl('button', { id: 'clearButton', textContent: 'X', style: 'display: none;' });
    guildImage.appendChild(uploadText);
    guildImage.appendChild(clearButton);
    function triggerGuildInput() {
        guildImageInput.click();
    }
    function handleImageUpload(event) {
        console.log(event);
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                guildImage.style.backgroundImage = `url(${e.target.result})`;
                guildImage.style.backgroundSize = 'cover';
                guildImage.style.backgroundPosition = 'center';
                uploadText.style.display = 'none'; 
                clearButton.style.display = 'flex'; 
                guildImage.className = "guildImage";
                
            };
            reader.readAsDataURL(file);
        }
    }

    guildImage.addEventListener('click', triggerGuildInput);
    createButton.addEventListener('click', createGuild);

    guildImageInput.addEventListener('change', handleImageUpload);
    clearButton.addEventListener('click', clearImage);

    function clearImage(event) {
        event.stopPropagation(); 
        guildImage.style.backgroundImage = '';
        uploadText.style.display = 'block'; 
        clearButton.style.display = 'none'; 
        guildImageInput.value = ''; 
    }

    guildImageForm.appendChild(guildImageInput);
    guildImageForm.appendChild(guildImage);

    newPopParent.style.animation='guild-pop-up-create-guild-animation 0.3s forwards';
    newPopParent.appendChild(guildImageForm);
    newPopParent.appendChild(guildNameTitle);
    newPopParent.appendChild(newInput);
    newPopParent.appendChild(createButton);
    newPopParent.appendChild(backButtn);
}
function ChangePopUpToGuildJoining(newPopParent, popButtonContainer, newPopContent, newPopSubject,closeCallback) {

    if (popButtonContainer) {
        popButtonContainer.remove();
    }

    newPopSubject.textContent = 'Bir Sunucuya Katıl';
    newPopContent.textContent = 'Var olan bir sunucuya katılmak için aşağıya bir davet gir.';
    const text = `${window.location.protocol}//${window.location.hostname}/hTKzmak`;
    const newInput = createEl('input', { placeholder: text, id: 'guild-name-input' });

    const joinButton = createEl('button', { textContent: 'Sunucuya Katıl', className: 'create-guild-verify common-button' });
    joinButton.style.fontSize = '14px';
    joinButton.style.whiteSpace = 'nowrap';
    joinButton.style.padding = '0px';
    joinButton.style.width = '120px';





    joinButton.addEventListener('click',function() {
        if(newInput.value == '') {
            guildNameTitle.textContent = 'DAVET BAĞLANTISI - Lütfen geçerli bir davet bağlantısı veya davet kodu gir.';
            guildNameTitle.textAlign = 'left';
            guildNameTitle.style.color = 'red';
            return;
        } 
        joinToGuild(newInput.value);
        closeCurrentJoinPop = closeCallback;
    });

    const backButton = createEl('button', { textContent: 'Geri', className: 'create-guild-back common-button' });
    backButton.addEventListener('click', function(event) {
        clickToJoinGuildBackButton(event, closeCallback);
    });
    const guildNameTitle = createEl('h1', { textContent: 'DAVET BAĞLANTISI', className: 'create-guild-title',id:'create-guild-title' });
    guildNameTitle.style.top = '25%';
    const guildNameDescription = createEl('h1', { textContent: 'DAVETLER ŞÖYLE GÖRÜNÜR', className: 'create-guild-title' });
    const descriptionText = `
    hTKzmak<br>
    ${window.location.protocol}//${window.location.hostname}/hTKzmak<br>
    ${window.location.protocol}//${window.location.hostname}/cool-people
    `;
    const guildNameDescriptionContent = createEl('h1', { innerHTML: descriptionText, className: 'create-guild-title' });
    guildNameDescriptionContent.style.width = '55%';
    guildNameDescriptionContent.style.textAlign = 'left'; 
    
    


    guildNameDescriptionContent.style.color = 'white';
    guildNameDescriptionContent.style.top = '60%';
    guildNameDescription.style.top = '55%';
    newInput.style.bottom = '50%';


    const guildImage = createEl('div', { id: 'guildImg', className: 'fas fa-camera' });
    const uploadText = createEl('p', { id: 'uploadText', textContent: 'UPLOAD' });
    const clearButton = createEl('button', { id: 'clearButton', textContent: 'X', style: 'display: none;' });
    guildImage.appendChild(uploadText);
    guildImage.appendChild(clearButton);

    const popBottomContainer = createEl('div',{className:'popup-bottom-container'});

    const guildPopButtonContainer = createEl('div', { className: 'guild-pop-button-container' });
    guildPopButtonContainer.appendChild(popBottomContainer);
    newPopParent.appendChild(guildPopButtonContainer);

    newPopParent.style.animation = 'guild-pop-up-join-guild-animation 0.3s forwards';

    newPopParent.appendChild(guildNameTitle);
    newPopParent.appendChild(guildNameDescription);
    newPopParent.appendChild(guildNameDescriptionContent);
    newPopParent.appendChild(newInput);
    newPopParent.appendChild(joinButton);
    newPopParent.appendChild(backButton);
}


function closePopUp(outerParent, popParent) {

    popParent.style.animation = 'pop-up-shrink-animation 0.2s forwards';
    popParent.style.overflow = 'hidden'; 

    setTimeout(() => {
        outerParent.remove();
    }, 200);
}



function triggerFileInput() {
    getId('profileImage').click();
}
function triggerguildImageUpdate() {
    getId('guildImage').click();
}


function keydownHandler(event) {
    if (event.key === 'Escape') {
        event.preventDefault();
        if (isSettingsOpen) {
            closeSettings();
            return;
        }
        if (isImagePreviewOpen) {
            hideImagePreviewRequest();
        }
    }
}

document.addEventListener('keydown', keydownHandler);


function isProfilePopOpen() {
    return Boolean(getId('profilePopContainer'))    
}

document.body.addEventListener('click', function(event) {
    if (gifMenu && !gifMenu.contains(event.target) && event.target.id !== 'gifbtn') {
        closeGifs();
    }
});



function hideLoadingScreen() {
    loadingScreen.style.display = 'none';
}





function getAverageRGB(imgEl) {
    if (imgEl.src === defaultProfileImageUrl) {
        return '#e7e7e7';
    }

    const blockSize = 5;
    const defaultRGB = { r: 0, g: 0, b: 0 };
    const canvas = document.createElement('canvas');
    const context = canvas.getContext && canvas.getContext('2d');

    if (!context) {
        return defaultRGB;
    }

    // Check if the value is already cached
    if (rgbCache[imgEl.src]) {
        return rgbCache[imgEl.src];
    }

    const height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    const width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

    context.drawImage(imgEl, 0, 0, width, height);

    let data;
    try {
        data = context.getImageData(0, 0, width, height);
    } catch (e) {
        return defaultRGB;
    }

    const length = data.data.length;
    const rgb = { r: 0, g: 0, b: 0 };
    let count = 0;

    for (let i = 0; i < length; i += blockSize * 4) {
        count++;
        rgb.r += data.data[i];
        rgb.g += data.data[i + 1];
        rgb.b += data.data[i + 2];
    }

    // Calculate the average color
    rgb.r = ~~(rgb.r / count);
    rgb.g = ~~(rgb.g / count);
    rgb.b = ~~(rgb.b / count);

    // Convert the RGB values to a hexadecimal string
    const rgbString = rgbToHex(rgb.r, rgb.g, rgb.b);

    // Cache the result
    rgbCache[imgEl.src] = rgbString;

    return rgbString;
}



function createMsgOptionButton(message,isReply) {
    const textc = isReply ? '↪' : '⋯'; 
    
    const newButton = createEl('button',{className:'message-button'});

        const textEl = createEl('div', { textContent: textc, className: 'message-button-text' });
        newButton.appendChild(textEl);
    if(isReply) {
        newButton.onclick = function() {
            showReplyMenu(message.id,message.dataset.user_id);
        }

    }

    newButton.addEventListener("mousedown", function() {
        newButton.style.border = "2px solid #000000";
    });    
    newButton.addEventListener("mouseup", function() {
        newButton.style.border = "none";
    });
    newButton.addEventListener("mouseover", function() {
        newButton.style.backgroundColor = '#393a3b';
    });    
    newButton.addEventListener("mouseout", function() {
        newButton.style.backgroundColor = '#313338';
    });
    newButton.addEventListener('focus', () => {
        newButton.classList.add('is-focused');
    });
    newButton.addEventListener('blur', () => {
        newButton.classList.remove('is-focused');
    });
    let buttonContainer = message.querySelector('.message-button-container');
    if (!buttonContainer) {
        buttonContainer = createEl('div');
        buttonContainer.classList.add('message-button-container');
        message.appendChild(buttonContainer);
    }

    buttonContainer.appendChild(newButton);
    return newButton;
}

//Context
const ActionType = {
    COPY_ID: "ID'yi Kopyala",
    COPY_USER_ID: "Kullanıcı ID'sini Kopyala",
    INVITE_TO_GUILD: "Sunucuya Davet Et",
    BLOCK_USER: "Engelle",
    REPORT_USER: "Kullanıcı Profilini Bildir",
    REMOVE_USER: "Arkadaşı Çıkar",
    EDIT_GUILD_PROFILE: "Sunucu Profilini Düzenle",
    MENTION_USER : "Bahset"
};
const ChannelsActionType = {
    MARK_AS_READ: "Okundu olarak işaretle",
    COPY_LINK: "Bağlantıyı Kopyala",
    MUTE_CHANNEL: "Kanalı Sessize Al",
    NOTIFY_SETTINGS: "Bildirim Ayarları",
    EDIT_CHANNEL: "Kanalı Düzenle",
    DELETE_CHANNEL: "Kanalı Sil"

}
const VoiceActionType = {
    OPEN_PROFILE: "Profil",
    MENTION_USER: "Bahset",
    MUTE_USER: "Sustur",
    DEAFEN_USER: "Sağırlaştır"
    
}
function createUserContext(user_id) {
    let context = {};


    if(!isProfilePopOpen()) {
        context[VoiceActionType.OPEN_PROFILE] = { action: () => drawProfilePop(user_id) };
    }

    context[VoiceActionType.MENTION_USER] = () => mentionUser(user_id),
    context[VoiceActionType.MUTE_USER] = () => muteUser(user_id),
    context[VoiceActionType.DEAFEN_USER] = () => deafenUser(user_id)

    if (user_id === currentUserId) {
        context[ActionType.EDIT_GUILD_PROFILE] = () => editGuildProfile();
    }

    if (isDeveloperMode) {
        context[ActionType.COPY_ID] = () => copyId(user_id);
    }

    return context;
}

function createProfileContext(userData) {
    const user_id = userData.user_id;
    let context = {};


    if(!isProfilePopOpen()) {
        context[VoiceActionType.OPEN_PROFILE] = { action: () => drawProfilePop(userData) };
    }


    if (user_id !== currentUserId) {
        const guildSubOptions = getManageableGuilds();
        if (Array.isArray(guildSubOptions) && guildSubOptions.length > 0) {
            context[ActionType.INVITE_TO_GUILD] = {
                action: () => {},
                subOptions: guildSubOptions.map(subOption => ({
                    label: getGuildName(subOption),
                    action: () => inviteUser(user_id, subOption)
                }))
            };
        }
    }

    if (!isOnMe) {
        context[ActionType.MENTION_USER] = {
            action: () => mentionUser(user_id)
        };
    }

    if (user_id == currentUserId) {
        context[ActionType.EDIT_GUILD_PROFILE] = {
            action: () => editGuildProfile()
        };
    } else {
        context[ActionType.BLOCK_USER] = {
            action: () => blockUser(user_id)
        };
        context[ActionType.REPORT_USER] = {
            action: () => reportUser(user_id)
        };
    }

    if (isFriend(user_id)) {
        context[ActionType.REMOVE_USER] = {
            action: () => removeFriend(user_id)
        };
    }

    if (isDeveloperMode) {
        context[ActionType.COPY_USER_ID] = {
            action: () => copyId(user_id)
        };
    }

    return context;
}



function addContextListeners() {
    document.addEventListener('contextmenu', function (event) {
        event.preventDefault();

        let options = null;

        if (event.target.id && contextList.hasOwnProperty(event.target.id)) {
            options = contextList[event.target.id];
        } else if (event.target.dataset.m_id && messageContextList.hasOwnProperty(event.target.dataset.m_id)) {
            options = messageContextList[event.target.dataset.m_id];
        } else if (event.target.dataset.cid && contextList.hasOwnProperty(event.target.dataset.cid)) {
            options = contextList[event.target.dataset.cid];
        }

        if (options) {
            showContextMenu(event.pageX, event.pageY, options);
        }
    });

    document.addEventListener('click', function (event) {
        if (event.target.dataset.m_id && messageContextList.hasOwnProperty(event.target.dataset.m_id)) {
            const options = messageContextList[event.target.dataset.m_id];
            if (options) {
                hideContextMenu();
                showContextMenu(event.pageX, event.pageY, options);
            }
        }

        if (event.target.classList && !event.target.classList.contains('message') && event.target.id && messageContextList.hasOwnProperty(event.target.id)) {
            const options = messageContextList[event.target.id];
            if (options) {
                hideContextMenu();
                showContextMenu(event.pageX, event.pageY, options);
            }
        }
    });
}

function createChannelsContext(channel_id) {
    let context = {};
    context[ChannelsActionType.MARK_AS_READ] = { action: () => readCurrentMessages() };
    context[ChannelsActionType.COPY_LINK] = { action: () => copyChannelLink(currentGuildId, channel_id) };
    context[ChannelsActionType.MUTE_CHANNEL] = { action: () => muteChannel(channel_id) };
    context[ChannelsActionType.NOTIFY_SETTINGS] = { action: () => showNotifyMenu(channel_id) };

    if (isSelfAuthor()) {
        context[ChannelsActionType.EDIT_CHANNEL] = { action: () => editChannel(channel_id) };
        context[ChannelsActionType.DELETE_CHANNEL] = { action: () => deleteChannel(channel_id, currentGuildId) };
    }

    if (isDeveloperMode) {
        context[ActionType.COPY_ID] = { action: () => copyId(channel_id) };
    }

    return context;
}

function createMessageContext(message_id, user_id) {
    let context = {};

    context[MessagesActionType.ADD_REACTION] = { action: () => openReactionMenu(message_id) };

    if (user_id === currentUserId) {
        context[MessagesActionType.EDIT_MESSAGE] = { action: () => openEditMessage(message_id) };
    }

    if (isSelfAuthor() || (isOnDm && user_id === currentUserId)) {
        context[MessagesActionType.PIN_MESSAGE] = { action: () => pinMessage(message_id) };
    }

    context[MessagesActionType.REPLY] = { action: () => showReplyMenu(message_id, user_id) };
    context[MessagesActionType.MARK_AS_UNREAD] = { action: () => markAsUnread(message_id) };

    if (isSelfAuthor() || (isOnDm && user_id === currentUserId)) {
        context[MessagesActionType.DELETE_MESSAGE] = { action: () => deleteMessage(message_id) };
    }

    if (isDeveloperMode) {
        context[ActionType.COPY_ID] = { action: () => copyId(message_id) };
    }

    return context;
}

function createMenuItem(label, itemOptions) {
    const li = createEl('li', { textContent: label });
    li.addEventListener('click', function(event) {
        event.stopPropagation();
        hideContextMenu();
        if (itemOptions.action) {
            itemOptions.action();
        }
    });

    if (itemOptions.subOptions) {
        const subUl = createEl('ul');
        itemOptions.subOptions.forEach(subOption => {
            const subLi = createMenuItem(subOption.label, { action: subOption.action });
            subUl.appendChild(subLi);
        });
        li.appendChild(subUl);

        li.addEventListener('mouseenter', function() {
            const subMenu = li.querySelector('ul');
            subMenu.style.display = 'block';
            
            subMenu.style.left = '100%';
            subMenu.style.right = 'auto';
            
            const subRect = subMenu.getBoundingClientRect();
            const viewportWidth = window.innerWidth;

            if (subRect.right > viewportWidth) {
                subMenu.style.left = 'auto';
                subMenu.style.right = '100%';
            } else if (subRect.left < 0) { 
                subMenu.style.left = '0';
                subMenu.style.right = 'auto';
            }
        });

        li.addEventListener('mouseleave', function() {
            const subMenu = li.querySelector('ul');
            subMenu.style.display = 'none'; 
        });
    }

    return li;
}


function showContextMenu(x, y, options) {
    hideContextMenu();
    const tempContextMenu = createEl('div', { id: 'contextMenu', className: 'context-menu' });
    const ul = createEl('ul');
    for (const key in options) {
        if (options.hasOwnProperty(key)) {
            const itemOptions = options[key];
            const li = createMenuItem(key, itemOptions);
            ul.appendChild(li);
        }
    }
    tempContextMenu.appendChild(ul);
    document.body.appendChild(tempContextMenu);

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = tempContextMenu.offsetWidth;
    const menuHeight = tempContextMenu.offsetHeight;

    let left = Math.min(x, viewportWidth - menuWidth);
    let top = Math.min(y, viewportHeight - menuHeight);

    tempContextMenu.style.setProperty('--menu-left', `${left}px`);
    tempContextMenu.style.setProperty('--menu-top', `${top}px`);

    contextMenu = tempContextMenu;

    document.addEventListener('click', clickOutsideContextMenu);
}



function clickOutsideContextMenu(event) {
    if (contextMenu && !contextMenu.contains(event.target) && !contextList[event.target.id]) {
        hideContextMenu();
    }
}

function hideContextMenu() {
    if (contextMenu) {
        contextMenu.remove();
        contextMenu = null; // Reset contextMenu variable
        document.removeEventListener('click', clickOutsideContextMenu);
    }
}






//Pop ui
function createChannelsPop() {
    let isTextChannel = true;
    const newPopOuterParent = createEl('div',{className: 'outer-parent'});
    const newPopParent = createEl('div',{className:'pop-up',id:'createChannelPopContainer'});
    const title = `Kanal Oluştur`
    const sendText = "Sadece seçilen üyeler ve roller bu kanalı görüntüleyebilir.";

    const inviteTitle = createEl('p',{id:'create-channel-title', textContent:title});
    const popBottomContainer = createEl('div',{className:'popup-bottom-container',id:'create-channel-popup-bottom-container'});
    const sendInvText = createEl('p',{id:'create-channel-send-text', textContent:sendText});
    const closeBtn = createEl('button',{className:'popup-close', id:"invite-close-button",textContent:'X'});
    const newChannelPlaceHolder = 'yeni-kanal';
    const inviteUsersSendInput = createEl('input',{id:"create-channel-send-input",placeholder:newChannelPlaceHolder});
    inviteUsersSendInput.addEventListener('input', () => {
        const inputValue = inviteUsersSendInput.value.trim();
        toggleButtonState(inputValue !== ''); 
    });

    const channeltypetitle = createEl('p',{id:'create-channel-type', textContent:'KANAL TÜRÜ'});

    const hashText = `<svg class="icon_b545d5" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M10.99 3.16A1 1 0 1 0 9 2.84L8.15 8H4a1 1 0 0 0 0 2h3.82l-.67 4H3a1 1 0 1 0 0 2h3.82l-.8 4.84a1 1 0 0 0 1.97.32L8.85 16h4.97l-.8 4.84a1 1 0 0 0 1.97.32l.86-5.16H20a1 1 0 1 0 0-2h-3.82l.67-4H21a1 1 0 1 0 0-2h-3.82l.8-4.84a1 1 0 1 0-1.97-.32L15.15 8h-4.97l.8-4.84ZM14.15 14l.67-4H9.85l-.67 4h4.97Z" clip-rule="evenodd" class="foreground_b545d5"></path></svg>`
    const voiceText = `<svg class="icon_b545d5" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3a1 1 0 0 0-1-1h-.06a1 1 0 0 0-.74.32L5.92 7H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2.92l4.28 4.68a1 1 0 0 0 .74.32H11a1 1 0 0 0 1-1V3ZM15.1 20.75c-.58.14-1.1-.33-1.1-.92v-.03c0-.5.37-.92.85-1.05a7 7 0 0 0 0-13.5A1.11 1.11 0 0 1 14 4.2v-.03c0-.6.52-1.06 1.1-.92a9 9 0 0 1 0 17.5Z" class="foreground_b545d5"></path><path fill="currentColor" d="M15.16 16.51c-.57.28-1.16-.2-1.16-.83v-.14c0-.43.28-.8.63-1.02a3 3 0 0 0 0-5.04c-.35-.23-.63-.6-.63-1.02v-.14c0-.63.59-1.1 1.16-.83a5 5 0 0 1 0 9.02Z" class="foreground_b545d5"></path></svg>`;
    const channeltypetexticon = createEl('p',{id:'channel-type-icon',innerHTML:hashText});
    const channeltypevoiceicon = createEl('p',{id:'channel-type-icon',innerHTML:voiceText });
    const channeltypetexttitle = createEl('p',{id:'channel-type-title',textContent:'Metin'});
    const channeltypevoicetitle = createEl('p',{id:'channel-type-title',textContent:'Ses'});
    const channeltypetextdescription = createEl('p',{id:'channel-type-description',textContent:"Mesajlar, resimler, GIF'ler, emojiler, fikirler ve şakalar gönder"});
    const channeltypevoicedescription = createEl('p',{id:'channel-type-description',textContent:"Birlikte sesli veya görüntülü konuşun veya ekran paylaşın"});
    const channelnametitle = createEl('p',{id:'create-channel-name', textContent:'KANAL ADI'});
    const channelIcon = createEl('p',{id:'channel-icon',textContent:'#'});
    
    const textChannelContainer = createEl('div',{id:'create-channel-text-type'});
    const textChannelTitle = createEl('p',{id:'text-channel-title'});
    const voiceChannelTitle = createEl('p',{id:'voice-channel-title'});
    const voiceChannelContainer = createEl('div',{id:'create-channel-voice-type'});
    
    const specialchanHtml = `<svg class="switchIcon_b545d5" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="lightgray" fill-rule="evenodd" d="M6 9h1V6a5 5 0 0 1 10 0v3h1a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3Zm9-3v3H9V6a3 3 0 1 1 6 0Zm-1 8a2 2 0 0 1-1 1.73V18a1 1 0 1 1-2 0v-2.27A2 2 0 1 1 14 14Z" clip-rule="evenodd" class=""></path></svg>`;
    const specialChanIcon = createEl('div',{innerHTML:specialchanHtml,id:'special-channel-icon'});
    const specialChanText = createEl('div',{id:'special-channel-text', textContent:'Özel Kanal'  });
    const specialChanToggle = createEl('toggle',{id:'special-channel-text'});
    textChannelContainer.style.filter = 'brightness(1.5)';
    voiceChannelContainer.style.filter = 'brightness(1)';

    textChannelContainer.addEventListener('click', function() {
        isTextChannel = true;
        textChannelContainer.style.filter = 'brightness(1.5)';
        voiceChannelContainer.style.filter = 'brightness(1)';
    });
    
    voiceChannelContainer.addEventListener('click', function() {
        isTextChannel = false;
        textChannelContainer.style.filter = 'brightness(1)';
        voiceChannelContainer.style.filter = 'brightness(1.5)';
    });

    const popAcceptButton = createEl('button', {className: 'pop-up-accept',textContent:'Kanal Oluştur',style:"height:40px; width: 25%; top:93%;  left: 84%; font-size:14px; disabled=1; white-space:nowrap;"});
    popAcceptButton.addEventListener('click', function() {
        const inviteUsersSendInput = getId('create-channel-send-input');
        let newchanname = inviteUsersSendInput.value.replace(/^\s+/, '');;
        
        if (!newchanname) {
            newchanname = newChannelPlaceHolder;
        }
        const data = {
            'channel_name': newchanname,
            'guild_id': currentGuildId,
            'is_text_channel': isTextChannel
        };
        
        socket.emit('create_channel', data);
        isTextChannel = true;
        closePopUp(newPopOuterParent, newPopParent);
    });
    function toggleButtonState(isActive) {
        if (isActive) {
            popAcceptButton.classList.remove('inactive');
            popAcceptButton.classList.add('active');
        } else {
            popAcceptButton.classList.remove('active');
            popAcceptButton.classList.add('inactive');
        }
    }
    const popRefuseButton =  createEl('button', {className: 'pop-up-refuse',textContent:'İptal', style:"top: 93%; left:61%; font-size:14px;" });
    popRefuseButton.addEventListener('click',function(){
        isTextChannel = true;
        closePopUp(newPopOuterParent, newPopParent);
    });
    newPopParent.appendChild(specialChanIcon);
    newPopParent.appendChild(popAcceptButton);
    newPopParent.appendChild(specialChanText);
    newPopParent.appendChild(specialChanToggle);

    newPopParent.appendChild(popRefuseButton);

    textChannelContainer.appendChild(channeltypetexticon);
    voiceChannelContainer.appendChild(channeltypevoiceicon);

    textChannelContainer.appendChild(channeltypetexttitle);
    textChannelContainer.appendChild(channeltypetextdescription);
    voiceChannelContainer.appendChild(channeltypevoicetitle);
    voiceChannelContainer.appendChild(channeltypevoicedescription);

    newPopParent.appendChild(closeBtn);
    newPopParent.appendChild(inviteTitle);

    newPopParent.appendChild(channeltypetitle);
    newPopParent.appendChild(channelnametitle);
    newPopParent.appendChild(channelIcon);
    
    const centerWrapper = createEl('div',{id:'center-wrapper'});
    centerWrapper.appendChild(textChannelTitle);
    centerWrapper.appendChild(voiceChannelTitle);
    newPopParent.appendChild(centerWrapper);

    newPopParent.append(textChannelContainer );
    newPopParent.append(voiceChannelContainer );
    
    popBottomContainer.appendChild(sendInvText);
    popBottomContainer.appendChild(inviteUsersSendInput);
    newPopParent.appendChild(popBottomContainer);
    newPopOuterParent.style.display = 'flex';
    closeBtn.addEventListener('click',function(){
        closePopUp(newPopOuterParent, newPopParent);
    });
    
    newPopOuterParent.addEventListener('click',function(event){
        if (event.target === newPopOuterParent) {
            closePopUp(newPopOuterParent, newPopParent);
        }
    });

    newPopOuterParent.appendChild(newPopParent);
    document.body.appendChild(newPopOuterParent);
}
function drawProfilePop(userData) {
    const profileContainer = createEl('div',{id:'profile-container'});

    const discriminator = userData.discriminator;
    const profileTitle = createEl('p', { id: 'profile-title', textContent: getUserNick(userData.user_id) });
    const profileDiscriminator = createEl('p', { id: 'profile-discriminator', textContent:'#' + discriminator });
    profileContainer.appendChild(profileTitle);
    profileContainer.appendChild(profileDiscriminator);
    const aboutTitle = createEl('p', { id: 'profile-about-title', textContent: userData.user_id == currentUserId ? 'Hakkımda' : 'Hakkında'});
    const aboutDescription = createEl('p', { id: 'profile-about-description', textContent: userData.description });
    const popBottomContainer = createEl('div', { className: 'popup-bottom-container', id: 'profile-popup-bottom-container' });
    popBottomContainer.appendChild(aboutTitle);
    popBottomContainer.appendChild(aboutDescription);
    const popTopContainer = createEl('div', { className: 'popup-bottom-container', id: 'profile-popup-top-container' });
    const profileOptions = createEl('button',{id:userData.user_id, className:'profile-dots3'});
    const profileOptionsText = createEl('p',{className:'profile-dots3-text',textContent:'⋯'});
    profileOptions.appendChild(profileOptionsText);
    popTopContainer.appendChild(profileOptions);
    const profileImg = createEl('img',{id:'profile-display', });
    profileImg.addEventListener("mouseover", function() { this.style.borderRadius = '0px'; });
    profileImg.addEventListener("mouseout", function() { this.style.borderRadius = '50%'; });

    const profileOptionsContainer = createEl('div',{className: 'profile-options-container'});

    if(userData.user_id != currentUserId) {
        if(!isFriend(userData.user_id)) {
            const addFriendBtn = createEl('button', { className: 'profile-add-friend-button' });
            addFriendBtn.innerHTML = ` <div class="icon-container">${createAddFriSVG()}</div> Arkadaş Ekle`;
            function createAddFriSVG() {
                return `
                    <svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 24 24">
                        <path d="M19 14a1 1 0 0 1 1 1v3h3a1 1 0 0 1 0 2h-3v3a1 1 0 0 1-2 0v-3h-3a1 1 0 1 1 0-2h3v-3a1 1 0 0 1 1-1Z" fill="currentColor"></path>
                        <path d="M16.83 12.93c.26-.27.26-.75-.08-.92A9.5 9.5 0 0 0 12.47 11h-.94A9.53 9.53 0 0 0 2 20.53c0 .81.66 1.47 1.47 1.47h.22c.24 0 .44-.17.5-.4.29-1.12.84-2.17 1.32-2.91.14-.21.43-.1.4.15l-.26 2.61c-.02.3.2.55.5.55h7.64c.12 0 .17-.31.06-.36C12.82 21.14 12 20.22 12 19a3 3 0 0 1 3-3h.5a.5.5 0 0 0 .5-.5V15c0-.8.31-1.53.83-2.07ZM12 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" fill="white"></path>
                    </svg>
                `;
            }
            addFriendBtn.addEventListener('click', () => { addFriend(userData.user_id); });
            profileOptionsContainer.appendChild(addFriendBtn);
    
        } 
        const sendMsgBtn = createEl('button',{className:'profile-send-msg-button'});
        const sendMsgIco = createEl('div',{innerHTML:`
            <svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 22a10 10 0 1 0-8.45-4.64c.13.19.11.44-.04.61l-2.06 2.37A1 1 0 0 0 2.2 22H12Z" class=""></path></svg>
        `});
    
        sendMsgBtn.appendChild(sendMsgIco);
    
        sendMsgBtn.addEventListener('click', () => {
            loadMainMenu();
            OpenDm(userData.user_id);
            const profilePopContainer = getId('profilePopContainer');
            if(profilePopContainer) {
                profilePopContainer.parentNode.remove();
            }
        })
        profileOptionsContainer.appendChild(sendMsgBtn);

    }

    
    
    
    profileContainer.appendChild(profileOptionsContainer);
    setProfilePic(profileImg,userData.user_id);

    const bubble = createBubble(userData.is_online,true);
    profileImg.appendChild(bubble);

    appendToProfileContextList(userData,userData.user_id);
    profileOptions.addEventListener('click',function(event) { 
        showContextMenu(event.pageX, event.pageY,contextList[userData.user_id]);
    });
    profileImg.onload = function() {
        popTopContainer.style.backgroundColor = getAverageRGB(profileImg);
    };
    
    const contentElements = [popTopContainer,profileImg ,profileContainer, popBottomContainer];
    createPopUp({
        contentElements: contentElements,
        id: 'profilePopContainer'
    });
}



function createPopUp({contentElements, id, closeBtnId=null}) {
    const popOuterParent = createEl('div', { className: 'outer-parent' });
    const parentContainer = createEl('div', { className: 'pop-up', id: id });
    popOuterParent.style.display = 'flex';


    contentElements.forEach(element => parentContainer.appendChild(element));
    if(closeBtnId) {
        const closeBtn = createEl('button', { className: 'popup-close', id: closeBtnId, textContent: 'X' });
        parentContainer.appendChild(closeBtn);


        closeBtn.addEventListener('click', function() {
            console.log("Closing pop up.");
            closePopUp(popOuterParent, parentContainer);
        });

    }

    let isMouseDownOnPopOuter = false;

    popOuterParent.addEventListener('mousedown', function(event) {
        // Only set the flag if the mousedown occurred on the popOuterParent
        if (event.target === popOuterParent) {
            isMouseDownOnPopOuter = true;
        }
    });
    
    popOuterParent.addEventListener('mouseup', function(event) {
        // Only proceed with the click action if the mouse down started on popOuterParent
        if (isMouseDownOnPopOuter && event.target === popOuterParent) {
            console.log("Pop outer clicked!");
            closePopUp(popOuterParent, parentContainer);
        }
        // Reset the flag regardless of where the mouseup occurs
        isMouseDownOnPopOuter = false;
    });
    

    popOuterParent.appendChild(parentContainer);
    document.body.appendChild(popOuterParent);
    return popOuterParent;
}
function createInviteUsersPop() {
    const title = `Arkadaşlarını ${currentGuildName} sunucusuna davet et`;
    const sendText = "VEYA BİR ARKADAŞINA SUNUCU DAVETİ BAĞLANTISI YOLLA";
    const invitelink = `${window.location.protocol}//${window.location.hostname}/join-guild/${getCurrentInviteId()}`;

    const inviteTitle = createEl('p', { id: 'invite-users-title', textContent: title });
    const channelnamehash = createEl('p', { id: 'invite-users-channel-name-hash', innerHTML:textChanHtml });
    
    const channelNameText = createEl('p', { id: 'invite-users-channel-name-text', textContent: currentChannelName });
    const sendInvText = createEl('p', { id: 'invite-users-send-text', textContent: sendText });
    const inviteUsersSendInput = createEl('input', { id: 'invite-users-send-input', value: invitelink });

    const popBottomContainer = createEl('div', { className: 'popup-bottom-container', id: 'invite-popup-bottom-container' });
    popBottomContainer.appendChild(sendInvText);
    popBottomContainer.appendChild(inviteUsersSendInput);

    const contentElements = [inviteTitle, channelnamehash, channelNameText, popBottomContainer];

    createPopUp({
        contentElements: contentElements,
        id: 'inviteUsersPopContainer',
        closeBtnId: 'invite-close-button'
    });
}

function toggleDropdown() {
    if(!isOnGuild) { return }
    if (!isDropdownOpen) {
        isDropdownOpen = true;
        dropDown.style.display = 'flex'; 
        dropDown.style.animation = 'fadeIn 0.3s forwards'; 
        fillDropDownContent();
    } else {
        dropDown.style.animation = 'fadeOut 0.3s forwards'; 
        setTimeout(() => {
            dropDown.style.display = 'none'; 
            isDropdownOpen = false;
        }, 300); 
    }
}


function getMonthValue(query) {
    if (query.length === 0) return ['Not Specified'];

    const lowerCaseQuery = query.toLowerCase();
    
    const months = [
        'January',   // J
        'February',  // F
        'March',     // M
        'April',     // A
        'May',       // M
        'June',      // J
        'July',      // J
        'August',    // A
        'September', // S
        'October',   // O
        'November',  // N
        'December'   // D
    ];

    const matchingMonths = months.filter(month => month.toLowerCase().startsWith(lowerCaseQuery));

    return matchingMonths.length > 0 ? matchingMonths : ['Not Specified'];
}


function filterUsers(query) {
    const userSection = getId('userSection').querySelector('.search-content');
    const mentioningSection = getId('mentioningSection').querySelector('.search-content');
    const channelSection = getId('channelSection').querySelector('.search-content');
    const dateSection1 = getId('dateSection1').querySelector('.search-content');
    const dateSection2 = getId('dateSection2').querySelector('.search-content');
    const dateSection3 = getId('dateSection3').querySelector('.search-content');

    userSection.innerHTML = '';
    mentioningSection.innerHTML = '';
    channelSection.innerHTML = '';
    dateSection1.innerHTML = '';
    dateSection2.innerHTML = '';
    dateSection3.innerHTML = '';

    const users = getGuildUsers(); 
    if (!users) return;

    const filteredUsers = users.filter(user => user.name.toLowerCase().startsWith(query.toLowerCase())).slice(0, 3);

    filteredUsers.forEach(user => {
        userSection.innerHTML += `<div class=".search-button" onclick="handleUserClick('${user.name}')">
            <img src="${user.image}" alt="${user.name}" style="width: 20px; height: 20px; border-radius: 50%;"> ${user.name}
        </div>`;
        mentioningSection.innerHTML += `<div class=".search-button" onclick="handleUserClick('${user.name}')">
            Mentioning: <img src="${user.image}" alt="${user.name}" style="width: 20px; height: 20px; border-radius: 50%;"> ${user.name}
        </div>`;
    });

    if(currentChannels) {
        currentChannels.forEach(channel => {
            channelSection.innerHTML += `<div class=".search-button">${channel.channel_name}</div>`;
        });
    }

    const monthValue = getMonthValue(query);
    dateSection1.innerHTML += `<div class=".search-button">Before this date: ${monthValue}</div>`;
    dateSection2.innerHTML += `<div class=".search-button">During this date: ${monthValue}</div>`;
    dateSection3.innerHTML += `<div class=".search-button">After this date: ${monthValue}</div>`;
}


function displayDefaultContent() {
    const userSection = getId('userSection').querySelector('.search-content');
    const mentioningSection = getId('mentioningSection').querySelector('.search-content');
    const channelSection = getId('channelSection').querySelector('.search-content');
    const dateSection1 = getId('dateSection1').querySelector('.search-content');
    const dateSection2 = getId('dateSection2').querySelector('.search-content');
    const dateSection3 = getId('dateSection3').querySelector('.search-content');

    userSection.innerHTML = '<div class="button">No users found</div>';
    mentioningSection.innerHTML = '<div class="button">No mentions found</div>';
    channelSection.innerHTML = '<div class="button">Channel 1</div><div class="button">Channel 2</div><div class="button">Channel 3</div>';
    dateSection1.innerHTML = '<div class="button">Before this date: Not Specified</div><div class="button">During this date: Not Specified</div><div class="button">After this date: Not Specified</div>';
    dateSection2.innerHTML = '<div class="button">Before this date: Not Specified</div><div class="button">During this date: Not Specified</div><div class="button">After this date: Not Specified</div>';
    dateSection3.innerHTML = '<div class="button">Before this date: Not Specified</div><div class="button">During this date: Not Specified</div><div class="button">After this date: Not Specified</div>';
}

function handleUserClick(userName) {
    alert(`User ${userName} clicked!`);
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


//chat

function replaceCustomEmojis(message) {
    if(message) {
        const regex = /<:([^:>]+):(\d+)>/g;
        let message1 = message.replace(regex, (match, emojiName, emojiId) => {
            if (currentCustomEmojis.hasOwnProperty(emojiName)) {
                return `<img src="${getEmojiPath(currentCustomEmojis[emojiName])}" alt="${emojiName}" style="width: 64px; height: 38px; vertical-align: middle;" />`;
            } else {
                return match;
            }
        });
        return message1;
    }
    return message

}

function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
function handleReplies() {
    console.log(reply_cache);
    Object.values(reply_cache).forEach(message => {
        const replierElements = Array.from(chatContent.children).filter(element => element.dataset.reply_to_id == message.message_id);
        console.log(replierElements, message.replies);
        replierElements.forEach(replier => {
            message.replies.forEach(msg => {
                createReplyBar(replier, message.message_id, msg.user_id, msg.content, msg.attachment_urls);
                console.log("Creating replly bar.", replier, message.message_id, msg.user_id, msg.content);
            });
        });
    });
}


function deleteLocalMessage(message_id,guild_id,channel_id,is_dm) {
    if(isOnGuild && channel_id != currentChannelId || isOnDm && is_dm && channel_id != currentDmId) { 
        console.error("Can not delete message: ",guild_id,channel_id, message_id,  currentGuildId,  currentChannelId);
        return; 
    }
    const messages = Array.from(chatContent.children); 

    for (let i = 0; i < messages.length; i++) {
        let element = messages[i];
        if (!element.classList || !element.classList.contains('message')) { continue; }
        const user_id = element.dataset.user_id;
    
        if (String(element.id) == String(message_id)) {
            console.log("Removing element:", message_id);
            element.remove();
            const foundMsg = getMessage(false);
            if(foundMsg) {
                lastSenderID = foundMsg.dataset.user_id;
            }
        } // Check if the element matches the currentSenderOfMsg and it doesn't have a profile picture already
        else if (!element.querySelector('.profile-pic') && getBeforeElement(element).dataset.user_id != element.dataset.user_id) {
            console.log("Creating profile img...");
            const messageContentElement = element.querySelector('#message-content-element');
            const date = element.dataset.date;
            const smallDate = element.querySelector('.small-date-element');
            if(smallDate)  {
                smallDate.remove();
            }
            const nick = getUserNick(user_id);
            
            createProfileImageChat(element, messageContentElement, nick, user_id, date, true);
            break;
        }
    }
    const dateBars = chatContent.querySelectorAll('.dateBar');

    dateBars.forEach(bar => {
        if (bar === chatContent.lastElementChild) {
            bar.remove();
        }
    });


    if(chatContent.children.length < 2) {
        displayStartMessage();
    }
    
}
function getBeforeElement(element) {
    const elements = Array.from(chatContent.children);
    const index = elements.indexOf(element);
    if (index > 0) {
        return elements[index - 1];
    } else {
        return null;
    }
}


//channels
function isChannelMatching(channel_id,isTextChannel) {
    if(isTextChannel) {
        return currentChannelId == channel_id;
    } else {
        return currentVoiceChannelId == channel_id;
    }
}

function mouseHoverChannelButton(channelButton,isTextChannel,channel_id) {
    if(!channelButton) { return; }
    const contentWrapper = channelButton.querySelector('.content-wrapper');


    contentWrapper.style.display = 'flex';
    if(isTextChannel) {
        channelButton.style.backgroundColor = isChannelMatching(channel_id,isTextChannel) ? selectedChanColor : hoveredChanColor;
    } else {
        channelButton.style.backgroundColor = hoveredChanColor;
    }
    channelButton.style.color = 'white';
}
function hashChildElements(channelButton) {
    return channelButton.querySelector('.channel-users-container') != null;
}
function mouseLeaveChannelButton(channelButton,isTextChannel,channel_id) {
    if(!channelButton) { return; }
    const contentWrapper = channelButton.querySelector('.content-wrapper');
    const channelSpan = channelButton.querySelector('.channelSpan');



    if(channelSpan && !isTextChannel) {
        channelSpan.style.marginRight = hashChildElements(channelButton) ? '30px' : '100px';
    }
    if(contentWrapper) {
        if(!isTextChannel) {
            if(currentVoiceChannelId == channel_id) {
                contentWrapper.style.display = 'flex';
            } else {
                contentWrapper.style.display = 'none';
            }
            
        }  else {
            contentWrapper.style.display = 'none';
            
        }
    }
    if(isTextChannel) {
        channelButton.style.backgroundColor = isChannelMatching(channel_id,isTextChannel) ? selectedChanColor : 'transparent';
    } else {
        channelButton.style.backgroundColor = 'transparent';
        
    }
    channelButton.style.color = isChannelMatching(channel_id,isTextChannel) ? 'white' : 'rgb(148, 155, 164)';
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
function editChannelElement(channel_id, new_channel_name) {
    const existingChannelButton = channelsUl.querySelector(`li[id="${channel_id}"]`);
    if (!existingChannelButton) { return; }
    existingChannelButton.querySelector('channelSpan').textContent = new_channel_name;
}
function removeChannelElement(channel_id) {
    const existingChannelButton = channelsUl.querySelector(`li[id="${channel_id}"]`);
    if (!existingChannelButton) { return; }
    existingChannelButton.remove();
}
function createChannelElement(channel) {
    const channel_id = channel.channel_id;
    const channel_name = channel.channel_name;
    const isTextChannel = channel.is_text_channel;
    const last_read_datetime = channel.last_read_datetime;
    const existingChannelButton = channelsUl.querySelector(`li[id="${channel_id}"]`);
    if (existingChannelButton) { return; }
    const htmlToSet = isTextChannel ? textChanHtml : voiceChanHtml;
    const channelButton = createEl('li', { className: 'channel-button', id: channel_id });
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
    if(isSelfAuthor()) {
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
    appendToChannelContextList(channel_id);
    channelsUl.appendChild(channelButton);

    channelButton.addEventListener('mouseover', function(event) {
        if(event.target.id == channel_id) {
            mouseHoverChannelButton(channelButton, isTextChannel,channel_id);
        }
    });
    channelButton.addEventListener('mouseleave', function(event) {
        if(event.target.id == channel_id) {
            mouseLeaveChannelButton(channelButton, isTextChannel,channel_id);
        }
    });
    mouseLeaveChannelButton(channelButton, isTextChannel,channel_id);
    channelButton.addEventListener('click', function() {
        changeChannel(channel);
    });

    if (channel_id == currentChannelId) {
        changeChannel(channel);
    }


}
function resetKeydown() {
    isKeyDown = false;
}

function addChannel(channel) {
    console.log(typeof(channel), channel);
    currentChannels.push(channel);

    let guildChannels = channels_cache[channel.guild_id] ? JSON.parse(channels_cache[channel.guild_id]) : [];
    guildChannels.push(channel);
    channels_cache[channel.guild_id] = JSON.stringify(guildChannels);
    
    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('keyup', resetKeydown);
    createChannelElement(channel);
    if (currentChannels.length > 1) {
        document.addEventListener('keydown', handleKeydown);
        document.addEventListener('keyup', resetKeydown);
    }
}
function updateChannels(channels) {
    if (channels == null) { return; }
    let channelsArray;
    try {
        channelsArray = JSON.parse(channels);
    } catch (error) {
        console.error("Error parsing channels JSON:", error);
        return;
    }
    if (!Array.isArray(channelsArray) || channelsArray.length === 0) {
        console.log("Channels format is not recognized. Type: " + typeof channelsArray + channelsArray);
        return;
    }
    channelsUl.innerHTML = "";
    if(!isOnMe) {
        disableElement('dm-container-parent');
    }
    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('keyup', resetKeydown);
    channelsArray.forEach((channel) => {
        createChannelElement(channel);
    });
    currentChannels = channelsArray;
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


function removeChannel(data) {
    let cachedChannels = channels_cache[data.guild_id];
    let channelsArray = [];

    if (cachedChannels) {
        channelsArray = JSON.parse(cachedChannels);
        channelsArray = channelsArray.filter(channel => channel.channel_id !== data.channel_id);
        channels_cache[data.guild_id] = JSON.stringify(channelsArray);
    }

    currentChannels = channelsArray;
    removeChannelElement(data.channel_id);
    if(currentChannelId == data.channel_id) {
        const channelsArray = JSON.parse(channels_cache[currentGuildId])
        const firstChannel = channelsArray[0].channel_id;
        loadGuild(currentGuildId,firstChannel)
    }
}

function editChannel(data) {
    let cachedChannels = channels_cache[data.guild_id];
    let channelsArray = [];

    if (cachedChannels) {
        channelsArray = JSON.parse(cachedChannels);
        channelsArray.forEach((channel, index) => {
            if (channel.channel_id === data.channel_id) {
                editChannelElement(channel.channel_id,channel.channel_name);
            }
        });
    } else {
        channelsArray = [];
    }

    currentChannels = channelsArray;
}


//guilds
function createBlackImage() {
    const canvas = createEl('canvas');
    canvas.width = 50; 
    canvas.height = 50; 
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/png');
    return dataURL;
}

function updateGuildList(guildData) {
    if (!guildData) {
        console.warn("Tried to update guild list without data.");
        return;
    }

    currentGuildData = guildData;
    guildsList.innerHTML = "";

    const mainLogo = createEl('li');
    const mainLogoImg = createEl('img', {
        id: 'main-logo',
        src: '/static/images/icons/icon.png',
        'data-src': '/static/images/icons/icon.png',
        style: 'width: 30px; height: 30px; border: 10px solid rgb(49, 51, 56); user-select: none;'
    });
    mainLogoImg.addEventListener('mousedown', function() {
        mainLogoImg.style.transform = 'translateY(50px)';
    });

    mainLogoImg.addEventListener('mouseup', function() {
        mainLogoImg.style.transform = 'translateY(0)';
    });

    mainLogoImg.addEventListener('mouseleave', function() {
        mainLogoImg.style.transform = 'translateY(0)';
    });
    mainLogoImg.addEventListener('click',function() {
        clickMainLogo();
    });


    
    mainLogo.appendChild(mainLogoImg);
    guildsList.appendChild(mainLogo);

    guildData.forEach((guild) => {
        const existingGuild = getId(guild.id);
        if (existingGuild) {
            return;
        }
        const li = createEl('li');
        const img = createEl('img', { className: 'guilds-list' });
        const whiteRod = createEl('div', { className: 'white-rod' });
        const imgSrc = guild.src && guild.src != 'black' ? guild.src : createBlackImage();
        guildAuthorIds[guild.id] = guild.owner_id;
        img.src = imgSrc;
        li.appendChild(img);
        li.appendChild(whiteRod);

        img.id = guild.id;
        img.addEventListener('click', function () {
            loadGuild(guild.id,guild.first_channel_id,guild.name,)
        });
        
        guildsList.appendChild(li);

        guildNames[guild.id] = guild.name;
    });
    addKeybinds();
    
}



function appendToGuildList(guild) {
    const guildsList = getId('guilds-list'); 
    if (guildsList.querySelector(`#${guild.id}`)) { return; }
    const li = createEl('li');
    const img = createEl('img',{className : 'guilds-list'});
    img.src = guild.src;
    li.appendChild(img);
    const whiteRod = createEl('div',{className:'white-rod'});
    li.appendChild(whiteRod);
    img.id = guild.id;
    img.addEventListener('click', function () {
        loadGuild(guild.id,guild.first_channel_id,guild.name,)
    });

    guildsList.appendChild(li);
    guildNames[guild.id] = guild.name;

    addKeybinds();
}


function removeFromGuildList(guild_id) {
    const guildImg = getId(guild_id);
    if (guildImg && guildsList.contains(guildImg)) {
        const parentLi = guildImg.closest('li');
        if (parentLi) {
            parentLi.remove();
        }
    }
}

//Generic


function alertUser(subject, content) {
    const popUpSubject = createEl('h1', { className: 'pop-up-subject', textContent: subject });
    const popUpContent = createEl('p', { className: 'pop-up-content', textContent: content });

    const popAcceptButton = createEl('button', { className: 'pop-up-accept', textContent: 'Tamam' });
    const popRefuseButton = createEl('button', { className: 'pop-up-refuse', textContent: 'İptal' });

    const buttonContainer = createEl('div', { className: 'pop-button-container' });
    buttonContainer.appendChild(popAcceptButton);
    buttonContainer.appendChild(popRefuseButton);

    const contentElements = [popUpSubject, popUpContent, buttonContainer];

    popAcceptButton.addEventListener('click', function () {
        closePopUp(outerParent, outerParent.firstChild);
    });
    popRefuseButton.addEventListener('click', function () {
        closePopUp(outerParent, outerParent.firstChild);
    });

    outerParent = createPopUp({
        contentElements: contentElements,
        id: null 
    });
}

function askUser(subject, content, successText, acceptCallback, isRed = false) {
    const popUpSubject = createEl('h1', { className: 'pop-up-subject', textContent: subject });
    const popUpContent = createEl('p', { className: 'pop-up-content', textContent: content });
    const popAcceptButton = createEl('button', { className: 'pop-up-accept', textContent: successText });
    if (isRed) {
        popAcceptButton.style.backgroundColor = 'rgb(218, 55, 60)';
    }
    let outerParent;
    popAcceptButton.addEventListener('click', function () {
        acceptCallback();
        closePopUp(outerParent, outerParent.firstChild);
    });

    const popRefuseButton = createEl('button', { className: 'pop-up-refuse', textContent: 'İptal' });
    popRefuseButton.addEventListener('click', function () {
        closePopUp(outerParent, outerParent.firstChild);
    });

    const buttonContainer = createEl('div', { className: 'pop-button-container' });
    buttonContainer.appendChild(popAcceptButton);
    buttonContainer.appendChild(popRefuseButton);

    const contentElements = [popUpSubject, popUpContent, buttonContainer];

    outerParent = createPopUp({
        contentElements: contentElements,
        id: null 
    });
}



// party

const getCursorXY = (input, selectionPoint) => {
    const { offsetLeft: inputX, offsetTop: inputY, scrollLeft, scrollTop, clientWidth, clientHeight } = input;
    const div = createEl('div');


    div.style.position = 'absolute';
    div.style.whiteSpace = 'pre-wrap'; 
    div.style.wordWrap = 'break-word'; 
    div.style.visibility = 'hidden'; 
    div.style.overflow = 'hidden';
    div.style.top = `${inputY}px`;
    div.style.left = `${inputX}px`;
    div.style.padding = '10px 100px 10px 55px'; 
    div.style.fontFamily = 'Arial, Helvetica, sans-serif';
    div.style.backgroundColor = '#36393f'; 
    div.style.border = 'none'; 
    div.style.lineHeight = '20px'; 
    div.style.fontSize = '17px'; 
    div.style.borderRadius = '7px'; 
    div.style.boxSizing = 'border-box'; 
    div.style.maxHeight = '500px';
    div.style.width = 'calc(100vw - 585px)';
    const swap = '\u00A0'; 
    const inputValue = input.tagName === 'INPUT' ? input.value.replace(/ /g, swap) : input.value;
    const textNode = document.createTextNode(inputValue.substring(0, selectionPoint));
    div.appendChild(textNode);
    document.body.appendChild(div);
    const range = document.createRange();
    range.selectNodeContents(div);
    range.setStart(textNode, selectionPoint);
    range.setEnd(textNode, selectionPoint);
    const rect = range.getBoundingClientRect();
    const x = rect.left - inputX + scrollLeft + 5;
    const y = rect.top - inputY + scrollTop;
    document.body.removeChild(div);

    return {
        x: Math.min(x, clientWidth), 
        y: Math.min(y, clientHeight) 
    };
};

let isSnow = false;
let snowActive = false;

let particeContainer;
function enableSnowOnSettings() {
    if(isSnow) {
        enableSnow();
    } else {
        snowActive = false;
    }
}

function toggleSnow() {
    if(isSnow) {
        disableSnow();
    } else {
        isSnow = true;
        enableSnow();
    }
}
function disableSnow() {
    snowActive = false; 
    isSnow = false;
}
function disableSnowOnSettingsOpen() {
    snowActive = false;
}
let isParty = false;
function toggleParty() {
    isParty = !isParty;

    if (isParty) {
        enableBorderMovement(); // Start analyzing audio if party mode is enabled
    } else {
        stopAudioAnalysis(); // Stop analyzing audio if party mode is disabled
    }
}

function enableSnow() {
    particeContainer = getId('confetti-container');
    snowActive = true; 
    let skew = 1;

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    (function frame() {
        if (!snowActive) return; 

        skew = Math.max(0.8, skew - 0.001);

        confetti({
            particleCount: 1,
            startVelocity: 0,
            ticks: 300,
            origin: {
                x: Math.random(),
                y: (Math.random() * skew) - 0.2
            },
            colors: ['#ffff'],
            shapes: ['circle'],
            gravity: randomInRange(0.4, 0.6),
            scalar: randomInRange(0.4, 1),
            drift: randomInRange(-0.4, 0.4),
            particleContainer: particeContainer
        });

        requestAnimationFrame(frame); 
    }());
}

function popKeyboardConfetti() {
    const { x, y } = getCursorXY(userInput, userInput.selectionStart);
    const inputRect = userInput.getBoundingClientRect();
    
    let ratioY = y / window.innerHeight + 0.95;
    let ratioX = (inputRect.left + x) / window.innerWidth;

    if (ratioY > 1) {
        ratioY = 1;
    }
    if (ratioX < 0.2) {
        ratioX = 0.2;
    }

    setTimeout(() => {
        confetti({
            particleCount: 5,
            spread: 7,
            origin: { x: ratioX, y: ratioY },
            disableForReducedMotion: true
        });
    }, 0);
}


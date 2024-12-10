




let currentTimeout;
let isActivityShared = false;


let isUnread = false;
let wasNotChangingUrl = false;
let isImagePreviewOpen = false;
let closeCurrentJoinPop;
let guildsList;
let isOnGuild = false;



const MyAccount = "MyAccount";
const SoundAndVideo = "SoundAndVideo";
const Notifications = "Notifications";
const ActivityPresence = "ActivityPresence";
const Appearance = "Appearance";
let isSettingsOpen = false;
let isUnsaved = false;
let isChangedProfile = false;
let isChangedNick = false;
let isInitialized = false;
let shakeForce = 1;
let resetTimeout; 
let currentPopUp = null;

let microphoneButton = null;
let earphoneButton;
let isEmailToggled = false;

let logoClicked = 0;
let isGuildSettings = false;
let currentSettingsType = MyAccount;



const userListTitleHTML = `
<h1 id='nowonline' style="font-weight: bolder;">Şimdi Aktif</h1> <ul> </ul>
`;


function getId(string) { return document.getElementById(string);}
const createEl = (tag, options) => Object.assign(document.createElement(tag), options);






function clearCookies() {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
        const [name] = cookie.split('=');
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
}
function saveBooleanCookie(name, value) {
    value = value ? 1 : 0;
    const expires = new Date();
    expires.setTime(expires.getTime() + (365 * 24 * 60 * 60 * 1000));
    const expiresStr = `expires=${expires.toUTCString()}`;
    const cookieValue = encodeURIComponent(value);
    document.cookie = `${encodeURIComponent(name)}=${cookieValue}; ${expiresStr}; path=/`;
}

function loadBooleanCookie(name) {
    const cookieName = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
        if (cookie.startsWith(cookieName)) {
            const result = decodeURIComponent(cookie.substring(cookieName.length));
            return result == 1;
        }
    }
    return null;
}






function triggerFileInput() {
    getId('profileImage').click();
}
function triggerguildImageUpdate() {
    getId('guildImage').click();
}






function applySettings() {
    
    if(currentPopUp) {
        hideConfirmationPanel(currentPopUp);
        
    }
    console.log(isUnsaved);
    if(isUnsaved) {

        if(isGuildSettings) {
            changeGuildName();
            
            if(permissionManager.canManageGuild()) {
                uploadImage(true);
            }

        } else {
            // in default settings
            changeNickname();
            uploadImage(false);
        }


        isUnsaved = false;
    }

}




function onEditNick() {
    isUnsaved = true;
    if(!currentPopUp) {
        let _currentPopUp = generateConfirmationPanel();
        currentPopUp = _currentPopUp;

    }
    showConfirmationPanel(currentPopUp);
}

function removeguildImage() {
    socket.emit(EventType.DELETE_GUILD_IMAGE,{'guildId': currentGuildId})
    getId('guildImage').value = '';
    getId('guild-image').src = createBlackImage();
}









let changeNicknameTimeout;
function changeNickname() {
    const newNicknameInput = getId('new-nickname-input');
    const newNickname = newNicknameInput.value.trim();

    if (newNickname !== '' && !changeNicknameTimeout && newNickname != currentUserName) {

        console.log("Changed your nickname to: " + newNickname);
        userNick = newNickname;
        socket.emit('set_nick', {'nick' : newNickname});

        newNicknameInput.value = newNickname;
        changeNicknameTimeout = setTimeout(() => {
            changeNicknameTimeout = null;
        }, 1000);

    }
}

let changeGuildNameTimeout;
function changeGuildName() {
    const newGuildInput = getId('guild-overview-name-input');
    const newGuildName = newGuildInput.value.trim();
    if (newGuildName !== '' && !changeGuildNameTimeout && newGuildName != currentGuildName) {
        console.log("Changed guild name to: " + newGuildName);
        const objecttosend = {'' : newGuildName,'guildId' : currentGuildId};
        socket.emit('set_guild_name', objecttosend);
        const setInfoNick = getId('set-info-nick');
        if(setInfoNick) {
            setInfoNick.innerText = newGuildName;
        }
        newGuildInput.value = newGuildName;
        changeGuildNameTimeout = setTimeout(() => {
            changeGuildNameTimeout = null;
        }, 1000);
    }
}



async function requestMicrophonePermissions() {
    try {
        const isNoMic = false;
        if(isNoMic) {
            const response = await fetch('/static/notification.mp3');
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onload = function () {
                const bytes = new Uint8Array(reader.result);
                audioManager.emit('audio_data', bytes);
            };
            reader.readAsArrayBuffer(blob);
        }
        else
        {
            await sendAudioData();
        }
        
    } catch (error) {
        console.log(error);
        alertUser('MİKROFON ERİŞİMİ ENGELLENDİ', 'Mikrofon izni reddedildi.');
        return false;
    }
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
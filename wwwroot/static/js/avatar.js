let lastConfirmedProfileImg;
let lastConfirmedGuildImg;

function uploadImage(isGuild) {
    if (!isChangedProfile) { return; }
    
    let formData = new FormData();
    const uploadedGuildId = currentGuildId;
    const file = isGuild ? getId('guild-image').src : getId('settings-self-profile').src;
    
    console.log(file, isGuild);
    
    if (file && file.startsWith('data:image/')) {
        const byteString = atob(file.split(',')[1]);
        const mimeString = file.split(',')[0].split(':')[1].split(';')[0];
        const ab = new Uint8Array(byteString.length);
        
        for (let i = 0; i < byteString.length; i++) {
            ab[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([ab], { type: mimeString });
        
        if (blob.size <= 8 * 1024 * 1024) {
            formData.append('photo', blob, 'profile-image.png');
            
            if (isGuild) {
                formData.append('guildId', uploadedGuildId);
            }
            
            console.log("Sending req...");
            let xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/upload_img');
            xhr.onload = function () {
                if (xhr.status === 200) {
                    if(isGuild) {
                        updateGuild(uploadedGuildId);
                        lastConfirmedGuildImg = file;
                    } else {
                        updateSelfProfile(currentUserId,user_name,true);
                        lastConfirmedProfileImg = file;
                    }
                } else {
                    console.error('Error uploading profile pic!');
                }
            };
            xhr.onerror = function() {
                if(isGuild) {
                    getId('guild-image').src = lastConfirmedGuildImg 
                } else {
                    getId('settings-self-profile').src = lastConfirmedProfileImg;
                }
            }
            xhr.send(formData);
        } else {
            alertUser('Dosya boyutu 8 MB\'den büyük olamaz!');
            getId('profileImage').value = ''; 
        }
    } else {
        console.error('Invalid file format or undefined file.');
    }
}
function onEditImage(isGuild) {
    if(!isCropieInitialized) { return }
    const filedata = getId(isGuild ? 'guildImage':'profileImage').files[0];
    if (!filedata) {
        console.log("No file. ", isGuild)
        return;
    }
    console.log("On edit image." , isGuild)
    const reader = new FileReader();
    reader.onload = (e) => {
        function callbackAfterAccept(outputBase64) {
            console.log("Callback triggered!", isGuild)
            if(isGuild) {
                lastConfirmedGuildImg =  getBase64Image(getId('guild-image'))
            } else {
                lastConfirmedProfileImg =  getBase64Image(getId('settings-self-profile'))
            }
            getId(isGuild ? 'guild-image' : 'settings-self-profile').src = outputBase64;
            isChangedProfile = true;
            if(!currentPopUp) {
                let _currentPopUp = generateConfirmationPanel();
                currentPopUp = _currentPopUp;
            }
            
            showConfirmationPanel(currentPopUp);
        }
        createCropPop(e.target.result,callbackAfterAccept);
        
    };
    reader.onerror = (error) => {
        console.error("Error reading file:", error);
    };
    reader.readAsDataURL(filedata);
    getId(isGuild ? 'guildImage':'profileImage').value = '';
    
    isUnsaved = true;

}

function onEditProfile() {
    onEditImage(false);
}
function onEditGuildProfile() {
    onEditImage(true);
}

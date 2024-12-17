let fileInput;
let currentReplyingTo = '';
let chatInput ;

let fileImagePreview;
let typingTimeout;
let chatContainer;
let chatContent;

function initialisechatInput() {

    chatInput.addEventListener('input', adjustHeight);
    chatInput.addEventListener('keydown', handleUserKeydown);

    chatInput.addEventListener('input', (event) => {
        updateUserMentionDropdown(event.target.value);
    });

    chatInput.addEventListener('keydown', (event) => {
        const options = userMentionDropdown.querySelectorAll('.mention-option');
        if (event.key === 'ArrowDown') {
            currentSearchUiIndex = (currentSearchUiIndex + 1) % options.length;
            highlightOption(currentSearchUiIndex);
            event.preventDefault(); 
        } else if (event.key === 'ArrowUp') {
            currentSearchUiIndex = (currentSearchUiIndex - 1 + options.length) % options.length;
            highlightOption(currentSearchUiIndex);
            event.preventDefault(); 
        } else if (event.key === 'Enter') {
            if (currentSearchUiIndex >= 0 && currentSearchUiIndex < options.length) {
                const selectedUserId = options[currentSearchUiIndex].dataset.userid;
                const selectedUserNick = options[currentSearchUiIndex].textContent;
                selectMember(selectedUserId, selectedUserNick);
            }
        } else if (event.key === 'Escape') {
            userMentionDropdown.style.display = 'none'; 
        }
    });
}
let replyCloseButton;
function showReplyMenu(replyToMsgId,replyToUserId) {

    replyCloseButton.style.display = "flex";
    replyInfo.textContent = getUserNick(replyToUserId) + ' kişisine yanıt veriliyor';
    replyInfo.style.display = 'flex';
    currentReplyingTo = replyToMsgId;
    chatInput.classList.add('reply-opened')
    
}

function closeReplyMenu() {
    if(replyCloseButton) replyCloseButton.style.display = "none";
    if(replyInfo) replyInfo.style.display = 'none';
    currentReplyingTo = '';
    chatInput.classList.remove('reply-opened')
}


function adjustHeight() {
    chatInput.style.height = 'auto';
    chatInput.style.height = (chatInput.scrollHeight) + 'px';

    let chatInputHeight = chatInput.scrollHeight;
    chatInput.scrollTop = chatInput.scrollHeight - chatInput.clientHeight;
    if(chatInputHeight > 500)  {
        return;
    }
    chatContainer.style.height = `calc(87vh - ${chatInputHeight-60}px)`;

    if(chatInputHeight == 60) {
        chatInput.style.paddingTop = '-5px';
        chatInput.style.height = '45px';
    }

    const elementHeight = parseInt(chatInput.style.height, 10);
    const topPosition = elementHeight;
    if(replyInfo) replyInfo.style.bottom = `${topPosition}px`;


}
function extractUserIds(message) {
    const userIds = [];
    const regex = /@(\w+)/g;
    let match;
    while ((match = regex.exec(message)) !== null) {
        const userId = getUserIdFromNick(match[1]);
        if (userId) {
            userIds.push(userId);
        }
    }
    return userIds;
}


async function handleUserKeydown(event) {
    
    if (chatInput.value !== '') {
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }
        typingTimeout = setTimeout(() => {
            socket.emit('start_writing', {
                'channelId': isOnDm ? currentDmId : currentChannelId,
                'guildId': currentGuildId,
                'isDm': isOnDm
            });
        }, 1000);
    }
    if (event.key === 'Enter' && event.shiftKey) {
        event.preventDefault();
        let startPos = chatInput.selectionStart;
        let endPos = chatInput.selectionEnd;
        chatInput.value = chatInput.value.substring(0, startPos) + '\n' + chatInput.value.substring(endPos);
        chatInput.selectionStart = chatInput.selectionEnd = startPos + 1;
        const difference = chatContainer.scrollHeight - (chatContainer.scrollTop + chatContainer.clientHeight)
        console.log(difference);
        if(difference < 10) {
            scrollToBottom();
        }
        chatInput.dispatchEvent(new Event('input'));
    } else if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); 
        const message = chatInput.value;
        const userIdsInMessage = extractUserIds(message);
        await sendMessage(message,userIdsInMessage );
        adjustHeight();
    }
    if(isParty && isDomLoaded) {
        popKeyboardConfetti();
    }
}



// upload media

const maxFiles = 8;
let fileList = [];
function handleFileInput(eventOrFiles = null) {
    let filesToProcess;
    if (eventOrFiles instanceof Event) {
        filesToProcess = Array.from(eventOrFiles.target.files);
    } else if (eventOrFiles instanceof FileList || eventOrFiles instanceof Array) {
        filesToProcess = Array.from(eventOrFiles);
    } else {
        filesToProcess = [eventOrFiles];
    }
    filesToProcess = filesToProcess.filter(file => file instanceof Blob && file.size <= 50 * 1024 * 1024);
    if (fileList.length + filesToProcess.length > maxFiles) {
        filesToProcess = filesToProcess.slice(0, maxFiles - fileList.length);
    }

    filesToProcess.forEach(file => {
        fileList.push(file);
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = createEl('img', {
                style: 'max-width: 256px; max-height: 256px; margin-right: 10px;',
                src: e.target.result
            });
            fileImagePreview.appendChild(img);
            enableElement("image-preview");
            img.addEventListener('click', function() {
                displayImagePreview(img.src);
            });
        };
        reader.readAsDataURL(file);
    });
    if (fileList.length > maxFiles) {
        fileList = fileList.slice(0, maxFiles);
    }
    updateFileImageBorder();
}
function setDropHandler() {
    const dropZone = getId('drop-zone');
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            const dataTransfer = e.dataTransfer;
            if (dataTransfer && dataTransfer.types.includes('text/plain')) {
                dropZone.style.display = 'flex';
            }
            dropZone.classList.add('hover');
        }, false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            if (e.type === 'drop') {
                const dataTransfer = e.dataTransfer;
                if (dataTransfer && dataTransfer.types.includes('text/plain')) {
                    const droppedText = dataTransfer.getData('text/plain');
                    if (droppedText.length < 2000) {
                        dropZone.style.display = 'none';
                    }
                }
            } else if (e.type === 'dragleave') {
                if (!dropZone.contains(e.relatedTarget)) {
                    dropZone.style.display = 'none';
                }
            }
            dropZone.classList.remove('hover');
        }, false);
    });
    dropZone.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        let dt = e.dataTransfer;
        let files = dt.files;
        if (files.length) {
            handleFileInput(files); 
        }
    }
    let fileButton  = getId('file-button');

    fileButton.addEventListener('click', function() {
        fileInput.click();
    });
    fileInput.addEventListener('change', handleFileInput);
}
function updateFileImageBorder() {
    
    if (fileImagePreview.children.length === 0) {
        fileImagePreview.style.border = 'none';
    } else {
        fileImagePreview.style.border = '20px solid #2b2d31';
    }
}
let replyInfo;

function initializeChatComponents() {
    replyInfo = getId("reply-info");
    replyCloseButton = getId("reply-close-button");
    fileImagePreview = getId('image-preview');
    chatContainer = getId('chat-container');
    chatContent = getId('chat-content');
    chatContentInitHtml = chatContent.innerHTML;

    fileInput = getId('fileInput');


}
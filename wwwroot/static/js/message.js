async function sendMessage(content, user_ids) {
    if (content == '') { return }
    if(isOnDm && currentDmId && !isFriend(currentDmId) && !hasSharedGuild(currentDmId)) {
        displayCannotSendMessage(content);
        return;
    }
    let channelIdToSend = isOnDm ? currentDmId : currentChannelId;

    setTimeout(() => {
        scrollToBottom();
    }, 10);

    if (fileInput.files.length < 1) {
        const message = {
            guildId: currentGuildId,
            channelId: channelIdToSend,
            content: content,
            attachmentUrls: null,
            replyToId: null,
            reactionEmojisIds: null,
            lastEdited: null
        };
        socket.emit('new_message', message);
        chatInput.value = '';
        closeReplyMenu();
        return;
    } 
    
    try {
        const file = fileInput.files[0];
        fileInput.value = '';
        const formData = new FormData();
        formData.append('file', file);
        formData.append('guildId', currentGuildId);
        formData.append('channelId',channelIdToSend)
        const uploadResponse = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            data.file_name = uploadData.file_name;
            data.type = uploadData.type;
            data.attachment_urls = uploadData.attachment_urls;
            data.attachment_id = uploadData.attachment_id;
            console.log('File uploaded successfully:', data.file_name);
            if(isOnGuild) {
                socket.emit('new_message', data);
            } else {
                alertUser('Implement Direct messages ');
            }
            
            chatInput.value = '';
            closeReplyMenu();
            fileImagePreview.innerHTML = '';
            
        } else {
            console.error('Failed to upload file:', uploadResponse.statusText);
        }
        
    } catch (error) {
        console.error('Error Sending File Message:', error);
    }

};
function replaceCustomEmojis(message) {
    let currentCustomEmojis = {};
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
function displayWelcomeMessage(userName,date) {
    const newMessage = createEl('div',{className : 'message'});
    const messageContentElement = createEl('div', {id:'message-content-element'});
    const authorAndDate = createEl('div');
    authorAndDate.classList.add('author-and-date');
    const nickElement = createEl('span');
    nickElement.textContent = userName;
    nickElement.classList.add('nick-element');
    authorAndDate.appendChild(nickElement);
    const dateElement = createEl('span');
    dateElement.textContent = getFormattedDate(new Date(date));
    dateElement.classList.add('date-element');
    authorAndDate.appendChild(dateElement);
    newMessage.appendChild(authorAndDate);
    newMessage.appendChild(messageContentElement);
    chatContent.appendChild(newMessage);
    console.log(newMessage.parentNode);
}
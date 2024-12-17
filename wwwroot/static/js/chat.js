
let bottomestChatDateStr;
let lastMessageDate = null; 
let currentLastDate;
let lastSenderID = '';

let unknownReplies = [];

let isLastMessageStart = false;
let chatContentInitHtml;


let isReachedChannelEnd = false;
let isOldMessageCd = false;

const CLYDE_ID = '1';

function createNonProfileImage(newMessage,  date) {
    const messageDate = new Date(date);
    const smallDateElement = createEl('p');
    smallDateElement.className = 'small-date-element';
    smallDateElement.textContent = getFormattedDateForSmall(messageDate);
    newMessage.appendChild(smallDateElement);
    smallDateElement.style.position = 'absolute'; 
    smallDateElement.style.marginLeft = '5px'; 

    return smallDateElement;
}

//reply&options button on message
function createMsgOptionButton(message,isReply) {
    const textc = isReply ? '↪' : '⋯'; 
    
    const newButton = createEl('button',{className:'message-button'});

        const textEl = createEl('div', { textContent: textc, className: 'message-button-text' });
        newButton.appendChild(textEl);
    if(isReply) {
        newButton.onclick = function() {
            showReplyMenu(message.id,message.dataset.userId);
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
function createOptions3Button(message,messageId,userId) {
    const button = createMsgOptionButton(message,false);
    button.dataset.m_id = messageId;
    appendToMessageContextList(messageId,userId);
}



async function handleScroll() {
    if (loadingScreen.style.display === 'flex') {  return; }

    const tenPercentHeight = window.innerHeight * 0.1;
    if (chatContainer.scrollTop <= tenPercentHeight && !isOldMessageCd && chatContent.children.length > 0) {
        isOldMessageCd = true;
        console.log('Fetching old messages...');
        try {
            let continueLoop = true;
            while (continueLoop) {
                if (chatContainer.scrollTop <= tenPercentHeight) {
                    await getOldMessagesOnScroll();
                } else {
                    continueLoop = false;
                    console.log('Scroll position exceeded threshold.');
                }
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } catch (error) {
            console.error('Error fetching old messages:', error);
        } finally {
            isOldMessageCd = false;
            console.log('Fetching complete. Resetting flag.');
        }
    }
}


function createProfileImageChat(newMessage, messageContentElement, nick, userId, date, isBot, isAfterDeleting=false,replyBar) {
    if(!messageContentElement) {
        console.error('No msg content element. ', replyBar); return;
    }
    const profileImg = createEl('img', { className: 'profile-pic', id: userId });
    setProfilePic(profileImg,userId);
    
    profileImg.style.width = '40px';
    profileImg.style.height = '40px';
    profileImg.dataset.userId = userId;
    appendToProfileContextList(userId);

    profileImg.addEventListener("mouseover", function() { this.style.borderRadius = '0px'; });
    profileImg.addEventListener("mouseout", function() { this.style.borderRadius = '25px'; });

    const authorAndDate = createEl('div');
    authorAndDate.classList.add('author-and-date');
    const nickElement = createEl('span');
    nickElement.textContent = nick;
    nickElement.classList.add('nick-element');
    if(isBot) {
        const botSign = createEl('span',{className: 'botSign'});
        authorAndDate.appendChild(botSign);
    }
    authorAndDate.appendChild(nickElement);
    const messageDate = new Date(date);
    const dateElement = createEl('span');
    dateElement.textContent = getFormattedDate(messageDate);
    dateElement.classList.add('date-element');
    authorAndDate.appendChild(dateElement);
    if(replyBar) {
        newMessage.appendChild(profileImg);
        newMessage.appendChild(authorAndDate);

        newMessage.appendChild(messageContentElement);
        
        const mediaElement = newMessage.querySelector('.imageElement');
        if(mediaElement) {
            messageContentElement.appendChild(mediaElement);
        }
        if(replyBar ) {
            newMessage.insertBefore(replyBar, newMessage.firstChild);
        }
        newMessage.classList.add('replier');
    } else {
        
        if (isAfterDeleting) {
            newMessage.appendChild(profileImg);
            newMessage.appendChild(authorAndDate);
            newMessage.appendChild(messageContentElement);
            const mediaElement = newMessage.querySelector('.imageElement');
            if(mediaElement && messageContentElement) {
                messageContentElement.appendChild(mediaElement);
            }
    
        } else {
            newMessage.appendChild(profileImg);
            newMessage.appendChild(authorAndDate);

            newMessage.appendChild(messageContentElement);

            
        }
    }
    setProfilePic(profileImg,userId);

    
    messageContentElement.classList.add('onsmallprofile');

    
}



function displayChatMessage(data) {
    if (!data) return;
    console.log(data.content);

    const messageId = data.messageId;
    const userId = data.userId;
    const content = data.content;
    const channelId = data.channelId;
    let date = data.date;
    const last_edited = data.lastEdited;
    const attachment_urls = data.attachmentUrls;
    const reply_to_id = data.replyToId;
    const reaction_emojis_ids = data.reactionEmojisIds;
    const addToTop = data.addToTop;
    const isBot = data.isBot;
    const replyOf = data.replyOf;

    if(currentMessagesCache[messageId])  {
        console.log("Skipping adding message:", content);
        return;
    }
    if (!channelId || !date ) {return; }
    if (!attachment_urls && content == ''){ return; }



    const nick = getUserNick(userId);
    const newMessage = createEl('div',{className : 'message'});
    const messageContentElement = createEl('p', {id:'message-content-element'});

    currentMessagesCache[messageId] = newMessage;
    messages_raw_cache[messageId] = data;
    
    let isCreatedProfile = false;
    if (addToTop) {
        if(willDisplayProfile) {
            isCreatedProfile = true;
            createProfileImageChat(newMessage, messageContentElement, nick, userId, date, isBot);
        } else {
            createNonProfileImage(newMessage, date);
        }
    } else {
        const currentDate = new Date(date).setHours(0, 0, 0, 0); 
        if (lastMessageDate === null || lastMessageDate !== currentDate) {
            createDateBar(currentDate);
            lastMessageDate = currentDate;
        }
        let difference = new Date(bottomestChatDateStr).getTime() - new Date(date).getTime();
        difference = Math.abs(difference) / 1000;
        let isTimeGap = false;
        if (bottomestChatDateStr && difference > 300) {
            isTimeGap = true;
        }
        
        if(!lastSenderID || isTimeGap || reply_to_id) {
            isCreatedProfile = true;
            createProfileImageChat(newMessage, messageContentElement, nick, userId, date, isBot);
        }
        else {
            if (lastSenderID != userId || isTimeGap) {
                isCreatedProfile = true;
                createProfileImageChat(newMessage, messageContentElement, nick, userId, date, isBot);
            } else {
                createNonProfileImage(newMessage, date);
            }
        }
        bottomestChatDateStr = date;
    }
    let formattedMessage = replaceCustomEmojis(content);
    if (isURL(content)) {formattedMessage = '';  }
    messageContentElement.style.position = 'relative';
    messageContentElement.style.wordBreak = 'break-all';
    newMessage.id = messageId;
    newMessage.dataset.userId =  userId;
    newMessage.dataset.date =  date;
    newMessage.dataset.content =  content;
    newMessage.dataset.attachment_urls = attachment_urls;
    newMessage.dataset.reply_to_id = reply_to_id;
    newMessage.dataset.messageId = messageId;
    messageContentElement.dataset.content_observe = formattedMessage;
    observer.observe(messageContentElement);
    newMessage.appendChild(messageContentElement);
    createMediaElement(content, messageContentElement,newMessage, attachment_urls);
    if(currentLastDate) {
        if(date < currentLastDate) {
            date = currentLastDate;
        }
    } else {
        currentLastDate = date;
    }

    if (!addToTop) { 
        lastSenderID = userId;
    } else {
        lastTopSenderId = userId;
    }
    if(userId != currentUserId) {
        createMsgOptionButton(newMessage,true);
    }
    createOptions3Button(newMessage,messageId,userId);
    if(isLastMessageStart) {isLastMessageStart = false; }
    if (addToTop) {
        chatContent.insertBefore(newMessage, chatContent.firstChild);
        chatContainer.scrollTop = chatContainer.scrollTop + newMessage.clientHeight;
    } else {
        chatContent.appendChild(newMessage);
        const previousSibling = newMessage.previousElementSibling
        if(previousSibling) {
            const previousMsgContent = previousSibling.querySelector('#message-content-element');
            if (isCreatedProfile && previousMsgContent && previousMsgContent.classList.contains('onsmallprofile')) {
                newMessage.classList.add('profile-after-profile');
            }

        }
    }

    if(userId == CLYDE_ID) {
        const youCanSeeText = createEl('p',{textContent : 'Bunu sadece sen görebilirsin.'});
        youCanSeeText.style.fontSize = '12px';
        youCanSeeText.style.color = 'rgb(148, 155, 164)';

        const parentElement = createEl('div',{display:'flex', flexDirection: 'column',zIndex: 1});
        parentElement.style.height = '100%';

        parentElement.appendChild(messageContentElement);

        parentElement.appendChild(youCanSeeText)
        newMessage.appendChild(parentElement);
    }




    if(replyOf == messageId) {
        setTimeout(() => {
            scrollToMessage(newMessage);
        }, 0);
    }
    if(reply_to_id) {
        const foundReply = getId(reply_to_id);
        if(foundReply) {
            createReplyBar(newMessage, foundReply.dataset.messageId,foundReply.dataset.userId,foundReply.dataset.content,foundReply.dataset.attachment_urls);
        } 
        else {
            unknownReplies.push(data);    
        }
        return foundReply;
    }
    
}

function scrollToElement(scrollContainer, targetChild) {
    if (!(scrollContainer instanceof HTMLElement) || !(targetChild instanceof HTMLElement)) {
        console.error('Invalid arguments: Both arguments must be valid HTML elements.');
        return;
    }
    const targetRect = targetChild.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();
    const targetCenterY = targetRect.top + targetRect.height / 2;
    const containerCenterY = containerRect.top + containerRect.height / 2;
    const scrollTop = scrollContainer.scrollTop + (targetCenterY - containerCenterY);
    scrollContainer.scrollTo({
        top: scrollTop,
        left: scrollContainer.scrollLeft,
        behavior: 'smooth' 
    });

}
function scrollToMessage(messageToScroll) {
    scrollToElement(chatContainer,messageToScroll);
    messageToScroll.style.transition = 'background-color 0.5s ease-in-out;';
    setTimeout(() => {
        scrollToElement(chatContainer,messageToScroll);
        messageToScroll.classList.remove('blink');
        messageToScroll.classList.add('blink');
        setTimeout(() => {
            messageToScroll.classList.remove('blink');
            messageToScroll.style.transition = '';
        }, 2000); 
    }, 100); 
}
function createDateBar(currentDate) {
    const formattedDate = new Date(currentDate).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    const datebar = createEl('span',{className:'dateBar', textContent:formattedDate});
    chatContent.appendChild(datebar);
}



function displayCannotSendMessage(failedMessageContent) {
    if(!isOnDm) { return }
    const failedId = createRandomId();
    const failedMessage = {
        messageId: failedId,
        userId : currentUserId,
        content : failedMessageContent,
        channelId : currentDmId,
        date : createNowDate(),
        addToTop: false

    }
    chatInput.value = '';
    displayChatMessage(failedMessage);
    const failedMsg = getId(failedId);
    if(failedMsg) {
        const foundMsgContent = failedMsg.querySelector('#message-content-element')
        if (foundMsgContent) {
            foundMsgContent.classList.add('failed');
        }
    }


    const textToSend = 'Mesajın iletilemedi. Bunun nedeni alıcıyla herhangi bir sunucu paylaşmıyor olman veya alıcının sadece arkadaşlarından direkt mesaj kabul ediyor olması olabilir.';
    const cannotSendMsg = {
        messageId: createRandomId(),
        userId: CLYDE_ID,
        content: textToSend,
        channelId: currentDmId,
        date: createNowDate(),
        last_edited: '',
        attachment_urls: '',
        addToTop: false,
        reply_to_id: '',
        reaction_emojis_ids: '',
        replyOf: '',
        isBot : true,
        willDisplayProfile: true
    };
    
    displayChatMessage(cannotSendMsg);
    scrollToBottom();
}

function displayStartMessage() {

    if(!isOnDm) {
        let isGuildBorn = false;
        if (currentGuildData && currentGuildData[currentGuildId]) {
            const rootChan = currentGuildData[currentGuildId].RootChannel;
            if (rootChan && currentChannelId == rootChan) {
                isGuildBorn = true;
            }
        }
        if(chatContent.querySelector('.startmessage') || chatContent.querySelector('#guildBornTitle')) { return; }
        const message = createEl('div',{className:'startmessage'});
        const titleToWrite = isGuildBorn ? `${currentGuildName}` : `#${currentChannelName} kanalına hoş geldin!`;
        const msgtitle = createEl('h1',{id:isGuildBorn ? 'guildBornTitle' : 'msgTitle',textContent:titleToWrite});
        const startChannelText = `#${currentChannelName} kanalının doğuşu!`;
        const startGuildText =  `Bu, sunucunun başlangıcıdır.`;
        const textToWrite = isGuildBorn  ? startGuildText : startChannelText; 
        const channelicon = createEl('div',{className:'channelIcon'});
        const channelHTML = `<svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="42" height="42" fill="rgb(255, 255, 255)" viewBox="0 0 24 24"><path fill="var(--white)" fill-rule="evenodd" d="M10.99 3.16A1 1 0 1 0 9 2.84L8.15 8H4a1 1 0 0 0 0 2h3.82l-.67 4H3a1 1 0 1 0 0 2h3.82l-.8 4.84a1 1 0 0 0 1.97.32L8.85 16h4.97l-.8 4.84a1 1 0 0 0 1.97.32l.86-5.16H20a1 1 0 1 0 0-2h-3.82l.67-4H21a1 1 0 1 0 0-2h-3.82l.8-4.84a1 1 0 1 0-1.97-.32L15.15 8h-4.97l.8-4.84ZM14.15 14l.67-4H9.85l-.67 4h4.97Z" clip-rule="evenodd" class=""></path></svg>`
        channelicon.innerHTML = channelHTML;
        const msgdescription = createEl('div',{id:isGuildBorn ? 'guildBornDescription' : 'msgDescription',textContent:textToWrite});
        
    
        if(!isGuildBorn)  {
            message.appendChild(channelicon);
            message.appendChild(msgtitle);
            msgtitle.appendChild(msgdescription);
        } else {
            const guildBornParent = createEl('div',{id : 'guildBornTitle-wrapper'});
            guildBornParent.appendChild(msgtitle);
            const guildBornFinishText = createEl('p',{id : 'guildBornTitle',textContent : 'klanına hoşgeldin!'});
            guildBornParent.appendChild(guildBornFinishText);
            guildBornParent.appendChild(msgdescription);
            message.appendChild(guildBornParent);
        }
        chatContent.insertBefore(message, chatContent.firstChild); 
        isLastMessageStart = true;
        scrollToBottom();
        
    } else {
        if(chatContent.querySelector('.startmessage')) { return; }
        const message = createEl('div',{className:'startmessage'});
        const titleToWrite = getUserNick(currentDmId);
        const msgtitle = createEl('h1',{id:'msgTitle',textContent:titleToWrite});
        const startChannelText = `Bu ${getUserNick(currentDmId)} kullanıcısıyla olan direkt mesaj geçmişinin başlangıcıdır.`;
        const profileImg = createEl('img',{className:'channelIcon'});
        setProfilePic(profileImg,currentDmId);
        const msgdescription = createEl('div',{id:'msgDescription',textContent:startChannelText});
        
    

        message.appendChild(profileImg);
        message.appendChild(msgtitle);
        msgtitle.appendChild(msgdescription);
        
        chatContent.insertBefore(message, chatContent.firstChild); 
        isLastMessageStart = true;
    }
}




function handleOldMessagesResponse(data) {
    const { history, oldest_message_date } = data

    if (!Array.isArray(history) || history.length === 0) {
        isReachedChannelEnd = true
        displayStartMessage()
        return
    }

    const repliesList = new Set()
    const oldestMessageDateOnChannel = new Date(oldest_message_date)

    let firstMessageDate = null

    history.forEach((msgData) => {
        const msg = new Message(msgData)
        const displayMessageData = msg.toDisplayData(data.messageId)

        const foundReply = displayChatMessage(displayMessageData)

        if (foundReply) repliesList.add(msg.messageId)

        if (!firstMessageDate || msg.date < firstMessageDate) {
            firstMessageDate = msg.date
        }
    })

    fetchReplies(history, repliesList)

    if (
        !isNaN(firstMessageDate) &&
        firstMessageDate.getTime() === oldestMessageDateOnChannel.getTime()
    ) {
        displayStartMessage()
    } else if (isNaN(oldestMessageDateOnChannel)) {
        console.error('Invalid oldest message date from data.')
    }
}

function handleHistoryResponse(data) {
    if (isChangingPage) {
        console.log('Changing page. Ignoring history response.')
        return
    }

    isLastMessageStart = false
    currentMessagesCache = {}

    const { messages, channelId, guildId, oldestMessageDate } = data

    if (!Array.isArray(messages) || messages.length === 0) {
        displayStartMessage()
        return
    }

    if (guildId !== currentGuildId) console.warn('History guild ID is different from current guild')
    if (channelId !== currentChannelId)
        console.warn('History channel ID is different from current channel')

    cacheInterface.setMessages(channelId, guildId, messages)

    const firstMessageDateOnChannel = new Date(oldestMessageDate)
    const repliesList = new Set()

    setTimeout(() => {
        messages.forEach((msgData) => {
            const msg = new Message(msgData)
            const foundReply = displayChatMessage(msg)

            if (foundReply) {
                repliesList.add(msg.messageId)
                unknownReplies.pop(msg.messageId)
            }
        })
    }, 5)

    fetchReplies(messages, repliesList)

    setTimeout(scrollToBottom, 20)

    if (
        messages[0]?.Date &&
        new Date(messages[0].Date).getTime() === firstMessageDateOnChannel.getTime()
    ) {
        displayStartMessage()
    }
}


let messageDates = {};

let replyIdToGo = "";
function fetchReplies(messages, repliesList=null,goToOld=false) {
    if(!repliesList) { repliesList = new Set()}
    if(goToOld) {
        const messageId = messages;
        const existingDate = messageDates[messageId];
        if(existingDate) { 
            if(existingDate > currentLastDate) {
                replyIdToGo = messageId;
                getOldMessages(existingDate,messageId);
            }

            return 
        }
        const data = {
            'messageId' : messageId,
            'guildId' : currentGuildId, 
            'channelId' : currentChannelId
        }
        socket.emit('get_message_date',data);
        return;
    }
    const messagesArray = Array.isArray(messages) ? messages : [messages];

    const replyIds = messagesArray
        .filter(msg => !repliesList.has(msg.messageId) && !replyCache[msg.messageId])
        .filter(msg => msg.reply_to_id !== undefined && msg.reply_to_id !== null && msg.reply_to_id !== '')
        .map(msg => msg.reply_to_id);

    if (replyIds.length > 0) {
        const data = {
            ids: replyIds,
            guildId: currentGuildId,
            channelId: currentChannelId
        };
        socket.emit('get_bulk_reply', data);
    }
}



function getMessageFromChat(top = true) {
    const messages = Array.from(chatContent.children);
    const filteredMessages = messages.filter(message => message.classList.contains('message'));


    if (filteredMessages.length === 0) return null;

    if (top) {
        return filteredMessages.reduce((topmost, current) => 
            current.offsetTop < topmost.offsetTop ? current : topmost, 
            filteredMessages[0]
        );
    } else {
        return filteredMessages[filteredMessages.length - 1];
    }
}


function getMessageDate(top=true) {
    const messages = chatContent.children;
    if (messages.length === 0) return null;

    let targetElement = getMessageFromChat(top);
    if (targetElement) {
        const dateGathered = targetElement.getAttribute('data-date');
        const parsedDate = new Date(dateGathered);
        const formattedDate = formatDate(parsedDate);
        return formattedDate;
    } else {
        return null;
    }
}



function updateChatWidth() {
    if (getId('user-list').style.display == 'none') {
        getId('user-input').classList.add('user-list-hidden');
        getId('gifbtn').classList.add('gifbtn-user-list-hidden');
        getId('emojibtn').classList.add('emojibtn-user-list-hidden');
    } else {
        getId('user-input').classList.remove('user-list-hidden');
        getId('gifbtn').classList.remove('gifbtn-user-list-hidden');
        getId('emojibtn').classList.remove('emojibtn-user-list-hidden');
    }
}


let hasJustFetchedMessages;
function getOldMessagesOnScroll() {
    if(isReachedChannelEnd || isOnMe) { return; }
    if(hasJustFetchedMessages) { return; }
    const oldestDate = getMessageDate();
    if (!oldestDate) return;
    if(oldestDate == '1970-01-01 00:00:00.000000+00:00') { return; }
    getOldMessages(oldestDate);
}

function getOldMessages(date,messageId=null) {
    let data = {
        date: date.toString(),
        isDm : isOnDm
    }
    if(messageId) {
        data['messageId'] = messageId;
    }

    data['channelId'] = isOnDm ? currentDmId : currentChannelId;
    if(isOnGuild) {
        data['guildId'] = currentGuildId;
    }
    socket.emit('get_old_messages',data);
    hasJustFetchedMessages = setTimeout(() => {
        hasJustFetchedMessages = null;
    }, 1000);
}




function getHistoryFromOneChannel(channelId, isDm = false) {
    console.log('Retrieving history...');
    const messages = cacheInterface.getMessages(channelId);

    if (!isDm && messages && Array.isArray(messages)) {
        let repliesList = new Set();

        if (messages.length > 0) {
            currentMessagesCache = {};
            for (const msg of messages) {
                const foundReply = displayChatMessage(msg);
                if (foundReply) {
                    repliesList.add(msg.messageId);
                }
            }
            fetchReplies(messages, repliesList);
            return; 

        } else {
            console.warn('No messages found in cache for this channel.');
        }
    }

    fetchMessagesFromServer(channelId, isDm);
}

function fetchMessagesFromServer(channelId, isDm = false) {
    let requestData = {
        channelId: channelId,
        isDm: isDm,
    };
    if (isOnGuild) {
        requestData['guildId'] = currentGuildId;
    }

    hasJustFetchedMessages = setTimeout(() => {
        hasJustFetchedMessages = null;
    }, 1000);

    socket.emit('get_history', requestData);
}



function createChatScrollButton() {
    let scrollButton = getId('scroll-to-bottom');
    
    if(!chatContainer) chatContainer = getId('chat-container');
    chatContainer.addEventListener('scroll', function() {
        let threshold = window.innerHeight;
        let hiddenContent = chatContainer.scrollHeight - (chatContainer.scrollTop + chatContainer.clientHeight);
        if (hiddenContent > threshold) {
            scrollButton.style.display = 'flex'; 
        } else {
            scrollButton.style.display = 'none';
        }
    });
    scrollButton.addEventListener('click', function() {
        scrollButton.style.display = 'none';
        scrollToBottom();
    });
}




function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
function handleReplies() {
    Object.values(replyCache).forEach(message => {
        const replierElements = Array.from(chatContent.children).filter(element => element.dataset.reply_to_id == message.messageId);
        console.log(replierElements, message.replies);
        replierElements.forEach(replier => {
            message.replies.forEach(msg => {
                createReplyBar(replier, message.messageId, msg.userId, msg.content, msg.attachment_urls);
                console.log("Creating replly bar.", replier, message.messageId, msg.userId, msg.content);
            });
        });
    });
}


function deleteLocalMessage(messageId,guildId,channelId,isDm) {
    if(isOnGuild && channelId != currentChannelId || isOnDm && isDm && channelId != currentDmId) { 
        console.error("Can not delete message: ",guildId,channelId, messageId,  currentGuildId,  currentChannelId);
        return; 
    }
    const messages = Array.from(chatContent.children); 

    for (let i = 0; i < messages.length; i++) {
        let element = messages[i];
        if (!element.classList || !element.classList.contains('message')) { continue; }
        const userId = element.dataset.userId;
    
        if (String(element.id) == String(messageId)) {
            console.log("Removing element:", messageId);
            element.remove();
            const foundMsg = getMessageFromChat(false);
            if(foundMsg) {
                lastSenderID = foundMsg.dataset.userId;
            }
        } // Check if the element matches the currentSenderOfMsg and it doesn't have a profile picture already
        else if (!element.querySelector('.profile-pic') && getBeforeElement(element).dataset.userId != element.dataset.userId) {
            console.log("Creating profile img...");
            const messageContentElement = element.querySelector('#message-content-element');
            const date = element.dataset.date;
            const smallDate = element.querySelector('.small-date-element');
            if(smallDate)  {
                smallDate.remove();
            }
            const nick = getUserNick(userId);
            
            createProfileImageChat(element, messageContentElement, nick, userId, date, true);
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
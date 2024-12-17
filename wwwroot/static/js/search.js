let channelSearchInputElement;

let currentSearchUiIndex = -1;
function updateUserMentionDropdown(value) {
    const mentionRegex = /@\w*/g;
    const match = value.match(mentionRegex);
    if (match && match.length) {
        const lastMention = match[match.length - 1];
        if (lastMention) {
            const currentUsers = isOnGuild ? guildCache.getMembers(currentGuildId) : getCurrentDmFriends();
            if (!currentUsers) return;

            const usersArray = Object.values(currentUsers);
            
            const filteredUsers = usersArray.filter(user => user.name.toLowerCase().startsWith(lastMention.slice(1).toLowerCase()));

            if (filteredUsers.length) {
                userMentionDropdown.innerHTML = filteredUsers.map(user => `
                    <div class="mention-option" data-userid="${user.userId}" onclick="selectUser('${user.userId}', '${user.name}')">
                        ${user.name}
                    </div>
                `).join('');
                userMentionDropdown.style.display = 'block';
                currentSearchUiIndex = -1; 
                highlightOption(0);
            } else {
                userMentionDropdown.style.display = 'none';
            }
        }
    } else {
        userMentionDropdown.style.display = 'none';
    }
}
function highlightOption(index) {
    const options = userMentionDropdown.querySelectorAll('.mention-option');
    options.forEach(option => option.classList.remove('mention-highlight'));
    if (index >= 0 && index < options.length) {
        options[index].classList.add('mention-highlight');
    }
}

function selectUser(userId, userNick) {
    const message = chatInput.value;
    const position = chatInput.selectionStart;
    const newMessage = message.slice(0, position - message.length) + `@${userNick} ` + message.slice(position);
    chatInput.value = newMessage;
    userMentionDropdown.style.display = 'none'; 
    chatInput.focus(); 
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

function handleUserClick(userName) {
    alert(`User ${userName} clicked!`);
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



function onFocusInput() {
    const dropdown = getId('search-dropdown');
    dropdown.classList.remove('hidden');
    channelSearchInputElement.style.width = '225px'; 
}


function onBlurInput() {
    const dropdown = getId('search-dropdown');
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.search-container')) {
            dropdown.classList.add('hidden');
        }
    });
}
function onInputSearchInput() {
    const dropdown = getId('search-dropdown');
    dropdown.classList.remove('hidden');
    channelSearchInputElement.style.width = '225px';

    if (channelSearchInputElement.value.length > 0) {
        dropdown.classList.remove('hidden');
        channelSearchInputElement.style.width = '225px'; 
    }

    
    const query = channelSearchInputElement.value.toLowerCase();
    if (query) {
        filterUsers(query);
    } else {
        displayDefaultContent();
    }


}

function addChannelSearchListeners() {
    channelSearchInputElement = getId('channelSearchInput');;
    document.addEventListener('click', (event) => {
        if (!event.target.closest('#channelSearchInput')) {
            const searchDropdown = getId('search-dropdown');
            searchDropdown.classList.add('hidden');
            if(!channelSearchInputElement.value.trim()) {
                channelSearchInputElement.style.width = '150px';
            }
        }
    });
}
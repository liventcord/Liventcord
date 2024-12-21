//TODO: make emojibtn use previews
let mediaMenuContainer, mediaMenu;
let isMediaMenuOpen = false;
let currentMenuType = '';

let isResizing = false;
let initialX, initialY, initialWidth, initialHeight;
let initialLeft, initialTop;
let resizingTop, resizingBottom, resizingLeft, resizingRight;

let direction = '';






function onMouseMove(e) {
    if (!isResizing) return;

    let dx = e.clientX - initialMouseX;
    let dy = e.clientY - initialMouseY;

    let newWidth = initialWidth - dx; 
    let newHeight = initialHeight - dy; 

    let viewportWidth = window.innerWidth / 1.7;
    let viewportHeight = window.innerHeight / 1.2;

    newWidth = Math.max(300, newWidth);
    newHeight = Math.max(300, newHeight); 

    if (resizingLeft) {
        newWidth = Math.max(100, newWidth);
        mediaMenu.style.width = newWidth + 'px';
    } else if (resizingRight) {
        mediaMenu.style.width = newWidth + 'px';  
    }

    if (resizingTop) {
        newHeight = Math.max(100, newHeight);
        mediaMenu.style.height = newHeight + 'px';
    } else if (resizingBottom) {
        mediaMenu.style.height = newHeight + 'px'; 
    }

    mediaMenu.style.width = Math.min(viewportWidth, newWidth) + 'px';
    mediaMenu.style.height = Math.min(viewportHeight, newHeight) + 'px';
}

function onMouseUp() {
    if (isResizing) {
        isResizing = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.userSelect = '';
    }
}


function displayContent(contentData, type) {
    mediaMenuContainer.innerHTML = '';

    if (type === 'gif') {
        contentData.forEach(data => {
            const img = createEl('img', { className: `${type}-content`, src: data.preview });
            console.log(type,img);
            img.addEventListener('click', () => {
                toggleMediaMenu();
                sendMessage(data[type]);
            });
            mediaMenuContainer.appendChild(img);
        });
    } else {
        mediaMenuContainer.innerHTML = getEmojiPanel();
    }
}

function renderEmojis(container) {
    const spriteSheetWidth = 3360;
    const spriteSheetHeight = 3120;
    const spriteWidth = 80;
    const spriteHeight = 80;
    const columns = Math.floor(spriteSheetWidth / spriteWidth);
    const rows = Math.floor(spriteSheetHeight / spriteHeight);
    const totalEmojis = rows * columns;
    container.innerHTML = '';

    for (let i = 0; i < totalEmojis; i++) {
        const row = Math.floor(i / columns);
        const col = i % columns;
        const x = -(col * spriteWidth);
        const y = -(row * spriteHeight);
        const emoji = createEl('div', {
            className: 'emoji',
            style: {
                backgroundPosition: `${x}px ${y}px`,
                width: `${spriteWidth}px`,
                height: `${spriteHeight}px`,
            }
        });

        container.appendChild(emoji);
    }
}


function updateMediaPanelPosition() {
    const mediaMenu = getId('media-menu');
    if(mediaMenu) {
        mediaMenu.className = !isUsersOpenGlobal ? "users-open" : "" ;
    }
}

function getEmojiPanel() {
    const emojiPanel = createEl('div', { id: 'emoji-panel' });
    const emojisContainer = createEl('div', { className: 'emojis-container' });
    renderEmojis(emojisContainer);
    emojiPanel.appendChild(emojisContainer);
    return emojiPanel.outerHTML;
}

function openMediaMenu() {
    mediaMenu.style.display = 'block';
}

function toggleMediaMenu() {
    isMediaMenuOpen ? closeMediaMenu() : openMediaMenu();
    isMediaMenuOpen = !isMediaMenuOpen;
}




function closeMediaMenu() {
    mediaMenu.style.display = 'none';
    isMediaMenuOpen = false;
    currentMenuType = '';
}

async function loadGifContent(searchBar) {
    const query = searchBar.value;
    if (!query) {
        mediaMenuContainer.innerHTML = '';
        return;
    }
    const gifWorkerUrl = `https://liventcord-gif-worker.efekantunc0.workers.dev?q=${encodeURIComponent(query)}`;
    const response = await fetch(gifWorkerUrl);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    if (data.error) throw new Error(`API error: ${data.error}`);

    const gifElements = data.results.map(result => ({
        gif: result.media_formats.gif.url,
        preview: result.media_formats.tinygif.url,
    }));
    displayContent(gifElements, 'gif');
}

function toggleEmojis(isTop) {
    if (!isTop && currentMenuType === 'emoji') {
        closeMediaMenu();
    } else {
        currentMenuType = 'emoji';
        displayContent([], 'emoji');
        openMediaMenu();
    }
}

function toggleGifs(isTop) {
    console.log(isTop,currentMenuType);
    if (!isTop && currentMenuType === 'gif') {
        closeMediaMenu();
    } else {
        currentMenuType = 'gif';
        loadGifContent(getId('mediaMenuSearchbar'));
        openMediaMenu();
    }
}
function initialiseMedia() {
    const searchBar = getId('mediaMenuSearchbar');
    mediaMenu = getId('media-menu');
    mediaMenuContainer = getId('media-menu-container');

    searchBar.addEventListener('keydown', debounce(async () => {
        await loadGifContent(searchBar);
    }, 300));

    document.body.addEventListener('click', event => {
        if (mediaMenu && isMediaMenuOpen && !mediaMenu.contains(event.target) && event.target.id !== 'basebtn') {
            closeMediaMenu();
        }
    });

    getId('emojibtntop').addEventListener('click', ()=>{toggleEmojis(true)});
    getId('gifbtn').addEventListener('click', toggleGifs);
    getId('emojibtn').addEventListener('click', toggleEmojis);
    getId('gifbtntop').addEventListener('click', ()=>{toggleGifs(true)});

    mediaMenu.addEventListener('mousedown', (e) => {
        initialX = e.clientX;
        initialY = e.clientY;
        initialWidth = mediaMenu.offsetWidth;
        initialHeight = mediaMenu.offsetHeight;
    
        resizingLeft = e.offsetX < 10;
        resizingRight = e.offsetX > mediaMenu.offsetWidth - 10;
        resizingTop = e.offsetY < 10;
        resizingBottom = e.offsetY > mediaMenu.offsetHeight - 10;
    
        if (resizingLeft || resizingRight || resizingTop || resizingBottom) {
            isResizing = true;
            initialMouseX = e.clientX;
            initialMouseY = e.clientY;
            document.body.style.userSelect = 'none'; 
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }
    });
    
}
document.addEventListener('DOMContentLoaded', initialiseMedia);
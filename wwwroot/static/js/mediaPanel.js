//TODO: make emojibtn use previews
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

function renderEmojis(container) {
    const spriteWidth = 80;
    const spriteHeight = 80;
    const columns = Math.floor(3360 / spriteWidth);
    const rows = Math.floor(3120 / spriteHeight);
    const totalEmojis = columns * rows - 24;

    const fragment = document.createDocumentFragment(); 

    for (let i = 0; i < totalEmojis; i++) {
        const row = Math.floor(i / columns);
        const col = i % columns;
        const x = -(col * spriteWidth);
        const y = -(row * spriteHeight);

        const emoji = document.createElement('div');
        emoji.className = 'emoji';
        emoji.style.backgroundPosition = `${x}px ${y}px`;

        fragment.appendChild(emoji);
    }

    container.innerHTML = ''; 
    container.appendChild(fragment);
}


function getEmojiPanel() {
    const emojiPanel = createEl('div', { id: 'emoji-panel' });
    const emojisContainer = createEl('div', {
        className: 'emojis-container',
        style: {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center', 
        }
    });

    renderEmojis(emojisContainer);
    emojiPanel.appendChild(emojisContainer);
    return emojiPanel.outerHTML;
}




function updateMediaPanelPosition() {
    const mediaMenu = getId('media-menu');
    if(mediaMenu) {
        mediaMenu.className = !isUsersOpenGlobal ? "users-open" : "" ;
    }
}
function handleMediaPanelResize() {
    let viewportWidth = window.innerWidth / 1.7;
    let viewportHeight = window.innerHeight / 1.2;
    mediaMenu.style.width = Math.min(viewportWidth, parseInt(mediaMenu.style.width) || 480) + 'px';
    mediaMenu.style.height = Math.min(viewportHeight, parseInt(mediaMenu.style.height) || 453) + 'px';
}


async function loadGifContent(n) {
    const query = getId('mediaMenuSearchbar').value;
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

async function loadGifContent() {
    const query = getId('mediaMenuSearchbar').value;
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





let isMediaMenuOpen = false;
let currentMenuType = '';
let mediaMenu, mediaMenuContainer;

function toggleMediaMenu() {
    if (isMediaMenuOpen) {
        console.log("Closing media menu");
        mediaMenu.style.display = 'none';
        isMediaMenuOpen = false;
    } else {
        console.log("Opening media menu");
        mediaMenu.style.display = 'block';
        isMediaMenuOpen = true;
    }
}

function displayContent(contentData, type) {
    mediaMenuContainer.innerHTML = '';

    if (type === 'gif') {
        if (contentData.length === 0) {
            // Show base GIF if no specific GIFs are loaded
            const baseGif = createEl('img', { className: 'gif-content', src: 'path/to/base.gif' });
            mediaMenuContainer.appendChild(baseGif);
        } else {
            // Show actual GIFs
            contentData.forEach(data => {
                const img = createEl('img', { className: `${type}-content`, src: data.preview });
                img.addEventListener('click', () => {
                    toggleMediaMenu();
                    sendMessage(data[type]);
                });
                mediaMenuContainer.appendChild(img);
            });
        }
    } else if (type === 'emoji') {
        mediaMenuContainer.innerHTML = getEmojiPanel();
    }
}

function toggleGifs(isTop) {
    console.log("Toggle gifs - Start");

    if (currentMenuType === 'gif') {
        console.log("Gif content is already open and being closed");
        toggleMediaMenu(); // Close if already showing gifs
    } else {
        currentMenuType = 'gif';
        loadGifContent(); // Load GIF content from an API or source
        if (!isMediaMenuOpen) {
            console.log("Media menu is closed, opening it for gif content");
            toggleMediaMenu(); // Ensure menu opens if closed
        }
    }

    console.log("Toggle gifs - End");
}

function toggleEmojis(isTop) {
    console.log("Toggle emojis - Start");

    if (currentMenuType === 'emoji') {
        console.log("Emoji content is already open and being closed");
        toggleMediaMenu(); // Close if already showing emojis
    } else {
        console.log("Switching to emoji content");
        currentMenuType = 'emoji';
        mediaMenuContainer.innerHTML = getEmojiPanel();

        if (!isMediaMenuOpen) {
            console.log("Media menu is closed, opening it for emoji content");
            toggleMediaMenu(); // Ensure menu opens if closed
        } else {
            console.log("Media menu is already open, no need to open again");
        }
    }

    console.log("Toggle emojis - End");
}

function loadGifContent() {
    console.log("Loading GIF content...");

    const gifs = [
        { preview: 'path/to/gif1.gif' },
        { preview: 'path/to/gif2.gif' },
        { preview: 'path/to/gif3.gif' },
    ];

    displayContent(gifs, 'gif'); 
}

function initialiseMedia() {
    mediaMenu = getId('media-menu');
    mediaMenuContainer = getId('media-menu-container');

    mediaMenu.style.display = 'none';
    const searchBar = getId("mediaMenuSearchbar");

    searchBar.addEventListener('keydown', debounce(async () => {
        await loadGifContent();
    }, 300));


    getId('emojibtntop').addEventListener('click', (e) => {
        console.log("Clicked on emoji button");
        toggleEmojis(false);
        e.stopPropagation();  // Prevent click from propagating to the body
    });
    getId('gifbtn').addEventListener('click', (e) => {
        console.log("Clicked on gif button");
        toggleGifs(false);
        e.stopPropagation();  // Prevent click from propagating to the body
    });
    getId('emojibtn').addEventListener('click', (e) => {
        console.log("Clicked on emoji button");
        toggleEmojis(false);
        e.stopPropagation();  // Prevent click from propagating to the body
    });
    getId('gifbtntop').addEventListener('click', (e) => {
        console.log("Clicked on gif button");
        toggleGifs(true);
        e.stopPropagation();  // Prevent click from propagating to the body
    });

    document.body.addEventListener('click', (event) => {
        if (mediaMenu && isMediaMenuOpen && !mediaMenu.contains(event.target) && event.target.id !== 'basebtn') {
            console.log("Clicked outside, closing media menu");
            toggleMediaMenu(); // Close menu if clicking outside
        }
    });
    

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

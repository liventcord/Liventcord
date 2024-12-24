//TODO: make emojibtn use previews
let isResizing = false;
let initialX, initialY, initialWidth, initialHeight;
let initialLeft, initialTop;
let resizingTop, resizingBottom, resizingLeft, resizingRight;
const exampleTenorId = "LIVDSRZULELA";
let isMediaMenuOpen = false;
let currentMenuType = "";
let mediaMenu, mediaMenuContainer;
let direction = "";






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
        mediaMenu.style.width = newWidth + "px";
    } else if (resizingRight) {
        mediaMenu.style.width = newWidth + "px";
    }

    if (resizingTop) {
        newHeight = Math.max(100, newHeight);
        mediaMenu.style.height = newHeight + "px";
    } else if (resizingBottom) {
        mediaMenu.style.height = newHeight + "px";
    }

    mediaMenu.style.width = Math.min(viewportWidth, newWidth) + "px";
    mediaMenu.style.height = Math.min(viewportHeight, newHeight) + "px";
}

function onMouseUp() {
    if (isResizing) {
        isResizing = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.userSelect = "";
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

        const emoji = document.createElement("div");
        emoji.className = "emoji";
        emoji.style.backgroundPosition = `${x}px ${y}px`;

        fragment.appendChild(emoji);
    }

    container.innerHTML = ""; 
    container.appendChild(fragment);
}


function getEmojiPanel() {
    const emojiPanel = createEl("div", { id: "emoji-panel" });
    const emojisContainer = createEl("div", {
        className: "emojis-container",
        style: {
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center", 
        }
    });

    renderEmojis(emojisContainer);
    emojiPanel.appendChild(emojisContainer);
    return emojiPanel.outerHTML;
}




function updateMediaPanelPosition() {
    const mediaMenu = getId("media-menu");
    if(mediaMenu) {
        mediaMenu.className = !isUsersOpenGlobal ? "users-open" : "" ;
    }
}
function handleMediaPanelResize() {
    let viewportWidth = window.innerWidth / 1.7;
    let viewportHeight = window.innerHeight / 1.2;
    mediaMenu.style.width = Math.min(viewportWidth, parseInt(mediaMenu.style.width) || 480) + "px";
    mediaMenu.style.height = Math.min(viewportHeight, parseInt(mediaMenu.style.height) || 453) + "px";
}




async function loadGifContent() {
    const query = getId("mediaMenuSearchbar").value;
    if (!query) {
        mediaMenuContainer.innerHTML = "";
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
    displayContent(gifElements, "gif");
}






function toggleMediaMenu() {
    if (isMediaMenuOpen) {
        console.log("Closing media menu");
        mediaMenu.style.display = "none";
        isMediaMenuOpen = false;
    } else {
        console.log("Opening media menu");
        mediaMenu.style.display = "block";
        isMediaMenuOpen = true;
    }
}
function httpGetAsync(url, callback) {
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
            callback(xmlHttp.responseText);
        }
    };
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
}
function handleCategoryGifs(responseText) {
    const gifs = JSON.parse(responseText).results;
    mediaMenuContainer.innerHTML = "";
    gifs.forEach(gif => {
        console.log(gif);
        const gifImg = createEl("img", { className: "gifImg" , src: gif.media[0].gif.url });

        mediaMenuContainer.appendChild(gifImg);
    });
}

async function fetchCategoryGifs(categoryPath) {
    const url = `https://g.tenor.com/v1/search?key=${exampleTenorId}&q=${categoryPath}&limit=50`;
    httpGetAsync(url, handleCategoryGifs);

}
// search input field should hidden and shown category name when rendered gifs
// should return back to input field when this function is called
function showCategoriesList() {
    console.log("Show categories list");
    const categoryNameText = getId("categoryName");
    categoryNameText.style.display = "none";
    getId("gifsBackBtn").style.display = "none";
    getId("mediaMenuSearchbar").style.display = "flex";
    fetchCategoryUrls();
    categoryName.textContent = "";
}
function showCategoryView(categoryName) {
    const categoryNameText = getId("categoryName");
    categoryNameText.style.display = "block";
    categoryNameText.textContent = categoryName;
    getId("gifsBackBtn").style.display = "block";
    getId("mediaMenuSearchbar").style.display = "none";
}



function createCategoryBox(name, categoryPath, previewImage) {
    const box = createEl("div", { className: "categoryBox" });
    const gifImg = createEl("img", { className: "gifImg" , src: previewImage, className: "gifCategoryImage" });
    const overlay = createEl("div", { className: "gifOverlay" });
    const caption = createEl("div", { textContent: name, className: "gifCategoryCaption" });
    box.append(gifImg, overlay, caption);
    box.onclick = () => {
        if (categoryPath === "trending") {
            fetchTrendingGifs();
        } else {
            fetchCategoryGifs(categoryPath);
        }
        showCategoryView(name);
    };
    return box;
}

function displayContent(contentData, type, isCategory = false) {
    console.log(type, contentData);
    mediaMenuContainer.innerHTML = "";

    // If it"s emoji type, just set the emoji panel
    if (type === "emoji") {
        mediaMenuContainer.innerHTML = getEmojiPanel();
        return;
    }

    if (type !== "gif") return;

    if (isCategory) {
        contentData.forEach(category => {
            const box = createCategoryBox(category.name, category.path, category.image);
            mediaMenuContainer.appendChild(box);
        });
        return;
    }

    if (contentData.length === 0) {
        const baseGif = createEl("img", { className: "gif-content", textContent: "No gifs found" });
        mediaMenuContainer.appendChild(baseGif);
    } else {
        contentData.forEach(data => {
            const img = createEl("img", { className: `${type}-content`, src: data.preview });
            img.addEventListener("click", () => {
                toggleMediaMenu();
                sendMessage(data[type]);
            });
            mediaMenuContainer.appendChild(img);
        });
    }
}


function toggleGifs(isTop) {

    if (currentMenuType === "gif") {
        toggleMediaMenu(); 
    } else {
        currentMenuType = "gif";
        loadMenuGifContent();
        if (!isMediaMenuOpen) {
            toggleMediaMenu(); 
        }
    }
}

function toggleEmojis(isTop) {

    if (currentMenuType === "emoji") {
        toggleMediaMenu(); 
    } else {
        currentMenuType = "emoji";
        mediaMenuContainer.innerHTML = getEmojiPanel();

        if (!isMediaMenuOpen) {
            toggleMediaMenu(); 
        }
    }
}

function httpGetSync(url) {
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, false); 
    xmlHttp.send(null);
    if (xmlHttp.status === 200) {
        return xmlHttp.responseText;
    } else {
        throw new Error(`HTTP error! Status: ${xmlHttp.status}`);
    }
}

//TODO: add favourite gifs and popular gifs here
async function fetchCategoryUrls() {
    const url = `https://g.tenor.com/v1/categories?key=${exampleTenorId}`;
    try {
        const response = await fetch(url);
        const responseData = await response.json();
        const categories = responseData.tags || [];

        if (categories.length === 0) {
            console.error("No categories found.");
            return [];
        }


        return categories;

    } catch (error) {
        console.error("Error fetching category GIFs:", error.message);
        return [];
    }
}

async function loadMenuGifContent() {
    console.log("Loading GIF content...");
    
    const categoryUrls = await fetchCategoryUrls();
    
    if (categoryUrls.length > 0) {
        displayContent(categoryUrls, "gif", true);
    } else {
        console.log("No categories available.");
        displayContent([], "gif");
    }
}


function initialiseMedia() {
    mediaMenu = getId("media-menu");
    mediaMenuContainer = getId("media-menu-container");

    mediaMenu.style.display = "none";
    const searchBar = getId("mediaMenuSearchbar");

    searchBar.addEventListener("keydown", debounce(async () => {
        await loadGifContent();
    }, 300));


    getId("emojibtntop").addEventListener("click", (e) => {
        toggleEmojis(false);
        e.stopPropagation(); 
    });
    getId("gifbtn").addEventListener("click", (e) => {
        toggleGifs(false);
        e.stopPropagation();
    });
    getId("emojibtn").addEventListener("click", (e) => {
        toggleEmojis(false);
        e.stopPropagation(); 
    });
    getId("gifbtntop").addEventListener("click", (e) => {
        toggleGifs(true);
        e.stopPropagation(); 
    });

    document.body.addEventListener("click", (event) => {
        if (mediaMenu && isMediaMenuOpen && !mediaMenu.contains(event.target) && event.target.id !== "basebtn") {
            console.log("Clicked outside, closing media menu");
            toggleMediaMenu();
        }
    });
    gifsBackBtn.addEventListener("click",showCategoriesList);
    

    mediaMenu.addEventListener("mousedown", (e) => {
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
            document.body.style.userSelect = "none";
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        }
    });
    
}

document.addEventListener("DOMContentLoaded", initialiseMedia);

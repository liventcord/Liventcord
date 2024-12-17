// gifs/emojis/stickers section
let gifsMenuContainer;

let isGifsOpen = false;


function displayGIFs(gifDatas) {
    gifsMenuContainer.innerHTML = ''; 

    gifDatas.forEach(gifData => {
        const img = createEl('img',{className:'gif-content',src:gifData.preview});
        gifsMenuContainer.appendChild(img);
        img.addEventListener('click',function() {
            toggleGifs();
            sendMessage(gifData.gif);
        });
    });

}
async function loadGifContent(gifsMenuSearchBar) {
    const query = gifsMenuSearchBar.value;
    if(!query) {
        gifsMenuContainer.innerHTML = '';
        return;
    } 

    const url = `https://liventcord-gif-worker.efekantunc0.workers.dev?q=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(`API error: ${data.error}`);
        }
        console.warn(data.results);

        const gifElements = data.results.map(result => ({
            gif: result.media_formats.gif.url,
            preview: result.media_formats.tinygif.url,
        }));

        displayGIFs(gifElements);
    } catch (error) {
        console.error('Error fetching or parsing GIFs:', error);
    }
}

let gifMenu = getId('gif-menu');
function openGifs() {
    gifMenu.style.display = 'block';
}
function toggleEmojis() {
    if(isGifsOpen) {
        closeGifs();
    } else {
        openGifs();
    }
    isGifsOpen = !isGifsOpen;
}
function closeGifs() {
    gifMenu.style.display = 'none';
}
async function toggleGifs() {
    if (isGifsOpen) {
        closeGifs();
    } else {
        openGifs();
    }
    isGifsOpen = !isGifsOpen;
}




document.addEventListener('DOMContentLoaded',()=> {
    let gifsMenuSearchBar = getId('gifs-menu-searchbar');
    gifsMenuContainer = getId('gifs-menu-container');


    gifsMenuSearchBar.addEventListener('keydown', debounce(async function(event) {
        await loadGifContent(gifsMenuSearchBar);
    }, 300));

    document.body.addEventListener('click', function(event) {
        if (gifMenu && !gifMenu.contains(event.target) && event.target.id !== 'gifbtn') {
            closeGifs();
        }
    });
})
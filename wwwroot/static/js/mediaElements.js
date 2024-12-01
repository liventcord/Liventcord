

function createTenorElement(msgContentElement, inputText, url) {
    let tenorURL = '';
    if (url.includes("media1.tenor.com/m/") || url.includes("c.tenor.com/")) {
        tenorURL = url;
    } else if (url.startsWith("tenor.com") || url.startsWith("https://tenor.com")) {
        tenorURL = url.endsWith(".gif") ? url : `${url}.gif`;
    }

    let imgElement = createEl('img');
    imgElement.src = defaultMediaImageUrl;
    imgElement.style.cursor = 'pointer';
    imgElement.style.maxWidth = `${maxTenorWidth}px`;
    imgElement.style.maxHeight = `${maxTenorHeight}px`;

    const actualImage = new Image();
    actualImage.src = tenorURL;
    actualImage.onload = function () {
        imgElement.src = actualImage.src;
    };
    actualImage.onerror = function () {
        imgElement.src = defaultErrorImageUrl;
        imgElement.remove();
        msgContentElement.textContent = inputText;
    };

    imgElement.addEventListener('click', function () {
        displayImagePreview(imgElement.src);
    });

    return imgElement;
}



function createImageElement(msgContentElement, inputText, url_src) {
    const imgElement = createEl('img', { class: 'imageElement' });
    imgElement.src = defaultMediaImageUrl;
    imgElement.style.maxWidth = `${maxWidth}px`;
    imgElement.style.maxHeight = `${maxHeight}px`;

    const actualImage = new Image();
    actualImage.src = url_src;
    actualImage.onload = function () {
        imgElement.src = url_src;
    };
    actualImage.onerror = function () {
        imgElement.remove();
        msgContentElement.textContent = inputText;
    };

    imgElement.addEventListener('click', function () {
        displayImagePreview(imgElement.src);
    });

    return imgElement;
}



function createAudioElement(audioURL) {
    const audioElement = createEl('audio');
    audioElement.src = audioURL;
    audioElement.controls = true; 
    return audioElement;
}
async function createJsonElement(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch JSON data');
        }
        let jsonData = await response.json();
        const beautifiedData = beautifyJson(jsonData);
        const truncatedJsonLines = beautifiedData.split('\n').slice(0, 15).join('\n');
        const jsonContainer = createEl('div');
        jsonContainer.classList.add('jsonContainer');
        const jsonElement = createEl('pre');
        jsonElement.textContent = truncatedJsonLines;
        jsonElement.style.userSelect = 'text';
        jsonElement.style.whiteSpace = 'pre-wrap';
        jsonContainer.appendChild(jsonElement);
        jsonContainer.addEventListener('click', function () {
            displayJsonPreview(beautifiedData); 
        });
        return jsonContainer;
    } catch (error) {
        console.error('Error creating JSON element:', error);
        return null;
    }
}


function createYouTubeElement(url) {
    const youtubeURL = getYouTubeEmbedURL(url);
    const iframeElement = createEl('iframe');
    iframeElement.src = youtubeURL;
    iframeElement.frameborder = '0';
    iframeElement.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframeElement.allowFullscreen = true;
    iframeElement.setAttribute("allowfullscreen", "true");
    iframeElement.setAttribute("mozallowfullscreen", "true");
    iframeElement.setAttribute("msallowfullscreen", "true");
    iframeElement.setAttribute("oallowfullscreen", "true");
    iframeElement.setAttribute("webkitallowfullscreen", "true");
    iframeElement.className = 'youtube-element';
    return iframeElement;
}


function createVideoElement(url) {
    const videoElement = createEl('video');
    videoElement.src = url;
    videoElement.width = '560';
    videoElement.height = '315';
    videoElement.controls = true; 
    return videoElement;
}

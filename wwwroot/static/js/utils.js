let defaultProfileImageUrl = `/static/images/guest.png`;

function isValidFriendName(input) {
    const pattern = /^[^#]+#\d{4}$/;
    return pattern.test(input);
}
function reCalculateFriTitle() {
    const friendsCount = friendsContainer.children.length;
    const textToWrite = friendsCount !== 0 ? getFriendsTranslation() + ' — ' + friendsCount : '';
    getId('friendsTitleContainer').textContent = textToWrite;
}

function setWindowName(pendingCounter) {
    if(pendingCounter) {
        document.title = `LiventCord (${pendingCounter})`;
    }
}


function sendNotify(data) {
    const container = document.createElement('div');
    container.classList.add('info-container');
    container.classList.add('swipe-in');
    
    const childDiv = document.createElement('div');
    childDiv.id = 'info-message'; 
    childDiv.textContent = data;
    container.appendChild(childDiv);
    
    document.body.prepend(container); 

    container.addEventListener('animationend', () => {
        container.parentNode.removeChild(container); 
    });

    setTimeout(() => {
        container.classList.remove('swipe-in');
    }, 3000); 
}


function areJsonsEqual(existingData, newData) {
    if (existingData == null || newData == null) {
        return false;
    }

    if (typeof existingData !== 'object' || typeof newData !== 'object') {
        return false;
    }

    const existingJson = JSON.stringify(existingData);
    const newJson = JSON.stringify(newData);
    return existingJson === newJson;
}
function parseUsernameDiscriminator(input) {
    let parts = input.split('#');
    if (parts.length !== 2) {
        return;
    }
    let nickName = parts[0];
    let discriminator = parts[1];
  
    return {
      nickName: nickName,
      discriminator: discriminator
    };
}
function extractLinks(message) {
    if(message) {
        const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/g;
        return message.match(urlRegex) || [];
    }
}

function constructAppPage(guildId,channelId) {
    return`/channels/${guildId}/${channelId}`;
}
function constructDmPage(channelId) {
    return`/channels/@me/${channelId}`;
}
function constructAbsoluteAppPage(guildId, channelId) {
    return `${window.location.protocol}//${window.location.hostname}/app/channels/${guildId}/${channelId}`;
}
function isPathnameCorrect(url) {
    return /^\/channels\/\d{18}\/\d{18}$/.test(url);
}
function getEmojiPath(emojiName) {   return `/images/${emojiName}.png`; }

function getFormattedDate(messageDate) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
        return "ㅤBugün saat " + messageDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
        return "ㅤDün saat " + messageDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } else {
        return 'ㅤ' + messageDate.toLocaleDateString('tr-TR') + ' ' + messageDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    }
}
function getFormattedDateForSmall(messageDate) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    return messageDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function isImageURL(url) {
    const imageUrlRegex = /\.(gif|jpe?g|png|bmp|webp|tiff|svg|ico)(\?.*)?$/i;
    return imageUrlRegex.test(url);
}
function isAttachmentUrl(url) {
    const pattern = /attachments\/\d+/;
    return pattern.test(url);
}

function isYouTubeURL(url) {
    return /^(?:(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/|m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11}))$/i.test(url);
}


function getYouTubeEmbedURL(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:shorts\/|(?:v|e(?:mbed)?|watch\?v=))|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);

    if (match) {
        const videoId = match[1];
        return `https://www.youtube.com/embed/${videoId}`;
    } else {
        return null; 
    }
}


function isTenorURL(url) {
    return /(?:tenor\.com|media\.tenor\.com)\/(?:[^\/]+\/)+[^\/]+(?:-\w+\.(?:gif|mp4)|$)/.test(url);
}


function isAudioURL(url) {
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.aac', '.flac'];
    const urlWithoutQueryParams = url.split('?')[0];
    const fileExtension = urlWithoutQueryParams.split('.').pop().toLowerCase();
    
    return audioExtensions.includes(`.${fileExtension}`);
}



function isJsonUrl(url) {  return url.toLowerCase().includes('.json'); }
function isVideoUrl(url) {
    const videoPatterns = [
        /\.mp4/i, /\.avi/i, /\.mov/i, /\.wmv/i, /\.mkv/i, /\.flv/i, /\.webm/i // Video file extensions
    ];

    return videoPatterns.some(pattern => pattern.test(url));
}


const rgbCache = {};

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase();
}

function getAverageRGB(imgEl) {
    if (imgEl.src === defaultProfileImageUrl) {
        return '#e7e7e7';
    }

    const blockSize = 5;
    const defaultRGB = { r: 0, g: 0, b: 0 };
    const canvas = document.createElement('canvas');
    const context = canvas.getContext && canvas.getContext('2d');

    if (!context) {
        return defaultRGB;
    }

    if (rgbCache[imgEl.src]) {
        return rgbCache[imgEl.src];
    }

    const height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    const width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

    context.drawImage(imgEl, 0, 0, width, height);

    let data;
    try {
        data = context.getImageData(0, 0, width, height);
    } catch (e) {
        return defaultRGB;
    }

    const length = data.data.length;
    const rgb = { r: 0, g: 0, b: 0 };
    let count = 0;

    for (let i = 0; i < length; i += blockSize * 4) {
        count++;
        rgb.r += data.data[i];
        rgb.g += data.data[i + 1];
        rgb.b += data.data[i + 2];
    }

    rgb.r = ~~(rgb.r / count);
    rgb.g = ~~(rgb.g / count);
    rgb.b = ~~(rgb.b / count);

    const rgbString = rgbToHex(rgb.r, rgb.g, rgb.b);

    rgbCache[imgEl.src] = rgbString;

    return rgbString;
}

function debounce(func, delay) {
    let timer;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}
function isURL(str) {
    const urlPattern = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
    return urlPattern.test(str);
}


function getProfileUrl(userId) {
    return `/profiles/${userId}.png`;
}




const profileCache = {};
const guildImageCache = {};
const failedProfiles = new Set();
const failedGuilds = new Set();
const requestInProgress = {};
const bytesOf404 = 'W1wiNDA0XCIsNDA0XQ==';
const base64Of404 = 'data:application/json;base64,W1wiNDA0XCIsNDA0XQ==';



async function setPicture(imgToUpdate, srcId, isProfile, isTimestamp) {
    if (!srcId) return;

    if (srcId == CLYDE_ID) {
        imgToUpdate.src = clydeSrc;
        return;
    }

    const timestamp = new Date().getTime();
    const imageUrl = !isProfile 
        ? `/guilds/${srcId}.png${isTimestamp ? `?ts=${timestamp}` : ''}` 
        : `${getProfileUrl(srcId)}${isTimestamp ? `?ts=${timestamp}` : ''}`;

    srcId = String(srcId);

    if (isProfile) {
        if (failedProfiles.has(srcId)) {
            imgToUpdate.src = defaultProfileImageUrl;
            return;
        }
    } else {
        if (failedGuilds.has(srcId)) {
            imgToUpdate.src = createBlackImage();
            return;
        }
    }

    const cachedBase64 = isProfile ? profileCache[srcId] : guildImageCache[srcId];
    if (cachedBase64 && cachedBase64 !== base64Of404) {
        imgToUpdate.src = cachedBase64;
        return;
    }

    if (requestInProgress[srcId]) {
        try {
            const base64data = await requestInProgress[srcId];
            imgToUpdate.src = base64data || (isProfile ? defaultProfileImageUrl : createBlackImage());
        } catch {
            imgToUpdate.src = isProfile ? defaultProfileImageUrl : createBlackImage();
        }
        return;
    }

    requestInProgress[srcId] = (async () => {
        try {
            const response = await fetch(imageUrl);
            if (response.status === 404) {
                imgToUpdate.src = isProfile ? defaultProfileImageUrl : createBlackImage();
                isProfile ? failedProfiles.add(srcId) : failedGuilds.add(srcId);
                return null;
            }

            const blob = await response.blob();
            const base64data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = function () {
                    const data = reader.result;
                    if (data !== base64Of404) {
                        (isProfile ? profileCache : guildImageCache)[srcId] = data;
                        resolve(data);
                    } else {
                        (isProfile ? profileCache : guildImageCache)[srcId] = base64Of404;
                        reject(new Error('Image is 404'));
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            return base64data;
        } catch (error) {
            imgToUpdate.src = isProfile ? defaultProfileImageUrl : createBlackImage();
            isProfile ? failedProfiles.add(srcId) : failedGuilds.add(srcId);
            return null;
        } finally {
            delete requestInProgress[srcId];
        }
    })();

    try {
        const base64data = await requestInProgress[srcId];
        imgToUpdate.src = base64data || (isProfile ? defaultProfileImageUrl : createBlackImage());
    } catch {
        imgToUpdate.src = isProfile ? defaultProfileImageUrl : createBlackImage();
    }

    imgToUpdate.addEventListener('error', function () {
        imgToUpdate.src = isProfile ? defaultProfileImageUrl : createBlackImage();
        isProfile ? failedProfiles.add(srcId) : failedGuilds.add(srcId);
    });
}




function pad(number, length) {
    let str = String(number);
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

function formatDate(date) {
    const year = date.getUTCFullYear();
    const month = pad(date.getUTCMonth() + 1, 2); 
    const day = pad(date.getUTCDate(), 2);
    const hours = pad(date.getUTCHours(), 2);
    const minutes = pad(date.getUTCMinutes(), 2);
    const seconds = pad(date.getUTCSeconds(), 2);
    const milliseconds = pad(date.getUTCMilliseconds(), 3);
    const microseconds = pad(date.getUTCMilliseconds() * 1000, 6);

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${microseconds}+00:00`;
}

function truncateString(str, maxLength) {
    if (str.length <= maxLength) {
        return str; 
    }
    return str.slice(0, maxLength) + '...'; 
}
function createNowDate() {
    let date = new Date();
    let year = date.getUTCFullYear();
    let month = String(date.getUTCMonth() + 1).padStart(2, '0'); 
    let day = String(date.getUTCDate()).padStart(2, '0');
    let hours = String(date.getUTCHours()).padStart(2, '0');
    let minutes = String(date.getUTCMinutes()).padStart(2, '0');
    let seconds = String(date.getUTCSeconds()).padStart(2, '0');
    let milliseconds = String(date.getUTCMilliseconds()).padStart(3, '0');
    let microseconds = "534260"; 
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}${microseconds}+00:00`;

}

function createRandomId(length = 19) {
    const digits = '0123456789';
    let result = '';
    const digitsLength = digits.length;
    for (let i = 0; i < length; i++) {
      result += digits.charAt(Math.floor(Math.random() * digitsLength));
    }
    return result;
}
  
function openExternalUrl(url) {
    window.open(url, '_blank');
}

function sanitizeHTML(html) {
    if(typeof html != 'string') return;
    function isValidForColoring(content) {
        return /^[a-zA-Z0-9\s\-_.,!?]+$/.test(content.trim());
    }

    html = html.replace(/-red\s(.*?)\sred-/gi, (match, content) => {
        if (isValidForColoring(content)) {
            return `<red>${content}</red>`;
        } else {
            return `&lt;-red ${content} red-&gt;`;
        }
    });

    html = html.replace(/-blu\s(.*?)\sblu-/gi, (match, content) => {
        if (isValidForColoring(content)) {
            return `<blu>${content}</blu>`;
        } else {
            return `&lt;-blu ${content} blu-&gt;`;
        }
    });

    html = html.replace(/-yellow\s(.*?)\syellow-/gi, (match, content) => {
        if (isValidForColoring(content)) {
            return `<yellow>${content}</yellow>`;
        } else {
            return `&lt;-yellow ${content} yellow-&gt;`; 
        }
    });

    html = html.replace(/<br>/gi, '&lt;br&gt;');
    html = html.replace(/\n/g, '<br>');
    const sanitizedString = html.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>?/gi, (tag) => {
        const allowedTags = ['br', 'red', 'blu', 'yellow'];
        const tagMatch = tag.match(/<\/?([a-z][a-z0-9]*)\b[^>]*>?/i);
        const tagName = tagMatch ? tagMatch[1].toLowerCase() : '';

        if (allowedTags.includes(tagName)) {
            return tag;
        } else {
            return tag.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
    });
    const validHtml = sanitizedString.replace(/<[^>]*$/g, (match) => {
        return match.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    });

    return applyCustomStyles(validHtml);
}
function disableElement(str) {
    const element = getId(str);
    if(element) {
        element.style.display = 'none';
    }   

}
function enableElement(str, isFlex1 = false, isBlock = false, isInline = false) {
    const element = getId(str);
    if (element) {
        if (isFlex1) {
            element.style.flex = '1';
        }
        
        if (isBlock) {
            element.style.display = 'block';
        } else if (isInline) {
            element.style.display = 'inline-block';
        } else {
            element.style.display = 'flex';
        }

        //console.log("Element", str, 'is enabled.');
    }
}


function removeElement(elementname) {
    const element = document.getElementById(elementname);
    if(element) {
        element.remove();
    }
}

function getBeforeElement(element) {
    const elements = Array.from(chatContent.children);
    const index = elements.indexOf(element);
    if (index > 0) {
        return elements[index - 1];
    } else {
        return null;
    }
}

function applyCustomStyles(html) {
    const styles = {
        'red': 'color: red;',
        'blu': 'color: blue;',
        'yellow': 'color: yellow;' 
    };
    const styledHTML = html.replace(/<([a-z][a-z0-9]*)\b[^>]*>(.*?)<\/\1>/gi, (match, tag, content) => {
        if (styles[tag]) {
            if (content.trim()) {
                return `<span style="${styles[tag]}">${content}</span>`;
            } else {
                return `&lt;${tag}&gt;`;
            }
        } else {

            return `&lt;${tag}&gt;`;
        }
    });

    return styledHTML.replace(/&lt;br&gt;/g, '&lt;br&gt;');
}

function getBase64Image(imgElement) {
    const canvas = createEl('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imgElement.naturalWidth;
    canvas.height = imgElement.naturalHeight;
    ctx.drawImage(imgElement, 0, 0);
    return canvas.toDataURL('image/png');
}

async function urlToBase64(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onloadend = () => {
                const base64Data = reader.result.split(',')[1];
                const mimeType = blob.type || 'image/png';
                resolve(`data:${mimeType};base64,${base64Data}`);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error fetching or converting URL to Base64:', error);
        throw error;
    }
}
function reloadCSS() {
    const approvedDomains = ['localhost'];
    function getDomain(url) {
        const link = createEl('a');
        link.href = url;
        return link.hostname;
    }
    const links = document.getElementsByTagName('link');
    for (let i = 0; i < links.length; i++) {
        const link = links[i];
        if (link.rel === 'stylesheet') {
            const href = link.href;
            const domain = getDomain(href);
            if (approvedDomains.includes(domain)) {
                const newHref = href.indexOf('?') !== -1 ? `${href}&_=${new Date().getTime()}` : `${href}?_=${new Date().getTime()}`;
                link.href = newHref;
            }
        }
    }
}
//window.addEventListener('focus', reloadCSS);

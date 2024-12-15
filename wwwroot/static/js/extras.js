
const getCursorXY = (input, selectionPoint) => {
    const { offsetLeft: inputX, offsetTop: inputY, scrollLeft, scrollTop, clientWidth, clientHeight } = input;
    const div = createEl('div');


    div.style.position = 'absolute';
    div.style.whiteSpace = 'pre-wrap'; 
    div.style.wordWrap = 'break-word'; 
    div.style.visibility = 'hidden'; 
    div.style.overflow = 'hidden';
    div.style.top = `${inputY}px`;
    div.style.left = `${inputX}px`;
    div.style.padding = '10px 100px 10px 55px'; 
    div.style.fontFamily = 'Arial, Helvetica, sans-serif';
    div.style.backgroundColor = '#36393f'; 
    div.style.border = 'none'; 
    div.style.lineHeight = '20px'; 
    div.style.fontSize = '17px'; 
    div.style.borderRadius = '7px'; 
    div.style.boxSizing = 'border-box'; 
    div.style.maxHeight = '500px';
    div.style.width = 'calc(100vw - 585px)';
    const swap = '\u00A0'; 
    const inputValue = input.tagName === 'INPUT' ? input.value.replace(/ /g, swap) : input.value;
    const textNode = document.createTextNode(inputValue.substring(0, selectionPoint));
    div.appendChild(textNode);
    document.body.appendChild(div);
    const range = document.createRange();
    range.selectNodeContents(div);
    range.setStart(textNode, selectionPoint);
    range.setEnd(textNode, selectionPoint);
    const rect = range.getBoundingClientRect();
    const x = rect.left - inputX + scrollLeft + 5;
    const y = rect.top - inputY + scrollTop;
    document.body.removeChild(div);

    return {
        x: Math.min(x, clientWidth), 
        y: Math.min(y, clientHeight) 
    };
};

let isSnow = false;
let snowActive = false;

let particeContainer;
function enableSnowOnSettings() {
    if(isSnow) {
        enableSnow();
    } else {
        snowActive = false;
    }
}

function toggleSnow() {
    if(isSnow) {
        disableSnow();
    } else {
        isSnow = true;
        enableSnow();
    }
}
function disableSnow() {
    snowActive = false; 
    isSnow = false;
}
function disableSnowOnSettingsOpen() {
    snowActive = false;
}
let isParty = false;
function toggleParty() {
    isParty = !isParty;

    if (isParty) {
        enableBorderMovement();
    } else {
        stopAudioAnalysis();
    }
}

function enableSnow() {
    particeContainer = getId('confetti-container');
    snowActive = true; 
    let skew = 1;

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    (function frame() {
        if (!snowActive) return; 

        skew = Math.max(0.8, skew - 0.001);

        confetti({
            particleCount: 1,
            startVelocity: 0,
            ticks: 300,
            origin: {
                x: Math.random(),
                y: (Math.random() * skew) - 0.2
            },
            colors: ['#ffff'],
            shapes: ['circle'],
            gravity: randomInRange(0.4, 0.6),
            scalar: randomInRange(0.4, 1),
            drift: randomInRange(-0.4, 0.4),
            particleContainer: particeContainer
        });

        requestAnimationFrame(frame); 
    }());
}

function popKeyboardConfetti() {
    const { x, y } = getCursorXY(chatInput, chatInput.selectionStart);
    const inputRect = chatInput.getBoundingClientRect();
    
    let ratioY = y / window.innerHeight + 0.95;
    let ratioX = (inputRect.left + x) / window.innerWidth;

    if (ratioY > 1) {
        ratioY = 1;
    }
    if (ratioX < 0.2) {
        ratioX = 0.2;
    }

    setTimeout(() => {
        confetti({
            particleCount: 5,
            spread: 7,
            origin: { x: ratioX, y: ratioY },
            disableForReducedMotion: true
        });
    }, 0);
}
function createFireWorks() {
    setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    return;
}
function changeUrlWithFireWorks(guildId,channelId,guildName) { 
    guildOwnerIds[guildId] = currentUserId
    loadGuild(guildId,channelId,guildName,currentUserId)
    addGuild(guildId,guildName,currentUserId);

    createFireWorks();
    permissionManager.addGuildSelfCreated(guildId);

}
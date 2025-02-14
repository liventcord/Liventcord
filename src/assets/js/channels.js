import { apiClient, EventType } from "./api";
import { constructAppPage, disableElement, getId, createEl } from "./utils";
import {
  getHistoryFromOneChannel,
  setLastSenderID,
  setReachedChannelEnd,
  clearLastDate,
} from "./chat";
import { translations } from "./translations";
import { closeReplyMenu, chatInput, chatContent } from "./chatbar";
import { joinVoiceChannel } from "./guild";
import {
  selectedChanColor,
  hoveredChanColor,
  settingsHtml,
  inviteHtml,
  muteHtml,
  inviteVoiceHtml,
  voiceChanHtml,
} from "./ui";
import {
  appendToChannelContextList,
  createUserContext,
} from "./contextMenuActions";
import { setProfilePic } from "./avatar";
import { guildCache, cacheInterface } from "./cache";
import { currentGuildId } from "./guild";
import { isOnMe, isOnDm } from "./router";
import { textChanHtml } from "./ui";
import { permissionManager } from "./guildPermissions";
import { getUserNick } from "./user";
import { loadGuild } from "./guild";
import { openChannelSettings } from "./settingsui";

export let channelTitle = getId("channel-info");
export let channelList = getId("channel-list");
export let channelsUl = channelList.querySelector("ul");
export let currentChannelName = null;

export let currentVoiceChannelId;
export let currentChannels;

export let currentVoiceChannelGuild;
export function setCurrentVoiceChannelId(val) {
  currentVoiceChannelId = val;
}
export function setCurrentVoiceChannelGuild(val) {
  currentVoiceChannelGuild = val;
}

export function getChannels() {
  console.log("Getting channels...");
  if (guildCache.currentChannelId) {
    const channels = cacheInterface.getChannels(currentGuildId);
    if (channels.length > 0) {
      updateChannels(channels);
      console.log("Using cached channels: ", channels);
    } else {
      console.warn("Channel cache is empty. fetching channels...");
      apiClient.send(EventType.GET_CHANNELS, { guildId: currentGuildId });
    }
  } else {
    console.warn("Current channel id is null!");
  }
}

export async function changeChannel(newChannel) {
  console.log("Changed channel: ", newChannel);
  if (isOnMe || isOnDm) {
    return;
  }
  const channelId = newChannel.channelId;
  const isTextChannel = newChannel.isTextChannel;
  const url = constructAppPage(currentGuildId, channelId);
  if (url !== window.location.pathname && isTextChannel) {
    window.history.pushState(null, null, url);
  }
  const newChannelName = newChannel.channelName;
  setReachedChannelEnd(false);

  if (isTextChannel) {
    guildCache.currentChannelId = channelId;
    currentChannelName = newChannelName;
    chatInput.placeholder = translations.getMessagePlaceholder(newChannelName);
    channelTitle.textContent = newChannelName;
    setLastSenderID();
    chatContent.innerHTML = "";
    clearLastDate();
    getHistoryFromOneChannel(guildCache.currentChannelId);
    closeReplyMenu();
  } else {
    joinVoiceChannel(channelId);
  }

  if (!currentChannels) {
    return;
  }

  currentChannels.forEach((channel, index) => {
    const channelButton = channelsUl.querySelector(
      `li[id="${channel.channelId}"]`,
    );
    if (channelButton) {
      if (channel.channelId !== channelId) {
        mouseHoverChannelButton(
          channelButton,
          channel.isTextChannel,
          channel.channelId,
        );
        mouseLeaveChannelButton(
          channelButton,
          channel.isTextChannel,
          channel.channelId,
        );
      } else if (!isTextChannel) {
        const voiceUsersInChannel =
          cacheInterface.getVoiceChannelMembers(channelId);
        if (voiceUsersInChannel) {
          let allUsersContainer = channelButton.querySelector(
            ".channel-users-container",
          );
          if (!allUsersContainer) {
            allUsersContainer = createEl("div", {
              className: "channel-users-container",
            });
          }
          channelButton.style.width = "100%";
          voiceUsersInChannel.forEach((userId, index) => {
            drawVoiceChannelUser(
              index,
              userId,
              channelId,
              channelButton,
              allUsersContainer,
              isTextChannel,
            );
          });
        }
      }
    }
  });
}

//channels
export function isChannelMatching(channelId, isTextChannel) {
  const currentChannel = isTextChannel
    ? guildCache.currentChannelId
    : currentVoiceChannelId;
  if (channelId === currentChannel) {
    return true;
  } else {
    //console.error("Match failed");
    return false;
  }
}

export function mouseHoverChannelButton(
  channelButton,
  isTextChannel,
  channelId,
) {
  if (!channelButton) {
    return;
  }
  const contentWrapper = channelButton.querySelector(".content-wrapper");

  contentWrapper.style.display = "flex";
  if (isTextChannel) {
    const isMatch = isChannelMatching(channelId, isTextChannel);
    channelButton.style.backgroundColor = isMatch
      ? selectedChanColor
      : hoveredChanColor;
  } else {
    channelButton.style.backgroundColor = hoveredChanColor;
  }
  channelButton.style.color = "white";
}
export function hashChildElements(channelButton) {
  return channelButton.querySelector(".channel-users-container") !== null;
}
export function mouseLeaveChannelButton(
  channelButton,
  isTextChannel,
  channelId,
) {
  if (!channelButton) {
    return;
  }
  const contentWrapper = channelButton.querySelector(".content-wrapper");
  const channelSpan = channelButton.querySelector(".channelSpan");

  if (channelSpan && !isTextChannel) {
    channelSpan.style.marginRight = hashChildElements(channelButton)
      ? "30px"
      : "0px";
  }
  if (contentWrapper) {
    if (!isTextChannel) {
      if (currentVoiceChannelId === channelId) {
        contentWrapper.style.display = "flex";
      } else {
        contentWrapper.style.display = "none";
      }
    } else if (guildCache.currentChannelId !== channelId) {
      contentWrapper.style.display = "none";
    }
  }
  if (isTextChannel) {
    channelButton.style.backgroundColor = isChannelMatching(
      channelId,
      isTextChannel,
    )
      ? selectedChanColor
      : "transparent";
  } else {
    channelButton.style.backgroundColor = "transparent";
  }
  channelButton.style.color = isChannelMatching(channelId, isTextChannel)
    ? "white"
    : "rgb(148, 155, 164)";
}
export function handleKeydown(event) {
  if (isKeyDown || isOnMe) return;
  currentChannels.forEach((channel, index) => {
    let hotkey = index < 9 ? (index + 1).toString() : index === 9 ? "0" : null;
    if (hotkey && event.key === hotkey && event.altKey) {
      changeChannel(channel);
    }
  });
  if (event.altKey) {
    if (event.key === "ArrowUp") {
      moveChannel(-1);
    } else if (event.key === "ArrowDown") {
      moveChannel(1);
    }
  }
  isKeyDown = true;
}
export function editChannelElement(channelId, new_channel_name) {
  const existingChannelButton = channelsUl.querySelector(
    `li[id="${channelId}"]`,
  );
  if (!existingChannelButton) {
    return;
  }
  existingChannelButton.querySelector("channelSpan").textContent =
    new_channel_name;
}
export function removeChannelElement(channelId) {
  const existingChannelButton = channelsUl.querySelector(
    `li[id="${channelId}"]`,
  );
  if (!existingChannelButton) {
    return;
  }
  existingChannelButton.remove();
}

export function isChannelExist(channelId) {
  const existingChannelButton = channelsUl.querySelector(
    `li[id="${channelId}"]`,
  );
  return existingChannelButton !== null;
}
export function createChannel(channelName, isTextChannel, isPrivate) {
  if (typeof isPrivate !== "boolean") {
    isPrivate = false;
  }
  console.log(channelName, isTextChannel, isPrivate);
  apiClient.send(EventType.CREATE_CHANNEL, {
    channelName: channelName,
    guildId: currentGuildId,
    isTextChannel,
    isPrivate,
  });
}

export function createChannelButton(channelId, channelName, isTextChannel) {
  const htmlToSet = isTextChannel ? textChanHtml : voiceChanHtml;
  const channelButton = createEl("li", {
    className: "channel-button",
    id: channelId,
  });
  channelButton.style.marginLeft = "-80px";

  const hashtagSpan = createEl("span", {
    innerHTML: htmlToSet,
    marginLeft: "50px",
  });
  hashtagSpan.style.color = "rgb(128, 132, 142)";

  const channelSpan = createEl("span", {
    className: "channelSpan",
    textContent: channelName,
  });
  channelSpan.style.marginRight = "30px";
  channelSpan.style.width = "100%";
  channelButton.style.width = "70%";

  channelButton.appendChild(hashtagSpan);
  channelButton.appendChild(channelSpan);

  return channelButton;
}
function onChannelSettings(event, channel) {
  event.stopPropagation();
  console.log("Click to settings on:", channel);
  openChannelSettings(channel);
}
function createContentWrapper(channel, channelName, isTextChannel) {
  const contentWrapper = createEl("div", { className: "content-wrapper" });
  contentWrapper.style.display = "none";
  contentWrapper.style.marginRight = "100px";
  contentWrapper.style.marginTop = "4px";

  const settingsSpan = createEl("span", { innerHTML: settingsHtml });
  settingsSpan.addEventListener("click", () =>
    onChannelSettings(event, channel),
  );

  if (permissionManager.canInvite()) {
    const inviteSpan = createEl("span", { innerHTML: inviteHtml });
    inviteSpan.addEventListener("click", () => {
      console.log("Click to invite on:", channelName);
    });
    contentWrapper.appendChild(inviteSpan);
  }

  contentWrapper.appendChild(settingsSpan);
  return contentWrapper;
}

export function addEventListeners(
  channelButton,
  channelId,
  isTextChannel,
  channel,
) {
  channelButton.addEventListener("mouseover", function (event) {
    if (event.target.id === channelId) {
      mouseHoverChannelButton(channelButton, isTextChannel, channelId);
    }
  });

  channelButton.addEventListener("mouseleave", function (event) {
    if (event.target.id === channelId) {
      mouseLeaveChannelButton(channelButton, isTextChannel, channelId);
    }
  });
  mouseLeaveChannelButton(channelButton, isTextChannel, channelId);

  setTimeout(() => {
    mouseLeaveChannelButton(channelButton, isTextChannel, channelId);
  }, 50);
  channelButton.addEventListener("click", function () {
    changeChannel(channel);
  });
}

export function handleChannelChangeOnLoad(channel, channelId) {
  if (channelId === guildCache.currentChannelId) {
    changeChannel(channel);
  }
}

export function resetKeydown() {
  isKeyDown = false;
}

let isKeyDown = false;
let currentChannelIndex = 0;
export function moveChannel(direction) {
  let newIndex = currentChannelIndex + direction;
  if (newIndex < 0) {
    newIndex = currentChannels.length - 1;
  } else if (newIndex >= currentChannels.length) {
    newIndex = 0;
  }
  changeChannel(currentChannels[newIndex]);
  currentChannelIndex = newIndex;
}

export function removeChannelEventListeners() {
  document.removeEventListener("keydown", handleKeydown);
  document.removeEventListener("keyup", resetKeydown);
}

export function addChannelEventListeners() {
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("keyup", resetKeydown);
}

class Channel {
  constructor({ channelId, channelName, isTextChannel, guildId }) {
    this.channelId = channelId;
    this.channelName = channelName;
    this.isTextChannel = isTextChannel;
    this.guildId = guildId;
  }

  isValid() {
    return (
      this.channelId &&
      this.channelName &&
      typeof this.isTextChannel !== "undefined"
    );
  }

  createElement() {
    if (isChannelExist(this.channelId)) return;

    const channelButton = createChannelButton(
      this.channelId,
      this.channelName,
      this.isTextChannel,
    );
    const contentWrapper = createContentWrapper(
      this,
      this.channelName,
      this.isTextChannel,
    );

    channelButton.appendChild(contentWrapper);
    appendToChannelContextList(this.channelId);
    channelsUl.appendChild(channelButton);

    addEventListeners(channelButton, this.channelId, this.isTextChannel, this);
    handleChannelChangeOnLoad(this, this.channelId);
  }
}

export function validateChannel(channel) {
  return new Channel(channel).isValid();
}

export function validateChannels(channels) {
  return (
    Array.isArray(channels) &&
    channels.every((channel) => new Channel(channel).isValid())
  );
}

export function createChannelElement(channel) {
  new Channel(channel).createElement();
}

export function addChannel(channelData) {
  const channel = new Channel(channelData);
  if (!channel.isValid()) {
    console.error("Invalid channel data:", channel);
    return;
  }

  console.log(typeof channel, channel);
  currentChannels.push(channel);
  cacheInterface.addChannel(channel.guildId, channel);

  refreshChannelList(channel);
}

export function updateChannels(channels) {
  if (!validateChannels(channels)) {
    console.error("Invalid channels format or missing channel data:", channels);
    return;
  }

  console.log("Updating channels with:", channels);
  channelsUl.innerHTML = "";
  if (!isOnMe) disableElement("dm-container-parent");

  refreshChannelList(channels);
  currentChannels = channels;
}

function refreshChannelList(channels) {
  removeChannelEventListeners();
  (Array.isArray(channels) ? channels : [channels]).forEach(
    createChannelElement,
  );
  if (currentChannels && currentChannels.length > 1) addChannelEventListeners();
}

export function removeChannel(data) {
  const { guildId, channelId } = data;
  guildCache.removeChannel(guildId, channelId);

  const channelsArray = cacheInterface.getChannels(guildId);
  currentChannels = channelsArray;
  removeChannelElement(channelId);
  if (guildCache.currentChannelId === channelId) {
    const firstChannel = channelsArray[0]?.channelId;
    if (firstChannel) loadGuild(currentGuildId, firstChannel);
  }
}

export function editChannel(data) {
  const { guildId, channelId, channelName } = data;
  guildCache.editChannel(guildId, channelId, { channelName });

  currentChannels = cacheInterface.getChannels(guildId);
}

// voice

export function drawVoiceChannelUser(
  index,
  userId,
  channelId,
  channelButton,
  allUsersContainer,
  isTextChannel,
) {
  const userName = getUserNick(userId);
  const userContainer = createEl("li", {
    className: "channel-button",
    id: userId,
  });
  userContainer.addEventListener("mouseover", function (event) {
    //mouseHoverChannelButton(userContainer, isTextChannel,channelId);
  });
  userContainer.addEventListener("mouseleave", function (event) {
    //mouseLeaveChannelButton(userContainer, isTextChannel,channelId);
  });

  createUserContext(userId);

  userContainer.id = `user-${userId}`;
  const userElement = createEl("img", {
    style:
      "width: 25px; height: 25px; border-radius: 50px; position:fixed; margin-right: 170px;",
  });
  setProfilePic(userElement, userId);
  userContainer.appendChild(userElement);
  userContainer.style.marginTop = index === 0 ? "30px" : "10px";
  userContainer.style.marginLeft = "-220px";
  userContainer.style.width = "90%";
  userContainer.style.justifyContent = "center";
  userContainer.style.alignItems = "center";

  const contentWrapper = createEl("div", { className: "content-wrapper" });
  const userSpan = createEl("span", {
    className: "channelSpan",
    textContent: userName,
    style: "position: fixed;",
  });
  userSpan.style.color = "rgb(128, 132, 142)";
  userSpan.style.border = "none";
  userSpan.style.width = "auto";

  const muteSpan = createEl("span", { innerHTML: muteHtml });
  const inviteVoiceSpan = createEl("span", { innerHTML: inviteVoiceHtml });
  contentWrapper.appendChild(muteSpan);
  contentWrapper.appendChild(inviteVoiceSpan);
  contentWrapper.style.marginRight = "-115px";
  userContainer.appendChild(userSpan);
  userContainer.appendChild(contentWrapper);
  allUsersContainer.appendChild(userContainer);
  channelButton.appendChild(allUsersContainer);
}

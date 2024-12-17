let isDeveloperMode = true;
let contextList = {};
let messageContextList = {};

function openReactionMenu(messageId) {
  console.log("Opening react menu for: ", messageId);
}
function openEditMessage(messageId) {
  console.log("Editing message ", messageId);
}
function pinMessage(messageId) {
  console.log("Pinning message ", messageId);
}

function markAsUnread(messageId) {
  console.log("Marking as unread message ", messageId);
}
function deleteMessage(messageId) {
  console.log("Deleting message ", messageId);
  let data = {
    isDm: isOnDm,
    messageId: messageId,
    channelId: isOnGuild ? currentChannelId : currentDmId,
  };
  if (isOnGuild) {
    data["guildId"] = currentGuildId;
  }
  socket.emit("message_delete", data);
}
function inviteToGuild(userId) {
  console.log(userId);
}
function blockUser(userId) {
  console.log(userId);
}
function reportUser(userId) {
  console.log(userId);
}

function mentionUser(userId) {
  const userNick = getUserNick(userId);
  chatInput.value += `@${userNick}`;
}

function inviteUser(userId, guildId) {
  if (!userId || !guildId) {
    return;
  }
  console.log("inviting user : ", userId, " to guild ", guildId);
  openDm(userId);
}

function removeFriend(userId) {
  socket.emit("friend_request_event", "remove_friend", { friend_id: userId });
}

const MessagesActionType = {
  ADD_REACTION: "Tepki Ekle",
  EDIT_MESSAGE: "Mesajı Düzenle",
  PIN_MESSAGE: "Mesajı Sabitle",
  REPLY: "Yanıtla",
  MARK_AS_UNREAD: "Okunmadı olarak işaretle",
  DELETE_MESSAGE: "Mesajı Sil",
};

function copyChannelLink(guildId, channelId) {
  const content = constructAbsoluteAppPage(guildId, channelId);
  navigator.clipboard.writeText(content);
}
function copyId(channelId) {
  navigator.clipboard.writeText(channelId);
}

function muteChannel(channelId) {
  alertUser("Mute channel is not implemented!");
}
function showNotifyMenu(channelId) {
  alertUser("Notify menu is not implemented!");
}
function editChannel(channelId) {
  alertUser("Channel editing is not implemented!");
}
function deleteChannel(channelId, guildId) {
  const data = {
    guildId: guildId,
    channelId: channelId,
  };
  socket.emit("remove_channel", data);
}

function togglePin() {
  console.log("Toggle pin!");
}
function appendToChannelContextList(channelId) {
  contextList[channelId] = createChannelsContext(channelId);
}

function appendToMessageContextList(messageId, userId) {
  messageContextList[messageId] = createMessageContext(messageId, userId);
}
function appendToProfileContextList(userData, userId) {
  if (userId && userData) {
    contextList[userId] = createProfileContext(userData, userId);
  }
}

//Context
const ActionType = {
  COPY_ID: "ID'yi Kopyala",
  COPY_USER_ID: "Kullanıcı ID'sini Kopyala",
  INVITE_TO_GUILD: "Sunucuya Davet Et",
  BLOCK_USER: "Engelle",
  REPORT_USER: "Kullanıcı Profilini Bildir",
  REMOVE_USER: "Arkadaşı Çıkar",
  EDIT_GUILD_PROFILE: "Sunucu Profilini Düzenle",
  MENTION_USER: "Bahset",
};
const ChannelsActionType = {
  MARK_AS_READ: "Okundu olarak işaretle",
  COPY_LINK: "Bağlantıyı Kopyala",
  MUTE_CHANNEL: "Kanalı Sessize Al",
  NOTIFY_SETTINGS: "Bildirim Ayarları",
  EDIT_CHANNEL: "Kanalı Düzenle",
  DELETE_CHANNEL: "Kanalı Sil",
};
const VoiceActionType = {
  OPEN_PROFILE: "Profil",
  MENTION_USER: "Bahset",
  MUTE_USER: "Sustur",
  DEAFEN_USER: "Sağırlaştır",
};
function createUserContext(userId) {
  let context = {};

  if (!isProfilePopOpen()) {
    context[VoiceActionType.OPEN_PROFILE] = {
      action: () => drawProfilePop(userId),
    };
  }

  (context[VoiceActionType.MENTION_USER] = () => mentionUser(userId)),
    (context[VoiceActionType.MUTE_USER] = () => muteUser(userId)),
    (context[VoiceActionType.DEAFEN_USER] = () => deafenUser(userId));

  if (userId === currentUserId) {
    context[ActionType.EDIT_GUILD_PROFILE] = () => editGuildProfile();
  }

  if (isDeveloperMode) {
    context[ActionType.COPY_ID] = () => copyId(userId);
  }

  return context;
}

function createProfileContext(userData) {
  const userId = userData.userId;
  let context = {};

  if (!isProfilePopOpen()) {
    context[VoiceActionType.OPEN_PROFILE] = {
      action: () => drawProfilePop(userData),
    };
  }

  if (userId !== currentUserId) {
    const guildSubOptions = getManageableGuilds();
    if (Array.isArray(guildSubOptions) && guildSubOptions.length > 0) {
      context[ActionType.INVITE_TO_GUILD] = {
        action: () => {},
        subOptions: guildSubOptions.map((subOption) => ({
          label: getGuildName(subOption),
          action: () => inviteUser(userId, subOption),
        })),
      };
    }
  }

  if (!isOnMe) {
    context[ActionType.MENTION_USER] = {
      action: () => mentionUser(userId),
    };
  }

  if (userId == currentUserId) {
    context[ActionType.EDIT_GUILD_PROFILE] = {
      action: () => editGuildProfile(),
    };
  } else {
    context[ActionType.BLOCK_USER] = {
      action: () => blockUser(userId),
    };
    context[ActionType.REPORT_USER] = {
      action: () => reportUser(userId),
    };
  }

  if (friendCache.isFriend(userId)) {
    context[ActionType.REMOVE_USER] = {
      action: () => removeFriend(userId),
    };
  }

  if (isDeveloperMode) {
    context[ActionType.COPY_USER_ID] = {
      action: () => copyId(userId),
    };
  }

  return context;
}

function addContextListeners() {
  document.addEventListener("contextmenu", function (event) {
    event.preventDefault();

    let options = null;

    if (event.target.id && contextList.hasOwnProperty(event.target.id)) {
      options = contextList[event.target.id];
    } else if (
      event.target.dataset.m_id &&
      messageContextList.hasOwnProperty(event.target.dataset.m_id)
    ) {
      options = messageContextList[event.target.dataset.m_id];
    } else if (
      event.target.dataset.cid &&
      contextList.hasOwnProperty(event.target.dataset.cid)
    ) {
      options = contextList[event.target.dataset.cid];
    }

    if (options) {
      showContextMenu(event.pageX, event.pageY, options);
    }
  });

  document.addEventListener("click", function (event) {
    if (
      event.target.dataset.m_id &&
      messageContextList.hasOwnProperty(event.target.dataset.m_id)
    ) {
      const options = messageContextList[event.target.dataset.m_id];
      if (options) {
        hideContextMenu();
        showContextMenu(event.pageX, event.pageY, options);
      }
    }

    if (
      event.target.classList &&
      !event.target.classList.contains("message") &&
      event.target.id &&
      messageContextList.hasOwnProperty(event.target.id)
    ) {
      const options = messageContextList[event.target.id];
      if (options) {
        hideContextMenu();
        showContextMenu(event.pageX, event.pageY, options);
      }
    }
  });
}

function createChannelsContext(channelId) {
  let context = {};
  context[ChannelsActionType.MARK_AS_READ] = {
    action: () => readCurrentMessages(),
  };
  context[ChannelsActionType.COPY_LINK] = {
    action: () => copyChannelLink(currentGuildId, channelId),
  };
  context[ChannelsActionType.MUTE_CHANNEL] = {
    action: () => muteChannel(channelId),
  };
  context[ChannelsActionType.NOTIFY_SETTINGS] = {
    action: () => showNotifyMenu(channelId),
  };

  if (permissionManager.canManageChannels()) {
    context[ChannelsActionType.EDIT_CHANNEL] = {
      action: () => editChannel(channelId),
    };
    context[ChannelsActionType.DELETE_CHANNEL] = {
      action: () => deleteChannel(channelId, currentGuildId),
    };
  }

  if (isDeveloperMode) {
    context[ActionType.COPY_ID] = { action: () => copyId(channelId) };
  }

  return context;
}

function createMessageContext(messageId, userId) {
  let context = {};

  context[MessagesActionType.ADD_REACTION] = {
    action: () => openReactionMenu(messageId),
  };

  if (userId === currentUserId) {
    context[MessagesActionType.EDIT_MESSAGE] = {
      action: () => openEditMessage(messageId),
    };
  }

  if (
    permissionManager.canManageMessages() ||
    (isOnDm && userId === currentUserId)
  ) {
    context[MessagesActionType.PIN_MESSAGE] = {
      action: () => pinMessage(messageId),
    };
  }

  context[MessagesActionType.REPLY] = {
    action: () => showReplyMenu(messageId, userId),
  };
  context[MessagesActionType.MARK_AS_UNREAD] = {
    action: () => markAsUnread(messageId),
  };

  if (isOnDm) {
    if (userId === currentUserId) {
      context[MessagesActionType.DELETE_MESSAGE] = {
        action: () => deleteMessage(messageId),
      };
    }
  } else {
    if (permissionManager.canManageMessages())
      context[MessagesActionType.DELETE_MESSAGE] = {
        action: () => deleteMessage(messageId),
      };
  }

  if (isDeveloperMode) {
    context[ActionType.COPY_ID] = { action: () => copyId(messageId) };
  }

  return context;
}

function createMenuItem(label, itemOptions) {
  const li = createEl("li", { textContent: label });
  li.addEventListener("click", function (event) {
    event.stopPropagation();
    hideContextMenu();
    if (itemOptions.action) {
      itemOptions.action();
    }
  });

  if (itemOptions.subOptions) {
    const subUl = createEl("ul");
    itemOptions.subOptions.forEach((subOption) => {
      const subLi = createMenuItem(subOption.label, {
        action: subOption.action,
      });
      subUl.appendChild(subLi);
    });
    li.appendChild(subUl);

    li.addEventListener("mouseenter", function () {
      const subMenu = li.querySelector("ul");
      subMenu.style.display = "block";

      subMenu.style.left = "100%";
      subMenu.style.right = "auto";

      const subRect = subMenu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      if (subRect.right > viewportWidth) {
        subMenu.style.left = "auto";
        subMenu.style.right = "100%";
      } else if (subRect.left < 0) {
        subMenu.style.left = "0";
        subMenu.style.right = "auto";
      }
    });

    li.addEventListener("mouseleave", function () {
      const subMenu = li.querySelector("ul");
      subMenu.style.display = "none";
    });
  }

  return li;
}

function showContextMenu(x, y, options) {
  hideContextMenu();
  const tempContextMenu = createEl("div", {
    id: "contextMenu",
    className: "context-menu",
  });
  const ul = createEl("ul");
  for (const key in options) {
    if (options.hasOwnProperty(key)) {
      const itemOptions = options[key];
      const li = createMenuItem(key, itemOptions);
      ul.appendChild(li);
    }
  }
  tempContextMenu.appendChild(ul);
  document.body.appendChild(tempContextMenu);

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const menuWidth = tempContextMenu.offsetWidth;
  const menuHeight = tempContextMenu.offsetHeight;

  let left = Math.min(x, viewportWidth - menuWidth);
  let top = Math.min(y, viewportHeight - menuHeight);

  tempContextMenu.style.setProperty("--menu-left", `${left}px`);
  tempContextMenu.style.setProperty("--menu-top", `${top}px`);

  contextMenu = tempContextMenu;

  document.addEventListener("click", clickOutsideContextMenu);
}

function clickOutsideContextMenu(event) {
  if (
    contextMenu &&
    !contextMenu.contains(event.target) &&
    !contextList[event.target.id]
  ) {
    hideContextMenu();
  }
}

function hideContextMenu() {
  if (contextMenu) {
    contextMenu.remove();
    contextMenu = null; // Reset contextMenu variable
    document.removeEventListener("click", clickOutsideContextMenu);
  }
}


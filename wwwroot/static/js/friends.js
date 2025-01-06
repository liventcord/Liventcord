const addFriendDiscriminatorErrorText = "Tanımlayıcı geçersiz! (#0000)";


let isAddFriendsOpen = false;

let currentSelectedStatus = null;
let friendsContainer = null;
let friends_cache = {};
let fetchUsersTimeout = null;

let existingFriends = null;
let isPopulating = false;

const offline = "offline";
const online = "online";
const all = "all";
const pending = "pending";
const blocked = "blocked";






const FriendErrorType = {
  INVALID_EVENT: "INVALID_EVENT",
  CANNOT_ADD_SELF: "CANNOT_ADD_SELF",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  INVALID_IDENTIFIER: "INVALID_IDENTIFIER",
  FRIEND_REQUEST_EXISTS: "FRIEND_REQUEST_EXISTS",
  FRIEND_REQUEST_NOT_EXISTS: "FRIEND_REQUEST_NOT_EXISTS",
  REQUEST_ALREADY_ACCEPTED: "REQUEST_ALREADY_ACCEPTED",
  NOT_FRIENDS: "NOT_FRIENDS",
  REQUEST_NOT_SENT: "REQUEST_NOT_SENT",
  SUCCESS: "SUCCESS",
};
const FRIEND_REQUEST_TYPE = {
  ADD_FRIEND_REQUEST: "add_friend_request",
  ACCEPT_FRIEND_REQUEST: "accept_friend_request",
  REMOVE_FRIEND_REQUEST: "remove_friend_request",
  REMOVE_FRIEND: "remove_friend",
  DENY_FRIEND: "deny_friend",
};


const errorMessages = {
  [FriendErrorType.INVALID_EVENT]: "Bilinmeyen hata!",
  [FriendErrorType.CANNOT_ADD_SELF]: "Kendinle arkadaş olamazsın!",
  [FriendErrorType.USER_NOT_FOUND]: "Kullanıcı bulunamadı!",
  [FriendErrorType.INVALID_IDENTIFIER]: "Geçersiz tanımlayıcı!",
  [FriendErrorType.FRIEND_REQUEST_EXISTS]: "Bu kullanıcıya zaten istek gönderdin!",
  [FriendErrorType.FRIEND_REQUEST_NOT_EXISTS]: "Bu kullanıcıya istek göndermedin!",
  [FriendErrorType.REQUEST_ALREADY_ACCEPTED]: "Bu isteği zaten kabul ettin!",
  [FriendErrorType.NOT_FRIENDS]: "Bu kullanıcıyla arkadaş değilsin!",
  [FriendErrorType.REQUEST_NOT_SENT]: "Bu kullanıcı sana istek göndermedi!",
  [FriendErrorType.SUCCESS]: "İşlem başarıyla gerçekleştirildi!",
};

class Friend {
  constructor(friend) {
    this.userId = friend.userId;
    this.name = friend.nickName;
    this.discriminator = friend.discriminator;
    this.status = friend.status;
    this.isOnline = friend.isOnline;
    this.description = friend.description;
    this.createdAt = friend.createdAt;
    this.lastLogin = friend.lastLogin;
    this.socialMediaLinks = friend.socialMediaLinks;
    this.isFriendRequestToUser = friend.isFriendRequestToUser;
  }

  isPending() {
    return this.isFriendRequestToUser;
  }
}

class FriendsCache {
  constructor() {
    this.friendsCache = {};
    this.dmFriends = {};
  }
  setupDmFriends(friends) {
    this.dmFriends = friends;
  }
  initialiseFriends(initData) {
    this.friendsCache = initData;
    populateFriendsContainer(this.friendsCache);
  }

  addFriend(friend) {
    this.friendsCache[friend.id] = friend;
  }

  isFriend(userId) {
    if (userId === currentUserId) {
      return false;
    }
    if (!this.friendsCache) {
      return false;
    }
    return userId in this.friendsCache;
  }
  userExistsDm(userId) {
    return userId in this.dmFriends;
  }

  isOnline(userId) {
    if (!this.friendsCache || !this.friendsCache[userId]) {
      return false;
    }
    return this.friendsCache[userId].isOnline;
  }
}



function displayFriendsMessage(msg) {
  printFriendMessage(msg);
  if (currentSelectedStatus === pending && !isAddFriendsOpen) {
    getFriends(pending);
  }
}

function handleAddFriendResponse(message) {
  const { userId, userNick: userNick, user_data: userData, isSuccess } = message;
  const text = isSuccess
    ? `${userNick} kullanıcısına arkadaşlık isteği gönderildi.`
    : errorMessages[FriendErrorType.FRIEND_REQUEST_EXISTS];
  displayFriendsMessage(text);
}

function handleAcceptFriendRequestResponse(message) {
  const { userId, userNick: userNick, user_data: userData, isSuccess } = message;
  const text = isSuccess
    ? `${userNick} kullanıcısından gelen arkadaşlık isteği kabul edildi.`
    : errorMessages[FriendErrorType.REQUEST_ALREADY_ACCEPTED];

  if (isSuccess) {
    friends_cache[userId] = userData;
    disableElement("pendingAlertRight");
    disableElement("pendingAlertLeft");
    document.title = "LiventCord";
  }

  displayFriendsMessage(text);
}

function handleRemoveFriendResponse(message) {
  const { userId, userNick: userNick, isSuccess } = message;
  const text = isSuccess
    ? `${userNick} kullanıcısı arkadaşlıktan çıkarıldı.`
    : errorMessages[FriendErrorType.NOT_FRIENDS];

  if (isSuccess) {
    const friCard = friendsContainer.querySelector(`#${CSS.escape(userId)}`);
    if (friCard) {
      friCard.remove();
    }
    reCalculateFriTitle();
  }

  displayFriendsMessage(text);
}

function handleDenyFriendRequestResponse(message) {
  const { userId, userNick: userNick, isSuccess } = message;
  const text = isSuccess
    ? `${userNick} kullanıcısından gelen arkadaşlık isteği reddedildi.`
    : errorMessages[FriendErrorType.REQUEST_NOT_SENT];

  displayFriendsMessage(text);
}

function handleFriendEventResponse(message) {
  const { type } = message;

  switch (type) {
    case FriendRequestType.add_friend_request:
    case FriendRequestType.add_friend_request_id:
      handleAddFriendResponse(message);
      break;
    case FriendRequestType.accept_friend_request:
      handleAcceptFriendRequestResponse(message);
      break;
    case FriendRequestType.remove_friend_request:
      handleRemoveFriendResponse(message);
      break;
    case FriendRequestType.remove_friend:
      handleRemoveFriendResponse(message);
      break;
    case FriendRequestType.deny_friend_request:
      handleDenyFriendRequestResponse(message);
      break;
    default:
      displayFriendsMessage(errorMessages[FriendErrorType.INVALID_EVENT]);
  }
}

function updateFriendsList(friends, isPending) {
  if (!data) {
    console.warn("Empty friend list data.");
    return;
  }

  if (isAddFriendsOpen) return;

  const friendInstances = friends.map((friend) => new Friend(friend));

  if (isPending) {
    let pendingCounter = 0;
    friendInstances.forEach((friend) => {
      if (friend.isPending()) {
        pendingCounter += 1;
      }
    });

    if (pendingCounter > 0) {
      getId("pendingAlertLeft").textContent = pendingCounter;
      enableElement("pendingAlertLeft");
      getId("pendingAlertRight").textContent = pendingCounter;
      enableElement("pendingAlertRight");
      setWindowName(pendingCounter);
    }

    return;
  }

  populateFriendsContainer(friendInstances, isPending);
}

function addPendingButtons(friendButton, friend) {
  const acceptButton = createButtonWithBubblesImg(
    friendButton,
    ButtonTypes.TickBtn,
    "Kabul Et",
  );
  acceptButton.addEventListener("click", (event) =>
    handleButtonClick(event, EventType.ADD_FRIEND, friend),
  );

  const closeButton = createButtonWithBubblesImg(
    friendButton,
    ButtonTypes.CloseBtn,
    translations.translations["cancel"]
  );
  closeButton.addEventListener("click", (event) =>
    handleButtonClick(
      event,
      friend.isFriendsRequestsToUser
        ? EventType.ADD_FRIEND
        : EventType.ADD_FRIEND_ID,
      friend,
    ),
  );
}

function handleButtonClick(event, action, friend) {
  event.stopPropagation();
  apiClient.send(action, { friendId: friend.userId });
}

function addFriend(userId) {
  apiClient.send(EventType.ADD_FRIEND_ID, { friendId: userId });
}

function submitAddFriend() {
  const addfriendinput = getId("addfriendinputfield");
  const currentValue = addfriendinput.value.trim();

  if (currentValue && currentValue.length > 0) {
    if (!isValidFriendName(currentValue)) {
      displayFriendsMessage(addFriendDiscriminatorErrorText);
      return;
    }

    const { nickName: nickName, discriminator } =
      parseUsernameDiscriminator(currentValue);
    if (!nickName || !discriminator) {
      return;
    }

    apiClient.send(EventType.ADD_FRIEND, {
      friendName: nickName,
      friendDiscriminator: discriminator,
    });
  }
}



function filterFriends() {
  const input = getId("friendsSearchInput").value.toLowerCase();
  const friends = document.getElementsByClassName("friend-card");

  for (let i = 0; i < friends.length; i++) {
    const friendName = friends[i].getAttribute("data-name").toLowerCase();
    if (friendName.includes(input)) {
      friends[i].classList.add("visible");
    } else {
      friends[i].classList.remove("visible");
    }
  }
}

function toggleButtonState(booleanstate) {
  if (booleanstate) {
    addButton.classList.add("active");
    addButton.classList.remove("inactive");
  } else {
    addButton.classList.add("inactive");
    addButton.classList.remove("active");
  }
}

const friendCache = new FriendsCache();
let buttonElements = {};
let ButtonsList = {};
document.addEventListener("DOMContentLoaded", function () {

  window.addEventListener("resize", handleResize);
  friendsContainer = getId("friends-container");

  buttonElements = {
    online: getId("online-button"),
    all: getId("all-button"),
    pending: getId("pending-button"),
    blocked: getId("blocked-button"),
  };
  ButtonsList = Object.values(buttonElements);
  initializeButtonsList(ButtonsList);

});

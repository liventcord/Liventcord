const addFriendDiscriminatorErrorText = "Tanımlayıcı geçersiz! (#0000)";

const addfriendhighlightedcolor = "#248046";
const addfrienddefaultcolor = "#248046";
const highlightedColor = "#43444b";
const defaultColor = "#313338";
const grayColor = "#c2c2c2";
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

const OnlineText = "Çevrim İçi";
const OfflineText = "Çevrim Dışı";
const PendingText = "Bekleyen";
const BlockedText = "Engellenen";
const allText = "Tümü";



function getId(string) {
  return document.getElementById(string);
}

const buttonElements = {
  online: getId("OnlineButton"),
  all: getId("AllButton"),
  pending: getId("PendingButton"),
  blocked: getId("BlockedButton"),
};
let ButtonsList = Object.values(buttonElements);

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
  }

  initialiseFriends(initData) {
    this.friendsCache = initData;
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

  isOnline(userId) {
    if (!this.friendsCache || !this.friendsCache[userId]) {
      return false;
    }
    return this.friendsCache[userId].isOnline;
  }
}

function getFriendsTranslation() {
  switch (currentSelectedStatus) {
    case online:
      return OnlineText;
    case offline:
      return OfflineText;
    case pending:
      return PendingText;
    case blocked:
      return BlockedText;
    case all:
      return allText;
    default:
      return "";
  }

}

function displayFriendsMessage(msg) {
  print_message(msg);
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
    "İptal Et",
  );
  closeButton.addEventListener("click", (event) =>
    handleButtonClick(
      event,
      friend.is_friends_requests_to_user
        ? EventType.ADD_FRIEND
        : EventType.ADD_FRIEND_ID,
      friend,
    ),
  );
}

function handleButtonClick(event, action, friend) {
  event.stopPropagation();
  socket.emit(action, { friendId: friend.userId });
}

function addFriend(userId) {
  socket.emit(EventType.ADD_FRIEND_ID, { friendId: userId });
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

    socket.emit(EventType.ADD_FRIEND, {
      friendName: nickName,
      friendDiscriminator: discriminator,
    });
  }
}

async function getFriends(request_type) {
  if (!isAddFriendsOpen) {
    try {
      socket.emit(EventType.GET_FRIENDS, { requestType: request_type });
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
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

document.addEventListener("DOMContentLoaded", function () {
  updateDmsList(passed_dm_friends);
  friendCache.initialiseFriends(passed_friends_status);
  window.addEventListener("resize", handleResize);
  friendsContainer = getId("friends-container");

  initializeButtonsList(ButtonsList);
  selectFriendMenu(buttonElements.online);
});

class Translations {
  constructor() {
    this.currentLanguage = 'en';
    this.enLocale = "en-us";
    this.trLocale = "tr-TR";
    this.userListTitleHTML = '';
    
    this.translations = {
      en: {
        "online": "Online",
        "offline": "Offline",
        "pending": "Pending",
        "blocked": "Blocked",
        "all": "All",
        "incoming-friend-request": "Incoming Friend Request",
        "outgoing-friend-request": "Outgoing Friend Request",
        "dms-title": "Direct Messages",
        "friend-label": "Friends",
        "user-list-title": "Now Online",
        "online-button": "Online",
        "all-button": "All",
        "pending-button": "Pending",
        "blocked-button": "Blocked",
        "open-friends-button": "Add Friend",
        "channel-info-for-friend": "Friends",
        "preview-image-button": "Open in Browser",
        "sound-panel-status": "Sound connection established",
        "left-settings-title": "User Settings",
        "my-account-button": "My Account",
        "sound-and-video-button": "Sound and Video",
        "notifications-button": "Notifications",
        "activity-presence-button": "Activity Privacy",
        "log-out-button": "Log Out",
        "new-messages-span": "Mark as Read",
        "global-search-input": "Find or Start a Chat",
        "invite-dropdown-button": "Invite People",
        "settings-dropdown-button": "Server Settings",
        "channel-dropdown-button": "Create Channel",
        "notifications-dropdown-button": "Notification Settings",
        "exit-dropdown-button": "Leave Server",
        "new-channel-placeholder": 'new-channel',
        "channel-type-description": 'Send messages, images, GIFs, emojis, ideas, and jokes',
        "channel-type-voice-description": 'Talk or video chat together, or share your screen',
        "special-chan-text": 'Private Channel',
        "cancel-pending-text": "Cancel",
        "tb-call": "Start Voice Call",
        "tb-video-call": "Start Video Call",
        "tb-pin": "Pinned Messages",
        "tb-createdm": "Add Friend to DM",
        "tb-showprofile": "Show User Profile",
        "today": "Today at",
        "yesterday": "Yesterday at",
        "message_placeholder": "Send a message to channel #{{channelName}}",
      },

      tr: {
        "online": "Çevrim İçi",
        "offline": "Çevrim Dışı",
        "pending": "Bekleyen",
        "blocked": "Engellenen",
        "all": "Tümü",
        "incoming-friend-request": "Gelen Arkadaş İsteği",
        "outgoing-friend-request": "Giden Arkadaş İsteği",
        "dms-title": "Direkt Mesajlar",
        "friend-label": "Arkadaşlar",
        "user-list-title": "Şimdi Aktif",
        "online-button": "Çevrim İçi",
        "all-button": "Tümü",
        "pending-button": "Bekleyen",
        "blocked-button": "Engellenen",
        "open-friends-button": "Arkadaş Ekle",
        "channel-info-for-friend": "Arkadaşlar",
        "preview-image-button": "Tarayıcıda aç",
        "sound-panel-status": "Ses bağlantısı kuruldu",
        "left-settings-title": "Kullanıcı Ayarları",
        "my-account-button": "Hesabım",
        "sound-and-video-button": "Ses Ve Görüntü",
        "notifications-button": "Bildirimler",
        "activity-presence-button": "Etkinlik Gizliliği",
        "log-out-button": "Çıkış yap",
        "new-messages-span": "Okunmuş olarak işaretle",
        "global-search-input": "Sohbet bul ya da başlat",
        "invite-dropdown-button": "İnsanları Davet Et",
        "settings-dropdown-button": "Sunucu Ayarları",
        "channel-dropdown-button": "Kanal Oluştur",
        "notifications-dropdown-button": "Bildirim Ayarları",
        "exit-dropdown-button": "Sunucudan Ayrıl",
        "new-channel-placeholder": 'yeni-kanal',
        "channel-type-description": 'Mesajlar, resimler, GIF\'ler, emojiler, fikirler ve şakalar gönder',
        "channel-type-voice-description": 'Birlikte sesli veya görüntülü konuşun veya ekran paylaşın',
        "special-chan-text": 'Özel Kanal',
        "cancel-pending-text": "İptal",
        "tb-call": "Sesli Arama Başlat",
        "tb-video-call": "Görüntülü Arama Başlat",
        "tb-pin": "Sabitlenmiş Mesajlar",
        "tb-createdm": "DM'ye Arkadaş Ekle",
        "tb-showprofile": "Kullanıcı Profilini Göster",
        "today": "Bugün saat",
        "yesterday": "Dün saat",
        "message_placeholder": "#{{channelName}} kanalına mesaj gönder",
      }
    };
  }

  getMessagePlaceholder(channelName) {
    const placeholderTemplate = this.translations[this.currentLanguage]?.message_placeholder;
    if (!placeholderTemplate) {
      console.error("Can't find placeholder translation");
      return '';
    }
    return placeholderTemplate.replace("{{channelName}}", truncateString(channelName, 30));
  }
  

  initializeTranslations() {
    const currentTranslations = this.translations[this.currentLanguage];
    
    if (!currentTranslations) {
      console.error(`No translations found for language: ${this.currentLanguage}`);
      return;
    }
    
    Object.keys(currentTranslations).forEach(key => {
      const element = getId(key);
      if (element) {
        const textToUse = currentTranslations[key];
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          element.placeholder = textToUse;
        } else {
          if(element.className == "iconWrapper") {
            element.ariaLabel = textToUse;      
          } else {
            console.log("Set text for: ",key, " as: ",textToUse)
            element.textContent = textToUse;
          }
        }
      }
    });
  }

  updateUserListText() {
    const userList = getId('userList');
    if (userList) {
      userList.innerHTML = this.userListTitleHTML;
    }
  }

  getTranslation(key) {
    const result = this.translations[this.currentLanguage]?.[key] ?? null;
    if (!result) {
      console.error("Cant find translation for:", key);
    }
    return result;
  }
  

  getLocale() {
    return this.currentLanguage === 'en' ? this.enLocale : this.trLocale;
  }

  setLanguage(language) {
    this.currentLanguage = language;
    this.initializeTranslations();
  }
}

const translations = new Translations();
translations.setLanguage('en');
//translations.initializeTranslations();

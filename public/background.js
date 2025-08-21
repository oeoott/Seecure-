let isProtectionEnabled = false;
let protectedUrls = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'TOGGLE_PROTECTION':
      isProtectionEnabled = message.enabled;
      if (isProtectionEnabled) {
        protectedUrls = message.urls;
      } else {
        protectedUrls = [];
      }
      console.log('보호 모드 상태 변경:', isProtectionEnabled);
      console.log('보호할 URL 목록 업데이트:', protectedUrls);
      break;

    // Home.jsx가 현재 상태를 물어보면 알려주는 역할
    case 'GET_PROTECTION_STATUS':
      sendResponse({
        enabled: isProtectionEnabled,
        urls: protectedUrls
      });
      break;
  }
});

chrome.action.onClicked.addListener(() => {
  const url = chrome.runtime.getURL("index.html");
  chrome.tabs.create({ url: url });
});
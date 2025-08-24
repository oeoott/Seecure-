let isProtectionEnabled = false;
let protectedUrls = [];
let detectionInterval = null;
const OFFSCREEN_DOCUMENT_PATH = '/offscreen.html';

// --- 메시지 리스너 (UI와 통신) ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'TOGGLE_PROTECTION':
      isProtectionEnabled = message.enabled;
      console.log('보호 모드 상태 변경:', isProtectionEnabled);
      if (isProtectionEnabled) {
        protectedUrls = message.urls;
        console.log('보호할 URL 목록 업데이트:', protectedUrls);
        startDetection();
      } else {
        protectedUrls = [];
        stopDetection();
      }
      sendResponse({ success: true });
      break;
    
    case 'GET_PROTECTION_STATUS':
      sendResponse({ enabled: isProtectionEnabled, urls: protectedUrls });
      break;
  }
  return true;
});

// --- 확장 프로그램 아이콘 클릭 시 ---
chrome.action.onClicked.addListener(() => {
  const url = chrome.runtime.getURL("index.html");
  chrome.tabs.create({ url: url });
});


// --- 실제 감지 로직 ---
function startDetection() {
  if (detectionInterval) return;
  console.log("얼굴 감지를 시작합니다...");
  detectionInterval = setInterval(async () => {
    try {
      const frameDataUrl = await captureWebcamFrame();
      if (!frameDataUrl) {
        console.warn("웹캠 프레임 캡처 실패.");
        return;
      }

      const fetchResponse = await fetch(frameDataUrl);
      const frameBlob = await fetchResponse.blob();

      const formData = new FormData();
      formData.append('file', frameBlob, 'frame.jpg');

      const apiResponse = await fetch('http://127.0.0.1:8000/api/v1/ai/detect-frame', {
        method: 'POST',
        body: formData,
      });

      if (!apiResponse.ok) throw new Error(`Server error: ${apiResponse.status}`);
      
      const result = await apiResponse.json();
      console.log('[AI 감지 결과]', result);

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (tab && tab.url) {
        const isProtectedUrl = protectedUrls.some(url => tab.url.includes(url));

        if (result.intruder_alert === true && isProtectedUrl) {
          console.log("침입자 감지! 보호 조치를 실행합니다.");
          chrome.tabs.sendMessage(tab.id, { type: 'APPLY_BLUR', blurAmount: 15 });
          chrome.tabs.sendMessage(tab.id, { type: 'SHOW_ALERT_POPUP' });
        } else {
          if(result.intruder_alert === true && !isProtectedUrl){
            console.log("침입자 감지! 하지만 현재 URL이 보호 목록에 없어 보호 조치를 해제합니다.");
          } else {
            console.log("침입자가 감지되지 않음. 보호 조치를 해제합니다.");
          }
          chrome.tabs.sendMessage(tab.id, { type: 'REMOVE_BLUR' });
        }
      }

    } catch (error) {
      console.error("감지 루프 중 에러 발생:", error);
      stopDetection();
    }
  }, 2000);
}

function stopDetection() {
  // 1. 열려있는 모든 탭을 찾아서
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      // 2. 각 탭에게 "블러 제거" 메시지를 보냄
      try {
        chrome.tabs.sendMessage(tab.id, { type: 'REMOVE_BLUR' });
      } catch (e) {
        console.log(`Tab ${tab.id}에 메시지를 보낼 수 없습니다. (무시해도 괜찮음)`);
      }
    }
  });

  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
    console.log("얼굴 감지를 중단합니다.");
    closeOffscreenDocument();
  }
}


// --- Offscreen Document 관련 함수 ---
async function captureWebcamFrame() {
  await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('프레임 캡처 시간 초과')), 5000);

    chrome.runtime.onMessage.addListener(function listener(message) {
      if (message.type === 'frame-captured') {
        clearTimeout(timeout);
        chrome.runtime.onMessage.removeListener(listener);
        resolve(message.dataUrl); 
      } else if (message.type === 'capture-error') {
        clearTimeout(timeout);
        chrome.runtime.onMessage.removeListener(listener);
        reject(new Error(message.error));
      }
    });

    chrome.runtime.sendMessage({
      type: 'capture-frame',
      target: 'offscreen',
    });
  });
}

async function hasOffscreenDocument(path) {
  const offscreenUrl = chrome.runtime.getURL(path);
  // @ts-ignore
  const matchedClients = await clients.matchAll();
  return matchedClients.some(c => c.url === offscreenUrl);
}

async function setupOffscreenDocument(path) {
  if (await hasOffscreenDocument(path)) {
    return;
  }
  await chrome.offscreen.createDocument({
    url: path,
    reasons: ['USER_MEDIA'],
    justification: '웹캠 접근을 위해 필요합니다.',
  });
}

async function closeOffscreenDocument() {
  if (await hasOffscreenDocument(OFFSCREEN_DOCUMENT_PATH)) {
    await chrome.offscreen.closeDocument();
  }
}
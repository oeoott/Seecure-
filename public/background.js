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
      // 1. offscreen으로부터 이미지 텍스트(Data URL)를 받아옴
      const frameDataUrl = await captureWebcamFrame();
      if (!frameDataUrl) {
        console.warn("웹캠 프레임 캡처 실패.");
        return;
      }

      // 2. 받아온 Data URL을 다시 이미지 파일(Blob)로 변환
      const fetchResponse = await fetch(frameDataUrl);
      const frameBlob = await fetchResponse.blob();

      const formData = new FormData();
      formData.append('file', frameBlob, 'frame.jpg');

      // 3. 실제 AI 서버 주소로 fetch 요청
      // https://[개인 pc ip 주소]:[포트 번호]/api/v1/ai/detect-frame
      const apiResponse = await fetch('http://127.0.0.1:8000/api/v1/ai/detect-frame', {
        method: 'POST',
        body: formData,
      });

      if (!apiResponse.ok) throw new Error(`Server error: ${apiResponse.status}`);
      
      const result = await apiResponse.json();
      console.log('[AI 감지 결과]', result);

    } catch (error) {
      console.error("감지 루프 중 에러 발생:", error);
      stopDetection();
    }
  }, 2000);
}

function stopDetection() {
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
// public/offscreen.js
// 오프스크린 문서에서 getUserMedia로 프레임 캡처

let stream = null;
let video = null;
let canvas = null;

// 초기화: video/canvas 생성 및 스트림 연결
async function init() {
  if (!video) {
    video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
  }
  if (!canvas) {
    canvas = document.createElement("canvas");
  }
  if (!stream) {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      video.srcObject = stream;
      await video.play();
    } catch (e) {
      chrome.runtime.sendMessage({ type: "capture-error", error: String(e?.message || e) }).catch(()=>{});
      throw e;
    }
  }
}

// 프레임 캡처
async function captureFrame() {
  await init();
  const w = video.videoWidth || 640;
  const h = video.videoHeight || 480;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.9);
}

// 메시지 수신 → 프레임 캡처 수행
chrome.runtime.onMessage.addListener((msg) => {
  (async () => {
    if (msg?.type === "capture-frame" && msg?.target === "offscreen") {
      try {
        const dataUrl = await captureFrame();
        chrome.runtime.sendMessage({ type: "frame-captured", dataUrl }).catch(()=>{});
      } catch (e) {
        chrome.runtime.sendMessage({ type: "capture-error", error: String(e?.message || e) }).catch(()=>{});
      }
    }
  })();
});

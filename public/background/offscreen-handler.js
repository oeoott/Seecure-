// public/background/offscreen-handler.js
// 오프스크린 문서를 통한 웹캠 프레임 캡처 유틸

import { OFFSCREEN_DOCUMENT_PATH } from "./config.js";

// 오프스크린 문서 존재 여부 확인
export async function hasOffscreenDocument(path) {
  const offscreenUrl = chrome.runtime.getURL(path);
  const matched = await clients.matchAll();
  return matched.some((c) => c.url === offscreenUrl);
}

// 오프스크린 문서 생성
export async function setupOffscreenDocument(path = OFFSCREEN_DOCUMENT_PATH) {
  try {
    if (await hasOffscreenDocument(path)) return;
    await chrome.offscreen.createDocument({
      url: path,
      reasons: ["USER_MEDIA"],
      justification: "웹캠 프레임 캡처"
    });
  } catch (e) {
    console.warn("offscreen createDocument:", e);
  }
}

// 오프스크린 문서 닫기
export async function closeOffscreenDocument(path = OFFSCREEN_DOCUMENT_PATH) {
  if (await hasOffscreenDocument(path)) {
    await chrome.offscreen.closeDocument();
  }
}

// 웹캠 프레임 캡처
export async function captureWebcamFrame() {
  await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("프레임 캡처 시간 초과")), 6000);
    const listener = (message) => {
      if (message.type === "frame-captured") {
        clearTimeout(timeout);
        chrome.runtime.onMessage.removeListener(listener);
        resolve(message.dataUrl);
      } else if (message.type === "capture-error") {
        clearTimeout(timeout);
        chrome.runtime.onMessage.removeListener(listener);
        reject(new Error(message.error || "capture-error"));
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    chrome.runtime.sendMessage({ type: "capture-frame", target: "offscreen" }).catch(() => {});
  });
}

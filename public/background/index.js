// public/background/index.js
// 확장 프로그램 부팅 시 상태 복원 및 감지 루프 시작, 메시지 라우터 등록

import { loadState, getState } from "./state.js";
import { startDetection } from "./detection-loop.js";
import "./message-router.js";

// 최초 실행 시 상태 로드 및 감지 시작
(async () => {
  await loadState();
  if (getState().isProtectionEnabled) startDetection();
  console.log("Seecure hydrated:", getState());
})();

// 브라우저 시작 시 상태 복원
chrome.runtime.onStartup?.addListener(async () => {
  await loadState();
  if (getState().isProtectionEnabled) startDetection();
});

// 확장 프로그램 설치/업데이트 시 상태 복원
chrome.runtime.onInstalled?.addListener(async () => {
  await loadState();
  if (getState().isProtectionEnabled) startDetection();
});

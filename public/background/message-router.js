// public/background/message-router.js
// 확장 내부 메시지 라우터: 옵션/상태 조회 및 동기화, 보호 모드 토글 처리

import { getState, setOptions, setUrls, saveOptions, saveEnabled, setEnabled } from "./state.js";
import { clearBlurEverywhere } from "./content-bridge.js";
import { startDetection, stopDetection } from "./detection-loop.js";
import { allHttpTabs } from "./utils.js";

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    // 옵션/URL 조회
    if (msg?.type === "GET_OPTIONS") {
      const { OPTIONS, PROTECTED_URLS } = getState();
      sendResponse?.({ ok: true, options: OPTIONS, urls: PROTECTED_URLS });
      return;
    }

    // 보호 모드 상태 조회
    if (msg?.type === "GET_PROTECTION_STATUS") {
      sendResponse?.({ enabled: getState().isProtectionEnabled });
      return;
    }

    // 옵션/URL 동기화
    if (msg?.type === "SYNC_OPTIONS") {
      const prevBlur = getState().OPTIONS.blur;
      if (msg.options) setOptions(msg.options);
      if (Array.isArray(msg.urls)) setUrls(msg.urls);

      // 이전에 블러가 켜져있다가 꺼진 경우 → 전체 탭 블러 제거
      if (prevBlur && !getState().OPTIONS.blur) {
        await clearBlurEverywhere(allHttpTabs);
      }

      await saveOptions();

      // 옵션 변경 브로드캐스트
      chrome.runtime.sendMessage({
        type: "OPTIONS_CHANGED",
        options: getState().OPTIONS,
        urls: getState().PROTECTED_URLS
      }).catch(() => {});
      
      sendResponse?.({ ok: true });
      return;
    }

    // 보호 모드 토글
    if (msg?.type === "TOGGLE_PROTECTION") {
      setEnabled(!!msg.enabled);
      if (Array.isArray(msg.urls)) setUrls(msg.urls);
      if (msg.options) setOptions(msg.options);

      await saveOptions();
      await saveEnabled();

      if (getState().isProtectionEnabled) {
        startDetection();
      } else {
        stopDetection();
        await clearBlurEverywhere(allHttpTabs);
      }

      sendResponse?.({
        ok: true,
        enabled: getState().isProtectionEnabled,
        options: getState().OPTIONS
      });
      return;
    }
  })().catch((err) => console.error("background onMessage error:", err));

  return true; // 비동기 응답 유지
});

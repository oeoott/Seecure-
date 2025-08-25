// public/background/detection-loop.js
// 보호 모드 감지 루프: 웹캠 프레임 캡처 → AI 서버 감지 → 결과에 따른 블러/배너 처리

import { API_BASE, LOOP_MS } from "./config.js";
import { getState, setDetectionInterval, touchAlertNow } from "./state.js";
import { getActiveHttpTab, allHttpTabs, isExcluded, urlMatchesProtectedList } from "./utils.js";
import { safeSend, hardClearTabBlur, clearBlurEverywhere } from "./content-bridge.js";
import { showBannerEverywhere } from "./ui.js";
import { captureWebcamFrame, closeOffscreenDocument } from "./offscreen-handler.js";

// 감지 루프 시작
export function startDetection() {
  const { detectionInterval } = getState();
  if (detectionInterval) return; // 이미 실행 중이면 중복 방지

  const id = setInterval(async () => {
    try {
      const { isProtectionEnabled, PROTECTED_URLS, OPTIONS, ALERT_COOLDOWN_MS, lastAlertAt } = getState();

      // 보호 모드 꺼짐/등록 URL 없음 → 블러 제거
      if (!isProtectionEnabled || PROTECTED_URLS.length === 0) {
        await clearBlurEverywhere(allHttpTabs);
        return;
      }

      // 웹캠 프레임 캡처 → AI 서버로 전송
      const frameDataUrl = await captureWebcamFrame();
      const blob = await (await fetch(frameDataUrl)).blob();
      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");

      const apiResponse = await fetch(`${API_BASE}/api/v1/ai/detect-frame`, { method: "POST", body: formData });
      if (!apiResponse.ok) throw new Error(`Server error: ${apiResponse.status}`);
      const result = await apiResponse.json();
      console.log("[AI 감지 결과]", result, "OPTIONS:", OPTIONS, "URLS:", PROTECTED_URLS);

      const tab = await getActiveHttpTab();
      if (!tab) return;

      // 제외 URL → 블러 제거
      if (isExcluded(tab.url)) {
        await hardClearTabBlur(tab.id);
        return;
      }

      // 보호 대상 URL에서 침입자 감지
      const match = urlMatchesProtectedList(tab.url, PROTECTED_URLS);
      if (result.intruder_alert === true && match) {
        // 블러 처리
        if (OPTIONS.blur) {
          const amt = Number(OPTIONS.blurAmount ?? 12);
          await safeSend(tab.id, { type: "APPLY_BLUR", blurAmount: amt, cursorBlur: false });
        } else {
          await hardClearTabBlur(tab.id);
        }

        // 경고 배너 (쿨다운 적용)
        if (OPTIONS.popup) {
          const now = Date.now();
          if (now - lastAlertAt >= ALERT_COOLDOWN_MS) {
            await showBannerEverywhere(tab.id);
            touchAlertNow();
          }
        }
      } else {
        await hardClearTabBlur(tab.id);
      }
    } catch (e) {
      console.error("감지 루프 에러:", e);
    }
  }, LOOP_MS);

  setDetectionInterval(id);
}

// 감지 루프 중지
export function stopDetection() {
  const { detectionInterval } = getState();
  if (detectionInterval) {
    clearInterval(detectionInterval);
    setDetectionInterval(null);
  }
  closeOffscreenDocument();
}

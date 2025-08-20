(() => {
  let overlay = null;        // 전체 화면 블러 오버레이
  let cursorBlur = null;     // 커서 블러 원
  let isEnabled = false;     // 페이지 블러 상태
  let isCursorBlur = false;  // 커서 블러 상태
  let blurAmount = 12;       // 기본 블러 강도(px)
  let mouseMoveBound = null; // 이벤트 핸들러 저장

  // 오버레이 생성/제거
  function ensureOverlay() {
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "seecure-blur-overlay";
      document.documentElement.appendChild(overlay);
    }
    overlay.style.backdropFilter = `blur(${blurAmount}px)`;
  }

  function removeOverlay() {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    overlay = null;
  }

  // 커서 블러 생성/제거
  function ensureCursorBlur() {
    if (!cursorBlur) {
      cursorBlur = document.createElement("div");
      cursorBlur.className = "seecure-cursor-blur";
      document.documentElement.appendChild(cursorBlur);
    }
    cursorBlur.style.backdropFilter = `blur(${Math.max(blurAmount, 8)}px)`;

    if (!mouseMoveBound) {
      mouseMoveBound = (e) => {
        // viewport 내에서만 이동
        const x = e.clientX;
        const y = e.clientY;
        cursorBlur.style.left = `${x}px`;
        cursorBlur.style.top = `${y}px`;
      };
      window.addEventListener("mousemove", mouseMoveBound, { passive: true });
    }
  }

  function removeCursorBlur() {
    if (mouseMoveBound) {
      window.removeEventListener("mousemove", mouseMoveBound);
      mouseMoveBound = null;
    }
    if (cursorBlur && cursorBlur.parentNode) cursorBlur.parentNode.removeChild(cursorBlur);
    cursorBlur = null;
  }

  // 상태 토글
  function applyEnabled(v) {
    isEnabled = v;
    if (isEnabled) ensureOverlay();
    else removeOverlay();
  }

  function applyCursorBlur(v) {
    isCursorBlur = v;
    if (isCursorBlur) ensureCursorBlur();
    else removeCursorBlur();
  }

  function applyBlurAmount(px) {
    blurAmount = Number(px) || 12;
    if (overlay) overlay.style.backdropFilter = `blur(${blurAmount}px)`;
    if (cursorBlur) cursorBlur.style.backdropFilter = `blur(${Math.max(blurAmount, 8)}px)`;
  }

  function removeAll() {
    applyEnabled(false);
    applyCursorBlur(false);
  }

  // popup → content 메시지 처리
  chrome.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
    switch (msg.type) {
      case "SET_ENABLED":
        applyBlurAmount(msg.blurAmount ?? blurAmount);
        applyEnabled(!!msg.enabled);
        break;
      case "SET_CURSOR_BLUR":
        applyBlurAmount(msg.blurAmount ?? blurAmount);
        applyCursorBlur(!!msg.enabled);
        break;
      case "SET_BLUR_AMOUNT":
        applyBlurAmount(msg.blurAmount);
        break;
      case "REMOVE_BLUR":
        removeAll();
        break;
      case "SYNC_STATE":
        if (msg.state) {
          applyBlurAmount(msg.state.blurAmount ?? blurAmount);
          applyEnabled(!!msg.state.enabled);
          applyCursorBlur(!!msg.state.cursorBlur);
        }
        break;
      default:
        break;
    }
  });

  // 페이지 이동/SPA 라우팅 등에서도 오버레이가 잘 붙어있게 document 변경 시 재보정
  const observer = new MutationObserver(() => {
    if (isEnabled && !overlay) ensureOverlay();
    if (isCursorBlur && !cursorBlur) ensureCursorBlur();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // 탭이 바뀌거나 프레임이 다시 로드될 때 초기 상태는 팝업에서 SYNC_STATE로 맞춰줌.
})();

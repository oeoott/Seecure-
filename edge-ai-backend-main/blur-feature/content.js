/* content.js */
(() => {
  let overlay = null;
  let cursorBlur = null;
  let isEnabled = false;
  let isCursorBlur = false;
  let blurAmount = 12;
  let mouseMoveBound = null;

  const ORIGIN = location.origin;
  const STATE_KEY = `state:${ORIGIN}`;

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
  function ensureCursorBlur() {
    if (!cursorBlur) {
      cursorBlur = document.createElement("div");
      cursorBlur.className = "seecure-cursor-blur";
      document.documentElement.appendChild(cursorBlur);
    }
    cursorBlur.style.backdropFilter = `blur(${Math.max(blurAmount, 8)}px)`;
    if (!mouseMoveBound) {
      mouseMoveBound = (e) => {
        cursorBlur.style.left = `${e.clientX}px`;
        cursorBlur.style.top  = `${e.clientY}px`;
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

  function applyEnabled(v) { isEnabled = v; v ? ensureOverlay() : removeOverlay(); }
  function applyCursorBlur(v){ isCursorBlur = v; v ? ensureCursorBlur() : removeCursorBlur(); }
  function applyBlurAmount(px){
    blurAmount = Number(px) || 12;
    if (overlay) overlay.style.backdropFilter = `blur(${blurAmount}px)`;
    if (cursorBlur) cursorBlur.style.backdropFilter = `blur(${Math.max(blurAmount, 8)}px)`;
  }
  function removeAll(){ applyEnabled(false); applyCursorBlur(false); }

  // 🔹 새로고침/이동 후에도 상태 유지: 초기 로드에서 스토리지 값을 적용
  async function initFromStorage() {
    try {
      const data = await chrome.storage.local.get(STATE_KEY);
      const st = data[STATE_KEY];
      if (st) {
        applyBlurAmount(st.blurAmount ?? 12);
        applyEnabled(!!st.enabled);
        applyCursorBlur(!!st.cursorBlur);
      }
    } catch (e) {
      console.warn("initFromStorage failed:", e);
    }
  }

  chrome.runtime.onMessage.addListener((msg) => {
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
    }
  });

  const observer = new MutationObserver(() => {
    if (isEnabled && !overlay) ensureOverlay();
    if (isCursorBlur && !cursorBlur) ensureCursorBlur();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // ✅ 첫 주입 시 상태 자동 복원
  initFromStorage();
})();

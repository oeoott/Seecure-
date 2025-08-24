// content.js — 블러 오버레이만 담당(알림은 BG에서만 띄움)
(() => {
  console.log("✅ Seecure content loaded");

  let overlay = null;
  let state = { enabled: false, cursorBlur: false, blurAmount: 12 };

  const imp = (el, prop, val) => el.style.setProperty(prop, String(val), "important");

  function ensureOverlay() {
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "seecure-blur-overlay";
      overlay.className = "seecure-blur-overlay";
      (document.body || document.documentElement).appendChild(overlay);
    }
    updateOverlay();
  }
  function removeOverlay() {
    overlay?.remove();
    overlay = null;
  }
  function updateOverlay() {
    if (!overlay) return;
    imp(overlay, "position", "fixed");
    imp(overlay, "pointer-events", "none");
    imp(overlay, "z-index", "2147483647");
    imp(overlay, "backdrop-filter", `blur(${state.blurAmount}px)`);
    imp(overlay, "-webkit-backdrop-filter", `blur(${state.blurAmount}px)`);

    if (state.cursorBlur) {
      imp(overlay, "width", "200px");
      imp(overlay, "height", "200px");
      imp(overlay, "border-radius", "50%");
    } else {
      imp(overlay, "width", "100vw");
      imp(overlay, "height", "100vh");
      imp(overlay, "border-radius", "0");
      imp(overlay, "left", "0");
      imp(overlay, "top", "0");
      imp(overlay, "transform", "");
    }
  }

  document.addEventListener("mousemove", (e) => {
    if (state.cursorBlur && overlay) {
      imp(overlay, "left", `${e.clientX}px`);
      imp(overlay, "top", `${e.clientY}px`);
      imp(overlay, "transform", "translate(-50%, -50%)");
    }
  }, { passive: true });

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    switch (msg?.type) {
      case "APPLY_BLUR":
        state.enabled = true;
        state.blurAmount = msg.blurAmount ?? 12;
        state.cursorBlur = msg.cursorBlur ?? false;
        ensureOverlay();
        break;

      case "REMOVE_BLUR":
        state.enabled = false;
        state.cursorBlur = false;
        removeOverlay();
        break;

      case "PING":
        sendResponse?.({ pong: true });
        return true;
    }
  });
})();

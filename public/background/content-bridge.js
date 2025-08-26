// public/background/content-bridge.js
// 컨텐츠 스크립트 주입, 메시지 전송, 블러 제거 유틸

// 컨텐츠 스크립트 강제 주입
export async function ensureContent(tabId) {
  try { await chrome.scripting.insertCSS({ target: { tabId }, files: ["content.css"] }); } catch {}
  try { await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] }); } catch {}
}

// 탭에 안전하게 메시지 전송 (없으면 컨텐츠 주입 후 재시도)
export async function safeSend(tabId, message) {
  try {
    await chrome.tabs.sendMessage(tabId, message);
    return true;
  } catch (e) {
    if (String(e?.message || "").includes("Receiving end does not exist")) {
      await ensureContent(tabId);
      try { 
        await chrome.tabs.sendMessage(tabId, message); 
        return true; 
      } catch (e2) { 
        console.warn("send 재시도 실패:", e2); 
        return false; 
      }
    }
    console.warn("send 실패:", e);
    return false;
  }
}

// 탭에서 블러 강제 제거
export async function hardClearTabBlur(tabId) {
  try { await chrome.tabs.sendMessage(tabId, { type: "REMOVE_BLUR" }); } catch {}
  try {
    await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      world: "MAIN",
      func: () => {
        const el = document.getElementById("seecure-blur-overlay");
        if (el) el.remove();
        const all = Array.from(document.querySelectorAll('*'));
        for (const n of all) {
          const st = getComputedStyle(n);
          if (
            st.position === "fixed" &&
            (st.backdropFilter?.includes("blur(") || st.webkitBackdropFilter?.includes("blur(")) &&
            (st.width === "100vw" || st.width === `${window.innerWidth}px`) &&
            (st.height === "100vh" || st.height === `${window.innerHeight}px`)
          ) n.remove();
        }
      }
    });
  } catch {}
}

// 모든 탭에서 블러 제거
export async function clearBlurEverywhere(allHttpTabsFn) {
  const tabs = await allHttpTabsFn();
  await Promise.all(tabs.map((t) => hardClearTabBlur(t.id)));
}

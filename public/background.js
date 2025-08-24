// background.js — 등록 URL에서만 동작 + 인앱/확장 페이지 제외 + 영구저장 + 쿨다운 배너 + 안정화

const ALERT_TEXT = "경고\n누군가 지켜보고 있습니다.";
const ICON_URL = chrome.runtime.getURL("icon-128.png");
const OFFSCREEN_DOCUMENT_PATH = "/offscreen.html";

// 🔧 배포/로컬 전환 용
const API_BASE = "http://127.0.0.1:8000"; // 예: "https://api.seecure.xyz"

// 인앱(대시보드)
const DASHBOARD_URL = "http://localhost:5173/";
const DASHBOARD_URL_PROD = "";

// 전역 상태
let detectionInterval = null;
let isProtectionEnabled = false;
let OPTIONS = { blur: true, popup: true, blurAmount: 12 };
let PROTECTED_URLS = [];


// 알림 쿨다운
let lastAlertAt = 0;
const ALERT_COOLDOWN_MS = 2000;

// ── 영구 저장 키
const OPT_KEY = "seecure:options";
const URLS_KEY = "seecure:urls";
const ENABLED_KEY = "seecure:enabled";

// ── 저장/복원
async function loadState() {
  const data = await chrome.storage.local.get([OPT_KEY, URLS_KEY, ENABLED_KEY]);
  OPTIONS = { blur: true, popup: true, ...(data[OPT_KEY] || {}) };
  PROTECTED_URLS = Array.isArray(data[URLS_KEY]) ? data[URLS_KEY] : [];
  isProtectionEnabled = !!data[ENABLED_KEY];
}
async function saveOptions() {
  await chrome.storage.local.set({ [OPT_KEY]: OPTIONS, [URLS_KEY]: PROTECTED_URLS });
}
async function saveEnabled() {
  await chrome.storage.local.set({ [ENABLED_KEY]: isProtectionEnabled });
}

// ── 워커 기동 시 복원
(async () => {
  try {
    await loadState();
    if (isProtectionEnabled) startDetection();
    console.log("Seecure hydrated:", { OPTIONS, PROTECTED_URLS, isProtectionEnabled });
  } catch (e) {
    console.warn("hydrate failed", e);
  }
})();
chrome.runtime.onStartup?.addListener(async () => {
  await loadState();
  if (isProtectionEnabled) startDetection();
});
chrome.runtime.onInstalled?.addListener(async () => {
  await loadState();
  if (isProtectionEnabled) startDetection();
});

// ── 유틸
async function getActiveHttpTab() {
  const [cur] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (cur && /^https?:\/\//.test(cur.url || "")) return cur;
  const [anyWeb] = await chrome.tabs.query({ url: ["http://*/*", "https://*/*"] });
  return anyWeb || null;
}
async function ensureContent(tabId) {
  try { await chrome.scripting.insertCSS({ target: { tabId }, files: ["content.css"] }); } catch {}
  try { await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] }); } catch {}
}
async function safeSend(tabId, message) {
  try {
    await chrome.tabs.sendMessage(tabId, message);
    return true;
  } catch (e) {
    if (String(e?.message || "").includes("Receiving end does not exist")) {
      await ensureContent(tabId);
      try { await chrome.tabs.sendMessage(tabId, message); return true; }
      catch (e2) { console.warn("send 재시도 실패:", e2); return false; }
    }
    console.warn("send 실패:", e);
    return false;
  }
}
function isExcluded(url) {
  if (!url) return true;
  const extBase = chrome.runtime.getURL(""); // 확장 내부 페이지 전부
  return (
    url.startsWith(extBase) ||
    url.startsWith("chrome://") ||
    url.startsWith(DASHBOARD_URL) ||
    (DASHBOARD_URL_PROD && url.startsWith(DASHBOARD_URL_PROD)) ||
    /^(https?:\/\/)(localhost|127\.0\.0\.1):5173\//.test(url)
  );
}
// 등록 URL에서만 동작 (빈 리스트면 어디에도 동작 안 함) — 도메인/스킴 혼합 대응
function urlMatchesProtectedList(url) {
  if (!url || isExcluded(url)) return false;
  if (PROTECTED_URLS.length === 0) return false;

  try {
    const u = new URL(url);
    return PROTECTED_URLS.some((p) => {
      try {
        if (/^https?:\/\//.test(p)) return u.href.startsWith(p);
        return u.hostname.includes(p);
      } catch { return url.includes(p); }
    });
  } catch {
    return PROTECTED_URLS.some((p) => url.includes(p));
  }
}

// 모든 http(s) 탭
async function allHttpTabs() {
  return await chrome.tabs.query({ url: ["http://*/*", "https://*/*"] });
}

// 하드 클리어(현재 탭에서 블러 잔여 흔적도 제거)
async function hardClearTabBlur(tabId) {
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
async function clearBlurEverywhere() {
  const tabs = await allHttpTabs();
  await Promise.all(tabs.map((t) => hardClearTabBlur(t.id)));
}

// ── OS 알림(최후)
function showSystemAlert(text = ALERT_TEXT, title = "경고") {
  try {
    chrome.notifications.create({
      type: "basic",
      iconUrl: ICON_URL,
      title,
      message: text,
      priority: 2,
      requireInteraction: true
    });
  } catch {}
}

// ── 어느 페이지든 뜨는 배너(popover → dialog → Shadow DOM → OS)
async function showBannerEverywhere(tabId, text = ALERT_TEXT, ttl = 6000) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      world: "MAIN",
      args: [text, ttl],
      func: (TEXT, TTL) => {
        const POP_ID  = "seecure-alert-popover";
        const DLG_ID  = "seecure-alert-dialog";
        const HOST_ID = "seecure-alert-host";

        // ✅ 새로 띄우기 전에 모든 프레임의 기존 배너 제거
        [POP_ID, DLG_ID, HOST_ID].forEach(id => {
          const el = document.getElementById(id);
          if (el) { try { el.hidePopover?.(); el.close?.(); } catch {} el.remove(); }
        });

        const imp = (el, p, v) => el.style.setProperty(p, String(v), "important");
        const [line1, ...rest] = String(TEXT ?? "").split("\n");
        const line2 = rest.join("\n");
        const html = `<div style="font-weight:800;margin-bottom:4px;">${line1}</div><div>${line2}</div>`;

        // 1) popover (top-layer)
        try {
          if ("showPopover" in HTMLElement.prototype) {
            const p = document.createElement("div");
            p.id = POP_ID;
            p.setAttribute("popover", "manual");
            imp(p,"position","fixed"); imp(p,"top","16px"); imp(p,"right","16px");
            imp(p,"max-width","360px"); imp(p,"padding","12px 14px");
            imp(p,"border-radius","12px"); imp(p,"background","#ffefef");
            imp(p,"color","#7a1212"); imp(p,"font","500 14px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif");
            imp(p,"box-shadow","0 10px 24px rgba(0,0,0,.18)"); imp(p,"white-space","pre-line");
            imp(p,"border","1px solid rgba(193,18,31,.2)"); imp(p,"pointer-events","none");
            imp(p,"opacity","0"); imp(p,"transform","translateY(-6px)");
            p.innerHTML = html;
            (document.body || document.documentElement).appendChild(p);
            // @ts-ignore
            p.showPopover();
            requestAnimationFrame(()=>{ imp(p,"opacity","1"); imp(p,"transform","translateY(0)"); });
            setTimeout(()=>{ try { /* @ts-ignore */ p.hidePopover(); } catch {} p.remove(); }, TTL);
            return true;
          }
        } catch {}

        // 2) dialog (top-layer)
        try {
          if ("HTMLDialogElement" in window) {
            const d = document.createElement("dialog");
            d.id = DLG_ID;
            const box = document.createElement("div");
            const imp2 = (el,p,v)=>el.style.setProperty(p,String(v),"important");
            imp(d,"padding","0"); imp(d,"border","none"); imp(d,"background","transparent");
            imp2(box,"position","fixed"); imp2(box,"top","16px"); imp2(box,"right","16px");
            imp2(box,"max-width","360px"); imp2(box,"padding","12px 14px");
            imp2(box,"border-radius","12px"); imp2(box,"background","#ffefef");
            imp2(box,"color","#7a1212"); imp2(box,"font","500 14px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif");
            imp2(box,"box-shadow","0 10px 24px rgba(0,0,0,.18)"); imp2(box,"white-space","pre-line");
            imp2(box,"border","1px solid rgba(193,18,31,.2)"); imp2(box,"pointer-events","none");
            imp2(box,"opacity","0"); imp2(box,"transform","translateY(-6px)");
            box.innerHTML = html;
            d.append(box); (document.body || document.documentElement).appendChild(d);
            d.addEventListener("cancel", e=>e.preventDefault());
            d.addEventListener("close", e=>e.preventDefault());
            d.showModal();
            requestAnimationFrame(()=>{ imp2(box,"opacity","1"); imp2(box,"transform","translateY(0)"); });
            setTimeout(()=>{ try{ d.close(); }catch{} d.remove(); }, TTL);
            return true;
          }
        } catch {}

        // 3) shadow host fallback (초고 z-index)
        try {
          const host = document.createElement("div");
          host.id = HOST_ID;
          const impH = (el,p,v)=>el.style.setProperty(p,String(v),"important");
          impH(host,"all","initial");
          impH(host,"position","fixed");
          impH(host,"top","16px"); impH(host,"right","16px");
          impH(host,"z-index","2147483649");
          (document.body || document.documentElement).appendChild(host);

          const root = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;
          const box = document.createElement("div");
          impH(box,"max-width","360px"); impH(box,"padding","12px 14px");
          impH(box,"border-radius","12px"); impH(box,"background","#ffefef");
          impH(box,"color","#7a1212"); impH(box,"font","500 14px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif");
          impH(box,"box-shadow","0 10px 24px rgba(0,0,0,.18)"); impH(box,"white-space","pre-line");
          impH(box,"border","1px solid rgba(193,18,31,.2)"); impH(box,"pointer-events","none");
          impH(box,"opacity","0"); impH(box,"transform","translateY(-6px)");
          box.innerHTML = html;
          root.appendChild(box);
          requestAnimationFrame(()=>{ impH(box,"opacity","1"); impH(box,"transform","translateY(0)"); });
          setTimeout(()=>{ host.remove(); }, TTL);
          return true;
        } catch {}

        try { alert(String(TEXT ?? "")); return true; } catch {}
        return false;
      }
    });

    const ok = Array.isArray(results) && results.some(r => r?.result === true);
    if (!ok) showSystemAlert(text, "경고");
    return ok;
  } catch {
    showSystemAlert(text, "경고");
    return false;
  }
}




// ── 오프스크린 캡처
async function captureWebcamFrame() {
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
async function hasOffscreenDocument(path) {
  const offscreenUrl = chrome.runtime.getURL(path);
  const matched = await clients.matchAll();
  return matched.some((c) => c.url === offscreenUrl);
}
async function setupOffscreenDocument(path) {
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
async function closeOffscreenDocument() {
  if (await hasOffscreenDocument(OFFSCREEN_DOCUMENT_PATH)) {
    await chrome.offscreen.closeDocument();
  }
}

// ── 감지 루프 (OFF/URL없음 스킵, 인앱 제외, 등록 URL만)
function startDetection() {
  if (detectionInterval) return;
  detectionInterval = setInterval(async () => {
    try {
      // 보호 OFF면 잔여 제거 후 스킵
      if (!isProtectionEnabled) { await clearBlurEverywhere(); return; }
      // 등록 URL 없으면 캡처/서버 호출 자체 생략
      if (PROTECTED_URLS.length === 0) { await clearBlurEverywhere(); return; }

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

      // 인앱/제외 페이지는 항상 제외(잔여 블러 정리)
      if (isExcluded(tab.url)) { await hardClearTabBlur(tab.id); return; }

      const match = urlMatchesProtectedList(tab.url);
      if (result.intruder_alert === true && match) {
        if (OPTIONS.blur) {
          const amt = Number(OPTIONS.blurAmount ?? 12);
          await safeSend(tab.id, { type: "APPLY_BLUR", blurAmount: amt, cursorBlur: false });
        } else {
          await hardClearTabBlur(tab.id);
        }
        if (OPTIONS.popup) {
          const now = Date.now();
          if (now - lastAlertAt >= ALERT_COOLDOWN_MS) {
            await showBannerEverywhere(tab.id, ALERT_TEXT, 3500);
            lastAlertAt = now;
          }
        }
      } else {
        await hardClearTabBlur(tab.id);
      }
    } catch (e) {
      console.error("감지 루프 중 에러 발생:", e);
    }
  }, 2000);
}
function stopDetection() {
  if (detectionInterval) { clearInterval(detectionInterval); detectionInterval = null; }
  closeOffscreenDocument();
}

// ── 메시지 라우터
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (msg?.type === "GET_OPTIONS") {
      sendResponse?.({ ok: true, options: OPTIONS, urls: PROTECTED_URLS });
      return;
    }
    if (msg?.type === "GET_PROTECTION_STATUS") {
      sendResponse?.({ enabled: isProtectionEnabled });
      return;
    }
    if (msg?.type === "SYNC_OPTIONS") {
      const prev = { ...OPTIONS };
      if (msg.options) OPTIONS = { ...OPTIONS, ...msg.options };
      if (Array.isArray(msg.urls)) PROTECTED_URLS = msg.urls.slice();
      if (prev.blur && !OPTIONS.blur) { await clearBlurEverywhere(); }
      await saveOptions();
      chrome.runtime.sendMessage({ type: "OPTIONS_CHANGED", options: OPTIONS, urls: PROTECTED_URLS }).catch(() => {});
      sendResponse?.({ ok: true });
      return;
    }
    if (msg?.type === "TOGGLE_PROTECTION") {
      isProtectionEnabled = !!msg.enabled;
      if (Array.isArray(msg.urls)) PROTECTED_URLS = msg.urls.slice();
      if (msg.options) OPTIONS = { ...OPTIONS, ...msg.options };
      await saveOptions(); await saveEnabled();
      if (isProtectionEnabled) {
        startDetection();
      } else {
        stopDetection();
        await clearBlurEverywhere();
      }
      sendResponse?.({ ok: true, enabled: isProtectionEnabled, options: OPTIONS });
      return;
    }
  })().catch((err) => console.error("background onMessage error:", err));
  return true;
});

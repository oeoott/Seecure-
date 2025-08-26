// public/background/ui.js
// 배너 및 시스템 알림 표시

import { ALERT_TEXT, ICON_URL } from "./config.js";

// 시스템 알림 (알림 센터)
export function showSystemAlert(text = ALERT_TEXT, title = "경고") {
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

// 웹페이지 내 배너 표시
export async function showBannerEverywhere(tabId, text = ALERT_TEXT, ttl = 6000) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      world: "MAIN",
      args: [text, ttl],
      func: (TEXT, TTL) => {
        const POP_ID  = "seecure-alert-popover";
        const DLG_ID  = "seecure-alert-dialog";
        const HOST_ID = "seecure-alert-host";

        // 기존 요소 제거
        [POP_ID, DLG_ID, HOST_ID].forEach(id => {
          const el = document.getElementById(id);
          if (el) { try { el.hidePopover?.(); el.close?.(); } catch {} el.remove(); }
        });

        // 공통 스타일 적용 함수
        const imp = (el, p, v) => el.style.setProperty(p, String(v), "important");
        const [line1, ...rest] = String(TEXT ?? "").split("\n");
        const line2 = rest.join("\n");
        const html = `<div style="font-weight:800;margin-bottom:4px;">${line1}</div><div>${line2}</div>`;

        // Popover API
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

        // dialog 대체
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

        // Shadow DOM 호스트
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

        // 마지막 수단: alert
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

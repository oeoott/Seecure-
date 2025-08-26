// public/background/utils.js
// URL 필터링 및 탭 관련 헬퍼 함수

import { DASHBOARD_URL, DASHBOARD_URL_PROD } from "./config.js";

// 보호 제외 대상 URL 판별
export function isExcluded(url) {
  if (!url) return true;
  const extBase = chrome.runtime.getURL("");
  return (
    url.startsWith(extBase) ||               // 확장 내부 페이지
    url.startsWith("chrome://") ||           // 크롬 시스템 페이지
    url.startsWith(DASHBOARD_URL) ||         // 로컬 대시보드
    (DASHBOARD_URL_PROD && url.startsWith(DASHBOARD_URL_PROD)) || // 배포 대시보드
    /^(https?:\/\/)(localhost|127\.0\.0\.1):5173\//.test(url)     // 개발용 로컬 서버
  );
}

// 등록된 URL 리스트와 매칭 여부 판별
export function urlMatchesProtectedList(url, protectedList) {
  if (!url || isExcluded(url)) return false;
  if (!protectedList || protectedList.length === 0) return false;

  try {
    const u = new URL(url);
    return protectedList.some((p) => {
      try {
        if (/^https?:\/\//.test(p)) return u.href.startsWith(p);
        return u.hostname.includes(p);
      } catch { 
        return url.includes(p); 
      }
    });
  } catch {
    return protectedList.some((p) => url.includes(p));
  }
}

// 현재 활성 HTTP 탭 반환
export async function getActiveHttpTab() {
  const [cur] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (cur && /^https?:\/\//.test(cur.url || "")) return cur;
  const [anyWeb] = await chrome.tabs.query({ url: ["http://*/*", "https://*/*"] });
  return anyWeb || null;
}

// 모든 HTTP(S) 탭 반환
export async function allHttpTabs() {
  return await chrome.tabs.query({ url: ["http://*/*", "https://*/*"] });
}

// public/background/config.js
// 상수 모음

export const ALERT_TEXT = "경고\n누군가 지켜보고 있습니다.";
export const ICON_URL = chrome.runtime.getURL("icon-128.png");
export const OFFSCREEN_DOCUMENT_PATH = "/offscreen.html";

export const API_BASE = "http://127.0.0.1:8000"; // 배포 시 교체
export const DASHBOARD_URL = "http://localhost:5173/";
export const DASHBOARD_URL_PROD = "";

export const OPT_KEY = "seecure:options";
export const URLS_KEY = "seecure:urls";
export const ENABLED_KEY = "seecure:enabled";

export const ALERT_COOLDOWN_MS = 2000;
export const LOOP_MS = 2000;

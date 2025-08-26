// public/background/state.js
// 전역 상태 관리 및 chrome.storage 연동

import { OPT_KEY, URLS_KEY, ENABLED_KEY, ALERT_COOLDOWN_MS } from "./config.js";

let detectionInterval = null;
let isProtectionEnabled = false;
let OPTIONS = { blur: true, popup: true, blurAmount: 12 };
let PROTECTED_URLS = [];
let lastAlertAt = 0;

// 상태 조회
export function getState() {
  return { detectionInterval, isProtectionEnabled, OPTIONS, PROTECTED_URLS, lastAlertAt, ALERT_COOLDOWN_MS };
}

// 상태 변경
export function setDetectionInterval(v) { detectionInterval = v; }
export function setEnabled(v) { isProtectionEnabled = !!v; }
export function setOptions(next) { OPTIONS = { ...OPTIONS, ...next }; }
export function setUrls(list) { PROTECTED_URLS = Array.isArray(list) ? list.slice() : []; }
export function touchAlertNow() { lastAlertAt = Date.now(); }

// 스토리지 연동
export async function loadState() {
  const data = await chrome.storage.local.get([OPT_KEY, URLS_KEY, ENABLED_KEY]);
  OPTIONS = { blur: true, popup: true, ...(data[OPT_KEY] || {}) };
  PROTECTED_URLS = Array.isArray(data[URLS_KEY]) ? data[URLS_KEY] : [];
  isProtectionEnabled = !!data[ENABLED_KEY];
}
export async function saveOptions() {
  await chrome.storage.local.set({ [OPT_KEY]: OPTIONS, [URLS_KEY]: PROTECTED_URLS });
}
export async function saveEnabled() {
  await chrome.storage.local.set({ [ENABLED_KEY]: isProtectionEnabled });
}

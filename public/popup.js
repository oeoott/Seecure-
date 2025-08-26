// public/popup.js
// 팝업 페이지 스크립트: 로그인 가드, 보호 모드/옵션 동기화

document.addEventListener("DOMContentLoaded", async () => {
  const elProt   = document.getElementById("toggle-protection");
  const elBlur   = document.getElementById("toggle-blur");
  const elPopup  = document.getElementById("toggle-popup");
  const elRange  = document.getElementById("blur-amount");
  const elRangeV = document.getElementById("blur-amount-val");
  const btnHome  = document.getElementById("btn-home");
  const loginGuard = document.getElementById("login-guard");

  // 인앱 열기
  const openHome = async () => {
    const url = chrome.runtime.getURL("index.html"); // 빌드 결과물이면 "app/index.html"
    try { await chrome.tabs.create({ url }); } catch(e) { console.warn(e); }
  };
  btnHome.addEventListener("click", openHome);

  // 로그인 여부 판단 (인앱 localStorage 'token' 사용)
  const isLoggedIn = !!localStorage.getItem('token');

  // 로그인 가드 적용
  function applyLoginGuard(loggedIn) {
    loginGuard.style.display = loggedIn ? "none" : "block";

    elProt.disabled  = !loggedIn;
    elBlur.disabled  = !loggedIn;
    elPopup.disabled = !loggedIn;
    elRange.disabled = !loggedIn;

    if (!loggedIn) {
      elProt.checked  = false;
      elBlur.checked  = false;
      elPopup.checked = false;
      elRange.value   = "12";
      elRangeV.textContent = "12";
    }
  }
  applyLoginGuard(isLoggedIn);
  if (!isLoggedIn) return; // 미로그인 → BG와 통신하지 않음

  // ===== 로그인 상태일 때만 실행 =====

  // 초기 상태 하이드레이트
  try {
    const res = await chrome.runtime.sendMessage({ type: "GET_OPTIONS" });
    if (res?.ok) {
      elBlur.checked   = !!res.options?.blur;
      elPopup.checked  = !!res.options?.popup;
      const amt = Number(res.options?.blurAmount ?? 12);
      elRange.value    = String(amt);
      elRangeV.textContent = String(amt);
    }
  } catch {}
  try {
    const st = await chrome.runtime.sendMessage({ type: "GET_PROTECTION_STATUS" });
    if (st) elProt.checked = !!st.enabled;
  } catch {}

  // BG → 팝업 UI 실시간 반영
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === 'OPTIONS_CHANGED' && msg.options) {
      if (typeof msg.options.blur === 'boolean')  elBlur.checked  = msg.options.blur;
      if (typeof msg.options.popup === 'boolean') elPopup.checked = msg.options.popup;
      if (typeof msg.options.blurAmount === 'number') {
        elRange.value = String(msg.options.blurAmount);
        elRangeV.textContent = String(msg.options.blurAmount);
      }
    }
  });

  // 보호 모드 토글
  elProt.addEventListener("change", async () => {
    try {
      await chrome.runtime.sendMessage({ type: "TOGGLE_PROTECTION", enabled: elProt.checked });
    } catch (e) { console.warn(e); }
  });

  // 옵션 동기화 함수
  async function syncOptionsFromPopup(extra = {}) {
    try {
      const r = await chrome.runtime.sendMessage({ type: "GET_OPTIONS" });
      const urls = r?.urls || [];
      const payload = {
        type: "SYNC_OPTIONS",
        options: {
          blur: elBlur.checked,
          popup: elPopup.checked,
          blurAmount: Number(elRange.value),
          ...extra
        },
        urls
      };
      await chrome.runtime.sendMessage(payload);
      // 인앱에서도 참조할 수 있도록 로컬 반영
      localStorage.setItem('isBlurOn', JSON.stringify(elBlur.checked));
      localStorage.setItem('isPopupOn', JSON.stringify(elPopup.checked));
      localStorage.setItem('blurAmount', String(elRange.value));
    } catch (e) { console.warn(e); }
  }

  // 체크박스 변경 시 옵션 동기화
  elBlur.addEventListener("change", () => syncOptionsFromPopup());
  elPopup.addEventListener("change", () => syncOptionsFromPopup());

  // 슬라이더 값 표시 및 동기화
  elRange.addEventListener("input", () => {
    elRangeV.textContent = String(elRange.value);
  });
  elRange.addEventListener("change", () => syncOptionsFromPopup());
});

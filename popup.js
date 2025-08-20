// 현재 탭의 origin(도메인 기준)별로 상태를 저장/로드하는 헬퍼
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function getOrigin(url) {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch (e) {
    return null;
  }
}

function stateKey(origin) {
  return `state:${origin}`;
}

async function loadState(origin) {
  const key = stateKey(origin);
  const data = await chrome.storage.local.get(key);
  return data[key] || { enabled: false, cursorBlur: false, blurAmount: 12 };
}

async function saveState(origin, state) {
  const key = stateKey(origin);
  await chrome.storage.local.set({ [key]: state });
}

async function sendToTab(tabId, msg) {
  try {
    await chrome.tabs.sendMessage(tabId, msg);
  } catch (e) {
    // content script가 아직 준비 안된 특수 케이스일 수 있음.
    // 대부분 MV3에서는 document_idle 이후 주입되어 있어 정상 동작.
    console.warn("sendMessage failed:", e);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const toggleEnabled = document.getElementById("toggle-enabled");
  const toggleCursor = document.getElementById("toggle-cursor");
  const btnRemove = document.getElementById("btn-remove-blur");
  const rng = document.getElementById("blur-amount");
  const rngVal = document.getElementById("blur-amount-val");

  const tab = await getCurrentTab();
  const origin = getOrigin(tab.url);
  const state = await loadState(origin);

  // UI 초기화
  toggleEnabled.checked = state.enabled;
  toggleCursor.checked = state.cursorBlur;
  rng.value = state.blurAmount ?? 12;
  rngVal.textContent = rng.value;

  // ON/OFF
  toggleEnabled.addEventListener("change", async () => {
    state.enabled = toggleEnabled.checked;
    await saveState(origin, state);
    await sendToTab(tab.id, { type: "SET_ENABLED", enabled: state.enabled, blurAmount: state.blurAmount });
  });

  // 커서 블러
  toggleCursor.addEventListener("change", async () => {
    state.cursorBlur = toggleCursor.checked;
    await saveState(origin, state);
    await sendToTab(tab.id, { type: "SET_CURSOR_BLUR", enabled: state.cursorBlur, blurAmount: state.blurAmount });
  });

  // 블러 강도
  rng.addEventListener("input", async () => {
    rngVal.textContent = rng.value;
  });
  rng.addEventListener("change", async () => {
    state.blurAmount = Number(rng.value);
    await saveState(origin, state);
    await sendToTab(tab.id, { type: "SET_BLUR_AMOUNT", blurAmount: state.blurAmount });
  });

  // 즉시 해제
  btnRemove.addEventListener("click", async () => {
    state.enabled = false;
    state.cursorBlur = false;
    await saveState(origin, state);
    toggleEnabled.checked = false;
    toggleCursor.checked = false;
    await sendToTab(tab.id, { type: "REMOVE_BLUR" });
  });

  // 팝업 열리면 현재 상태를 content에 싱크
  await sendToTab(tab.id, { type: "SYNC_STATE", state });
});

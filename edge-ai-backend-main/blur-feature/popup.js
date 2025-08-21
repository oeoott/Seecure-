// popup.js
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}
function getOrigin(url) {
  try { const u = new URL(url); return `${u.protocol}//${u.host}`; }
  catch { return null; }
}
function stateKey(origin) { return `state:${origin}`; }

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
  try { await chrome.tabs.sendMessage(tabId, msg); }
  catch (e) { console.warn("sendMessage failed:", e); }
}

document.addEventListener("DOMContentLoaded", async () => {
  const toggleEnabled = document.getElementById("toggle-enabled");
  const toggleCursor  = document.getElementById("toggle-cursor");
  const btnRemove     = document.getElementById("btn-remove-blur");
  const rng           = document.getElementById("blur-amount");
  const rngVal        = document.getElementById("blur-amount-val");

  const tab = await getCurrentTab();
  const origin = getOrigin(tab?.url || "");
  if (!origin) {
    // 드물게 chrome 정책/권한 이슈로 url 접근이 막힐 수 있음
    // 이 경우에도 content가 자체적으로 상태를 로드하므로 팝업은 안내만
    toggleEnabled.disabled = true;
    toggleCursor.disabled = true;
    btnRemove.disabled = true;
    rng.disabled = true;
    rngVal.textContent = "-";
    return;
  }

  const state = await loadState(origin);

  toggleEnabled.checked = state.enabled;
  toggleCursor.checked  = state.cursorBlur;
  rng.value = state.blurAmount ?? 12;
  rngVal.textContent = rng.value;

  toggleEnabled.addEventListener("change", async () => {
    state.enabled = toggleEnabled.checked;
    await saveState(origin, state);
    await sendToTab(tab.id, { type: "SET_ENABLED", enabled: state.enabled, blurAmount: state.blurAmount });
  });

  toggleCursor.addEventListener("change", async () => {
    state.cursorBlur = toggleCursor.checked;
    await saveState(origin, state);
    await sendToTab(tab.id, { type: "SET_CURSOR_BLUR", enabled: state.cursorBlur, blurAmount: state.blurAmount });
  });

  rng.addEventListener("input", () => { rngVal.textContent = rng.value; });
  rng.addEventListener("change", async () => {
    state.blurAmount = Number(rng.value);
    await saveState(origin, state);
    await sendToTab(tab.id, { type: "SET_BLUR_AMOUNT", blurAmount: state.blurAmount });
  });

  btnRemove.addEventListener("click", async () => {
    state.enabled = false;
    state.cursorBlur = false;
    await saveState(origin, state);
    toggleEnabled.checked = false;
    toggleCursor.checked = false;
    await sendToTab(tab.id, { type: "REMOVE_BLUR" });
  });

  // 팝업 열릴 때, 현재 상태를 content에 동기화
  await sendToTab(tab.id, { type: "SYNC_STATE", state });
});

// public/content.js

(() => {
    console.log("✅ SeeCure 콘텐츠 스크립트가 성공적으로 로드되었습니다!");

    let overlay = null;
    let controlPopup = null;
    let state = { enabled: false, cursorBlur: false, blurAmount: 12 };

    const ensureOverlay = () => {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'seecure-blur-overlay';
            overlay.className = 'seecure-blur-overlay';
            document.body.appendChild(overlay);
        }
        updateOverlay();
    };

    const removeOverlay = () => {
        if (overlay) {
            overlay.remove();
            overlay = null;
        }
        if (controlPopup) {
            controlPopup.remove();
            controlPopup = null;
        }
    };
    
    const updateOverlay = () => {
        if (overlay) {
            if (state.cursorBlur) {
                overlay.style.backdropFilter = `blur(${state.blurAmount}px)`;
                overlay.style.width = '200px';
                overlay.style.height = '200px';
                overlay.style.borderRadius = '50%';
                overlay.style.pointerEvents = 'none';
            } else {
                overlay.style.backdropFilter = `blur(${state.blurAmount}px)`;
                overlay.style.width = '100vw';
                overlay.style.height = '100vh';
                overlay.style.borderRadius = '0';
                overlay.style.pointerEvents = 'none';
            }
        }
    };

    const setupControlPopup = () => {
        if (controlPopup) return;
        
        controlPopup = document.createElement('div');
        controlPopup.id = 'seecure-control-popup';
        controlPopup.innerHTML = `
            <div id="seecure-popup-root">
                <header>Seecure Blur</header>
                <section class="row">
                    <label class="lbl">
                        <input id="toggle-enabled" type="checkbox" ${state.enabled ? 'checked' : ''} />
                        <span>이 탭에서 블러 ON/OFF</span>
                    </label>
                </section>
                <section class="row">
                    <label class="lbl">
                        <input id="toggle-cursor" type="checkbox" ${state.cursorBlur ? 'checked' : ''} />
                        <span>커서 블러 모드</span>
                    </label>
                </section>
                <section class="row">
                    <button id="btn-remove-blur" class="full">화면 블러 즉시 해제</button>
                </section>
                <section class="row small">
                    <label>블러 강도(px)</label>
                    <input id="blur-amount" type="range" min="4" max="24" step="1" value="${state.blurAmount}"/>
                    <span id="blur-amount-val">${state.blurAmount}</span>
                </section>
                <footer>
                    <small>현재 탭의 도메인에만 적용돼요.</small>
                </footer>
            </div>
        `;
        document.body.appendChild(controlPopup);

        // 이벤트 리스너 설정
        const toggleEnabled = document.getElementById("toggle-enabled");
        const toggleCursor = document.getElementById("toggle-cursor");
        const btnRemove = document.getElementById("btn-remove-blur");
        const rng = document.getElementById("blur-amount");
        const rngVal = document.getElementById("blur-amount-val");

        toggleEnabled.addEventListener("change", () => {
            state.enabled = toggleEnabled.checked;
            state.enabled ? ensureOverlay() : removeOverlay();
            // TODO: background로 상태 업데이트 메시지 보내기
        });

        toggleCursor.addEventListener("change", () => {
            state.cursorBlur = toggleCursor.checked;
            updateOverlay();
            // TODO: background로 상태 업데이트 메시지 보내기
        });

        rng.addEventListener("input", () => {
            rngVal.textContent = rng.value;
        });

        rng.addEventListener("change", () => {
            state.blurAmount = Number(rng.value);
            updateOverlay();
            // TODO: background로 상태 업데이트 메시지 보내기
        });

        btnRemove.addEventListener("click", () => {
            state.enabled = false;
            state.cursorBlur = false;
            toggleEnabled.checked = false;
            toggleCursor.checked = false;
            removeOverlay();
            // TODO: background로 상태 업데이트 메시지 보내기
        });
    };
    
    // background.js로부터의 명령 수신
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'APPLY_BLUR') {
            state.enabled = true;
            state.blurAmount = message.blurAmount;
            state.cursorBlur = message.cursorBlur ?? false;
            ensureOverlay();
            setupControlPopup(); // ⭐️ 블러가 적용되면 설정 팝업도 띄움
        } else if (message.type === 'REMOVE_BLUR') {
            state.enabled = false;
            removeOverlay();
        } else if (message.type === 'SHOW_ALERT_POPUP') {
            // 이 기능은 이제 사용하지 않음
        }
        return true;
    });

    // 마우스 이동 감지
    document.addEventListener('mousemove', (e) => {
        if (state.cursorBlur && overlay) {
            overlay.style.left = `${e.clientX}px`;
            overlay.style.top = `${e.clientY}px`;
        }
    });

})();
// src/pages/SecureOption.jsx
import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from './Sidebar.jsx';
import '../SecureOption.css';

const SecureOption = ({ setPage }) => {
  const [isBlurOn, setIsBlurOn] = useState(() => {
    const saved = localStorage.getItem('isBlurOn');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isPopupOn, setIsPopupOn] = useState(() => {
    const saved = localStorage.getItem('isPopupOn');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // BG로부터 현재 옵션을 받아 초기화
  const hydrateFromBG = useCallback(async () => {
    try {
      if (!chrome?.runtime?.sendMessage) return;
      const res = await chrome.runtime.sendMessage({ type: 'GET_OPTIONS' });
      if (res?.ok && res.options) {
        const blur = !!res.options.blur;
        const popup = !!res.options.popup;
        setIsBlurOn(blur);
        setIsPopupOn(popup);
        // 로컬에도 동기화 (Home 등에서 참조 시 일관성)
        localStorage.setItem('isBlurOn', JSON.stringify(blur));
        localStorage.setItem('isPopupOn', JSON.stringify(popup));
      }
    } catch (e) {
      // 확장 미로딩 등일 수 있으니 조용히 무시
    }
  }, []);

  useEffect(() => {
    hydrateFromBG();

    // BG가 브로드캐스트하는 OPTIONS_CHANGED 수신 → 화면 즉시 반영
    function onMsg(msg) {
      if (msg?.type === 'OPTIONS_CHANGED' && msg.options) {
        const blur = !!msg.options.blur;
        const popup = !!msg.options.popup;
        setIsBlurOn(blur);
        setIsPopupOn(popup);
        localStorage.setItem('isBlurOn', JSON.stringify(blur));
        localStorage.setItem('isPopupOn', JSON.stringify(popup));
      }
    }
    chrome?.runtime?.onMessage?.addListener?.(onMsg);
    return () => {
      chrome?.runtime?.onMessage?.removeListener?.(onMsg);
    };
  }, [hydrateFromBG]);

  // 저장 버튼 → BG에 반영(SYNC_OPTIONS) + 로컬 반영
  const handleSave = async () => {
    localStorage.setItem('isBlurOn', JSON.stringify(isBlurOn));
    localStorage.setItem('isPopupOn', JSON.stringify(isPopupOn));

    try {
      // 기존 URL 목록은 유지해야 하므로 BG에 현재 urls도 함께 넘기도록 GET_OPTIONS 먼저 호출
      let urls = [];
      try {
        const r = await chrome.runtime.sendMessage({ type: 'GET_OPTIONS' });
        if (r?.urls) urls = r.urls;
      } catch {}

      await chrome.runtime.sendMessage({
        type: 'SYNC_OPTIONS',
        options: { blur: isBlurOn, popup: isPopupOn },
        urls
      });
    } catch {}
    alert('설정이 저장되었습니다!');
  };

  return (
    <div className="secure-page-container">
      <Sidebar currentPage="SecureOption" setPage={setPage} />

      <div className="secure-content-wrapper">
        <main className="secure-main-content">
          <h2 className="secure-main-title">보호 옵션</h2>
          <p className="secure-subtitle">원하는 보호 옵션을 선택해보세요.</p>
        </main>

        <section className="secure-options-container">
          <div className="secure-option-item">
            <span className="secure-option-title">화면 블러 효과</span>
            <div className="secure-toggle-switch">
              <span className="secure-toggle-label">ON</span>
              <div
                className={`secure-toggle-box ${isBlurOn ? 'selected' : 'unselected'}`}
                onClick={() => setIsBlurOn(true)}
              />
              <span className="secure-toggle-label inactive">OFF</span>
              <div
                className={`secure-toggle-box ${!isBlurOn ? 'selected' : 'unselected'}`}
                onClick={() => setIsBlurOn(false)}
              />
            </div>
          </div>

          <div className="secure-option-item">
            <span className="secure-option-title">경고 알림 팝업</span>
            <div className="secure-toggle-switch">
              <span className="secure-toggle-label">ON</span>
              <div
                className={`secure-toggle-box ${isPopupOn ? 'selected' : 'unselected'}`}
                onClick={() => setIsPopupOn(true)}
              />
              <span className="secure-toggle-label inactive">OFF</span>
              <div
                className={`secure-toggle-box ${!isPopupOn ? 'selected' : 'unselected'}`}
                onClick={() => setIsPopupOn(false)}
              />
            </div>
          </div>
        </section>

        <button className="secure-save-button" onClick={handleSave}>
          저장
        </button>
      </div>
    </div>
  );
};

export default SecureOption;

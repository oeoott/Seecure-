// src/pages/SecureOption.jsx
// 보호 옵션 설정 페이지: 블러 효과/알림 팝업 설정을 BG와 동기화

import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from './Sidebar.jsx';
import '../SecureOption.css';

const SecureOption = ({ setPage }) => {
  // 초기 상태는 localStorage → 없으면 기본값 true
  const [isBlurOn, setIsBlurOn] = useState(() => {
    const saved = localStorage.getItem('isBlurOn');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isPopupOn, setIsPopupOn] = useState(() => {
    const saved = localStorage.getItem('isPopupOn');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // BG에서 현재 옵션 가져오기
  const hydrateFromBG = useCallback(async () => {
    try {
      if (!chrome?.runtime?.sendMessage) return;
      const res = await chrome.runtime.sendMessage({ type: 'GET_OPTIONS' });
      if (res?.ok && res.options) {
        const blur = !!res.options.blur;
        const popup = !!res.options.popup;
        setIsBlurOn(blur);
        setIsPopupOn(popup);
        localStorage.setItem('isBlurOn', JSON.stringify(blur));
        localStorage.setItem('isPopupOn', JSON.stringify(popup));
      }
    } catch {
      // 확장 미로딩 등일 수 있으니 무시
    }
  }, []);

  useEffect(() => {
    hydrateFromBG();

    // BG에서 옵션 변경 브로드캐스트 받기
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

  // 저장 → 로컬 + BG에 동기화
  const handleSave = async () => {
    localStorage.setItem('isBlurOn', JSON.stringify(isBlurOn));
    localStorage.setItem('isPopupOn', JSON.stringify(isPopupOn));

    try {
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
          {/* 블러 옵션 */}
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

          {/* 팝업 옵션 */}
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

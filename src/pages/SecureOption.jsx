// src/pages/SecureOption.jsx

import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import '../SecureOption.css'; // ⬅️ 확장자 수정

const SecureOption = ({ setPage }) => {
  const [isBlurOn, setIsBlurOn] = useState(() => {
    const saved = localStorage.getItem('isBlurOn');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isPopupOn, setIsPopupOn] = useState(() => {
    const saved = localStorage.getItem('isPopupOn');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const handleSave = () => {
    localStorage.setItem('isBlurOn', JSON.stringify(isBlurOn));
    localStorage.setItem('isPopupOn', JSON.stringify(isPopupOn));
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

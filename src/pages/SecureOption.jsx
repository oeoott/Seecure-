import React from 'react';
import Sidebar from './Sidebar'; // Sidebar 컴포넌트 import
import './SecureOption.css'; // 메인 페이지 CSS import

const SecureOption = () => {
  return (
    <div className="secure-option-container">
      <Sidebar />

      <main className="main-content">
        <h2 className="main-title">보호 옵션</h2>
        <p className="subtitle">원하는 보호 옵션을 선택해보세요.</p>
      </main>

      <section className="options-container">
        <div className="option-item">
          <span className="option-title">화면 블러 효과</span>
          <div className="toggle-switch">
            <span className="toggle-label">ON</span>
            <div className="toggle-box selected" />
            <span className="toggle-label inactive">OFF</span>
            <div className="toggle-box unselected" />
          </div>
        </div>
        <div className="option-item">
          <span className="option-title">경고 알림 팝업</span>
          <div className="toggle-switch">
            <span className="toggle-label">ON</span>
            <div className="toggle-box selected" />
            <span className="toggle-label inactive">OFF</span>
            <div className="toggle-box unselected" />
          </div>
        </div>
      </section>

      <button className="save-button">저장</button>
    </div>
  );
};

export default SecureOption;
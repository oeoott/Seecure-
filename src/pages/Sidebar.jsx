import React from 'react';
import './Sidebar.css';

// 로컬 이미지 import
import logoImage from './assets/logo.png';
import homeIcon from './assets/icon_home.png';
import faceIcon from './assets/icon_face.png';
import urlIcon from './assets/icon_url.png';
import shieldIcon from './assets/icon_shield.png';

const Sidebar = () => {
  const activePage = "보호 옵션";

  // 네비게이션 아이템 배열에 import한 이미지 변수 사용
  const navItems = [
    { name: "홈", icon: homeIcon, rotated: true },
    { name: "얼굴 등록", icon: faceIcon, rotated: false },
    { name: "URL 등록", icon: urlIcon, rotated: true },
    { name: "보호 옵션", icon: shieldIcon, rotated: true },
  ];

  return (
    <aside className="sidebar">
      <div className="logo-area">
        {/* 로고 이미지 변수 사용 */}
        <img className="logo-image" src={logoImage} alt="SeeCure logo" />
        <h1 className="logo-text">SeeCure</h1>
      </div>

      <nav className="nav-container">
        {navItems.map((item) => (
          <div 
            key={item.name} 
            className={`nav-item ${activePage === item.name ? 'active' : ''}`}
          >
            <img 
              className={`nav-icon ${item.rotated ? 'rotated' : ''}`} 
              src={item.icon} 
              alt={`${item.name} icon`} 
            />
            <span className="nav-text">{item.name}</span>
          </div>
        ))}
      </nav>

      <div className="login-area">
        <button className="login-button">Login</button>
        <a href="#signin" className="signin-text">sign in</a>
      </div>
    </aside>
  );
};

export default Sidebar;
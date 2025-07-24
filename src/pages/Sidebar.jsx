import React, { useState } from 'react';
import '../Sidebar.css';
import logoImage from '../assets/logo.png';
import homeIcon from '../assets/icon_home.png';
import faceIcon from '../assets/icon_face.png';
import urlIcon from '../assets/icon_url.png';
import shieldIcon from '../assets/icon_shield.png';

const Sidebar = ({ currentPage, setPage }) => {
  const [isUrlMenuOpen, setIsUrlMenuOpen] = useState(currentPage.startsWith('Url'));
  const [isFaceMenuOpen, setIsFaceMenuOpen] = useState(currentPage.startsWith('Face'));

  const handlePageNavigate = (pageName) => {
    setPage(pageName);
  };

  const handleLogout = () => {
    // 로그인 상태 삭제
    localStorage.removeItem('token'); // 실제 키 이름에 따라 수정
    alert('로그아웃 되었습니다.');
    setPage('login'); // 로그인 페이지로 이동
  };

  const navItems = [
    { name: "홈", page: "Home", icon: homeIcon },
    { name: "얼굴 등록", page: "FaceRegistration", icon: faceIcon },
    { name: "URL 등록", page: "UrlRegistration", icon: urlIcon },
    { name: "보호 옵션", page: "SecureOption", icon: shieldIcon },
  ];

  const urlSubItems = [
    { name: "URL 등록", page: "UrlRegistration" },
    { name: "등록 URL 관리", page: "UrlManagement" },
  ];

  const faceSubItems = [
    { name: "얼굴 등록", page: "FaceRegistration" },
    { name: "등록 얼굴 관리", page: "FaceManagement" },
  ];

  return (
    <aside className="sidebar">
      <div className="logo-area">
        <img className="logo-image" src={logoImage} alt="SeeCure logo" />
        <h1 className="logo-text">SeeCure</h1>
      </div>

      <nav className="nav-container">
        {navItems.map((item) => {
          // 얼굴 등록 메뉴
          if (item.name === '얼굴 등록') {
            return (
              <React.Fragment key={item.name}>
                <div
                  className={`nav-item main ${currentPage.startsWith('Face') ? 'active' : ''}`}
                  onClick={() => setIsFaceMenuOpen(!isFaceMenuOpen)}
                >
                  <img className="nav-icon" src={item.icon} alt={`${item.name} 아이콘`} />
                  <span className="nav-text">{item.name}</span>
                </div>
                {isFaceMenuOpen && (
                  <div className="submenu-container">
                    {faceSubItems.map((subItem) => (
                      <div
                        key={subItem.name}
                        className={`nav-item sub ${currentPage === subItem.page ? 'active-sub' : ''}`}
                        onClick={() => handlePageNavigate(subItem.page)}
                      >
                        <span className="nav-text">{subItem.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </React.Fragment>
            );
          }

          // URL 등록 메뉴
          if (item.name === 'URL 등록') {
            return (
              <React.Fragment key={item.name}>
                <div
                  className={`nav-item main ${currentPage.startsWith('Url') ? 'active' : ''}`}
                  onClick={() => setIsUrlMenuOpen(!isUrlMenuOpen)}
                >
                  <img className="nav-icon" src={item.icon} alt={`${item.name} 아이콘`} />
                  <span className="nav-text">{item.name}</span>
                </div>
                {isUrlMenuOpen && (
                  <div className="submenu-container">
                    {urlSubItems.map((subItem) => (
                      <div
                        key={subItem.name}
                        className={`nav-item sub ${currentPage === subItem.page ? 'active-sub' : ''}`}
                        onClick={() => handlePageNavigate(subItem.page)}
                      >
                        <span className="nav-text">{subItem.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </React.Fragment>
            );
          }

          // 일반 메뉴
          return (
            <div
              key={item.name}
              className={`nav-item main ${currentPage === item.page ? 'active' : ''}`}
              onClick={() => handlePageNavigate(item.page)}
            >
              <img className="nav-icon" src={item.icon} alt={`${item.name} 아이콘`} />
              <span className="nav-text">{item.name}</span>
            </div>
          );
        })}
      </nav>

      <div className="login-area">
        <button className="logout-button" onClick={handleLogout}>logout</button>
      </div>
    </aside>
  );
};

export default Sidebar;

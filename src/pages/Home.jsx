// src/pages/Home.jsx

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar.jsx';
import styles from '../Home.module.css';

// 아이콘 이미지 import - 실제 프로젝트에 맞게 경로를 수정해주세요.
import userAvatar from '../assets/icon_home_shield.png';
import faceIdIcon from '../assets/icon_home_face.png';
import urlIcon from '../assets/icon_home_url.png';
import blurIcon from '../assets/icon_home_blur.png';
import alertIcon from '../assets/icon_home_bell.png';

const Home = ({ setPage }) => {
  const userName = "사용자 아이디";

  // 보호 모드의 ON/OFF 상태
  const [isProtectionOn, setIsProtectionOn] = useState(true);

  // 보호 옵션 상태 (localStorage에서 값 불러오기)
  const [isBlurOn, setIsBlurOn] = useState(true);
  const [isPopupOn, setIsPopupOn] = useState(true);

  // 컴포넌트가 로드될 때 localStorage에서 설정 값을 읽어와 상태를 업데이트
  useEffect(() => {
    const savedBlur = localStorage.getItem('isBlurOn');
    if (savedBlur !== null) {
      setIsBlurOn(JSON.parse(savedBlur));
    }

    const savedPopup = localStorage.getItem('isPopupOn');
    if (savedPopup !== null) {
      setIsPopupOn(JSON.parse(savedPopup));
    }
  }, []); // 빈 배열을 전달하여 컴포넌트가 처음 마운트될 때 한 번만 실행

  // 보호 모드 토글 함수
  const handleProtectionToggle = () => {
    setIsProtectionOn(prevState => !prevState);
  };

  return (
    <div className={styles.homeLayout}>
      <Sidebar currentPage="Home" setPage={setPage} />

      <div className={styles.contentWrapper}>
        <header className={styles.userPanel}>
          <div className={styles.userInfo}>
            <img src={userAvatar} alt="User Avatar" className={styles.avatar} />
            <div>
              <h1 className={styles.mainTitle}>보호 모드</h1>
              <p className={styles.userName}>{userName}</p>
            </div>
          </div>
          
          <div 
            className={`${styles.statusToggle} ${!isProtectionOn ? styles.off : ''}`}
            onClick={handleProtectionToggle}
          >
            <span className={styles.statusText}>
              {isProtectionOn ? 'ON' : 'OFF'}
            </span>
          </div>
        </header>

        <main className={styles.dashboardGrid}>
          <div className={`${styles.card} ${styles.faceCard}`}>
            <img src={faceIdIcon} alt="Face ID" className={styles.largeIcon} />
            <p>등록된 얼굴</p>
          </div>
          <div className={`${styles.card} ${styles.urlCard}`}>
            <img src={urlIcon} alt="Protected URL" className={styles.largeIcon} />
            <p>보호 URL</p>
          </div>
          
          <div className={`${styles.card} ${styles.blurCard}`}>
            <img src={blurIcon} alt="Blur Effect" className={styles.smallIcon} />
            <div className={styles.textGroup}>
              <p>블러 효과</p>
              <span className={`${styles.optionStatusText} ${!isBlurOn ? styles.offStatus : ''}`}>
                {isBlurOn ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>

          <div className={`${styles.card} ${styles.alertCard}`}>
            <img src={alertIcon} alt="Alert Popup" className={styles.smallIcon} />
            <div className={styles.textGroup}>
              <p>알림 팝업</p>
              <span className={`${styles.optionStatusText} ${!isPopupOn ? styles.offStatus : ''}`}>
                {isPopupOn ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
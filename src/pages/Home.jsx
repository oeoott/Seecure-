import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar.jsx'; // Sidebar 컴포넌트 경로는 실제 프로젝트에 맞게 확인해주세요.
import styles from '../Home.module.css';

// 아이콘 이미지 import (경로를 실제 프로젝트에 맞게 수정해주세요)
import userAvatar from '../assets/icon_home_shield.png';
import faceIdIcon from '../assets/icon_home_face.png';
import urlIcon from '../assets/icon_home_url.png';
import blurIcon from '../assets/icon_home_blur.png';
import alertIcon from '../assets/icon_home_bell.png';

const Home = ({ setPage }) => {
  const userName = "사용자 아이디";

  // 보호 모드 ON/OFF 상태
  const [isProtectionOn, setIsProtectionOn] = useState(true);

  // 보호 옵션 상태 (초기값 true)
  const [isBlurOn, setIsBlurOn] = useState(true);
  const [isPopupOn, setIsPopupOn] = useState(true);

  // 컴포넌트가 로드될 때 localStorage에서 설정 값을 읽어와 상태를 업데이트합니다.
  useEffect(() => {
    const savedBlur = localStorage.getItem('isBlurOn');
    if (savedBlur !== null) {
      setIsBlurOn(JSON.parse(savedBlur));
    }

    const savedPopup = localStorage.getItem('isPopupOn');
    if (savedPopup !== null) {
      setIsPopupOn(JSON.parse(savedPopup));
    }
  }, []); // 빈 배열을 전달하여 처음 마운트될 때 한 번만 실행

  // 보호 모드 토글 함수
  const handleProtectionToggle = () => {
    setIsProtectionOn(prevState => !prevState);
  };
  
  // 참고: 실제 블러, 팝업 토글 기능은 이 함수들을 카드 클릭 이벤트에 연결하여 구현할 수 있습니다.
  // const handleBlurToggle = () => setIsBlurOn(prevState => !prevState);
  // const handlePopupToggle = () => setIsPopupOn(prevState => !prevState);

  return (
    <div className={styles.homeLayout}>
      <Sidebar currentPage="Home" setPage={setPage} />

      <main className={styles.mainContainer}>
        <div className={styles.contentWrapper}>
          {/* 상단 사용자 정보 및 보호모드 패널 */}
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
              role="button"
              aria-pressed={isProtectionOn}
            >
              <span className={styles.statusText}>
                {isProtectionOn ? 'ON' : 'OFF'}
              </span>
            </div>
          </header>

          {/* 하단 대시보드 그리드 */}
          <section className={styles.dashboardGrid}>
            <div className={`${styles.card} ${styles.faceCard}`}>
              <p>등록된 얼굴</p>
              <img src={faceIdIcon} alt="Face ID" className={styles.largeIcon} />
            </div>
            <div className={`${styles.card} ${styles.urlCard}`}>
              <p>보호 URL</p>
              <img src={urlIcon} alt="Protected URL" className={styles.largeIcon} />
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
          </section>
        </div>
      </main>
    </div>
  );
};

export default Home;
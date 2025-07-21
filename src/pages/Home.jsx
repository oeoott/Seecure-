// ./pages/home.jsx

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar.jsx';
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

  // ✅ 추가: 얼굴 및 URL 개수 상태 추가
  const [faceCount, setFaceCount] = useState(0);
  const [urlCount, setUrlCount] = useState(0);


  useEffect(() => {
    // 보호 옵션 불러오기
    const savedBlur = localStorage.getItem('isBlurOn');
    if (savedBlur !== null) {
      setIsBlurOn(JSON.parse(savedBlur));
    }

    const savedPopup = localStorage.getItem('isPopupOn');
    if (savedPopup !== null) {
      setIsPopupOn(JSON.parse(savedPopup));
    }

    // ✅ 추가: 얼굴 개수 불러오기
    const savedFaces = localStorage.getItem('managedFaces');
    if (savedFaces) {
      setFaceCount(JSON.parse(savedFaces).length);
    }

    // ✅ 추가: URL 개수 불러오기
    const savedUrls = localStorage.getItem('managedUrls');
    if (savedUrls) {
      setUrlCount(JSON.parse(savedUrls).length);
    }
  }, []); // 빈 배열을 전달하여 처음 마운트될 때 한 번만 실행

  // 보호 모드 토글 함수
  const handleProtectionToggle = () => {
    setIsProtectionOn(prevState => !prevState);
  };

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
             {/* ✅ 수정: 등록된 얼굴 카드 - 이미지 위에 텍스트 아래로 */}
            <div className={`${styles.card} ${styles.faceCard} ${styles.imageTop}`}>
              <img src={faceIdIcon} alt="Face ID" className={styles.largeIcon} />
              <p>등록된 얼굴</p>
              <p className={styles.countText}>{faceCount} 개</p> {/* 개수 표시 */}
            </div>

            {/* ✅ 수정: 보호 URL 카드 - 이미지 위에 텍스트 아래로 */}
            <div className={`${styles.card} ${styles.urlCard} ${styles.imageTop}`}>
              <img src={urlIcon} alt="Protected URL" className={styles.largeIcon} />
              <p>보호 URL</p>
              <p className={styles.countText}>{urlCount} 개</p> {/* 개수 표시 */}
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
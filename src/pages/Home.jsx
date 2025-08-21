import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar.jsx';
import styles from '../Home.module.css';
import api from '../api';

// 아이콘 import 부분은 기존과 동일하게 유지
import userAvatar from '../assets/icon_home_shield.png';
import faceIdIcon from '../assets/icon_home_face.png';
import urlIcon from '../assets/icon_home_url.png';
import blurIcon from '../assets/icon_home_blur.png';
import alertIcon from '../assets/icon_home_bell.png';


const Home = ({ setPage }) => {
  const userName = "사용자";
  
  const [isProtectionOn, setIsProtectionOn] = useState(false);
  const [isBlurOn, setIsBlurOn] = useState(true);
  const [isPopupOn, setIsPopupOn] = useState(true);

  // 대시보드 수치
  const [faceCount, setFaceCount] = useState(0);
  const [urlCount, setUrlCount] = useState(0);
  const [protectedUrls, setProtectedUrls] = useState([]);

  // 대시보드 데이터를 불러오는 함수
  const fetchDashboardData = useCallback(async () => {
    try {
      const [facesResponse, urlsResponse] = await Promise.all([
        api.get('/api/v1/faces/'),
        api.get('/api/v1/protections/')
      ]);
      setFaceCount(facesResponse.data.length);
      setUrlCount(urlsResponse.data.length);
      setProtectedUrls(urlsResponse.data.map(item => item.url_pattern));
    } catch (error) {
      console.error("대시보드 데이터 로딩 실패:", error);
      if (error.response?.status === 401) setPage('login');
    }
  }, [setPage]);

  useEffect(() => {
    fetchDashboardData();
    // 로컬 스토리지에서 보호 옵션 상태 불러오기
    const savedBlur = localStorage.getItem('isBlurOn');
    if (savedBlur !== null) setIsBlurOn(JSON.parse(savedBlur));
    const savedPopup = localStorage.getItem('isPopupOn');
    if (savedPopup !== null) setIsPopupOn(JSON.parse(savedPopup));
    
    // 컴포넌트가 로드되면 background.js에게 현재 보호모드 상태를 물어봅니다.
    chrome.runtime.sendMessage({ type: 'GET_PROTECTION_STATUS' }, (response) => {
      if (response) {
        setIsProtectionOn(response.enabled);
      }
    });
  }, [fetchDashboardData]);

  // 백그라운드 스크립트와 연동되는 보호 모드 토글 함수
  const handleProtectionToggle = () => {
    const nextState = !isProtectionOn;
    setIsProtectionOn(nextState);

    chrome.runtime.sendMessage({
      type: 'TOGGLE_PROTECTION',
      enabled: nextState,
      urls: protectedUrls
    });
  };

  return (
    <div className={styles.homeLayout}>
      <Sidebar currentPage="Home" setPage={setPage} />

      <main className={styles.mainContainer}>
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
              role="button"
            >
              <span className={styles.statusText}>
                {isProtectionOn ? 'ON' : 'OFF'}
              </span>
            </div>
          </header>

          {/* 대시보드 카드 */}
          <section className={styles.dashboardGrid}>
            <div className={`${styles.card} ${styles.faceCard} ${styles.imageTop}`}>
              <img src={faceIdIcon} alt="Face ID" className={styles.largeIcon} />
              <p>등록된 얼굴</p>
              <p className={styles.countText}>{faceCount} 개</p>
            </div>

            <div className={`${styles.card} ${styles.urlCard} ${styles.imageTop}`}>
              <img src={urlIcon} alt="Protected URL" className={styles.largeIcon} />
              <p>보호 URL</p>
              <p className={styles.countText}>{urlCount} 개</p>
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
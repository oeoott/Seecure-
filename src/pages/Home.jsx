import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar.jsx';
import styles from '../Home.module.css';
import api from '../api';

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

  const [faceCount, setFaceCount] = useState(0);
  const [urlCount, setUrlCount] = useState(0);
  const [protectedUrls, setProtectedUrls] = useState([]);

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
    const savedBlur = localStorage.getItem('isBlurOn');
    if (savedBlur !== null) setIsBlurOn(JSON.parse(savedBlur));
    const savedPopup = localStorage.getItem('isPopupOn');
    if (savedPopup !== null) setIsPopupOn(JSON.parse(savedPopup));
    
    // ⭐️ sendMessage 호출 방식을 Promise 기반으로 수정했습니다.
    const getStatus = async () => {
      try {
        const response = await chrome.runtime.sendMessage({ type: 'GET_PROTECTION_STATUS' });
        if (response) {
          setIsProtectionOn(response.enabled);
        }
      } catch (error) {
        console.warn("백그라운드와 연결 실패:", error);
        setIsProtectionOn(false);
      }
    };
    getStatus();
  }, [fetchDashboardData]);

  // ⭐️ sendMessage 호출 방식을 Promise 기반으로 수정했습니다.
  const handleProtectionToggle = () => {
    const nextState = !isProtectionOn;
    setIsProtectionOn(nextState);

    const toggleProtection = async () => {
      try {
        await chrome.runtime.sendMessage({
          type: 'TOGGLE_PROTECTION',
          enabled: nextState,
          urls: protectedUrls
        });
      } catch (error) {
        console.warn("백그라운드와 연결 실패:", error);
      }
    };
    toggleProtection();
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
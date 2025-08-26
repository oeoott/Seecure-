// src/pages/Home.jsx
// 대시보드 메인 페이지: 보호 모드, 등록 얼굴 수, 보호 URL 수, 옵션(블러/팝업) 관리

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

  // 보호 모드 및 옵션 상태
  const [isProtectionOn, setIsProtectionOn] = useState(false);
  const [isBlurOn, setIsBlurOn] = useState(true);
  const [isPopupOn, setIsPopupOn] = useState(true);

  // 등록된 데이터 수
  const [faceCount, setFaceCount] = useState(0);
  const [urlCount, setUrlCount] = useState(0);
  const [protectedUrls, setProtectedUrls] = useState([]);

  // 하이드레이트 완료 여부
  const [optionsHydrated, setOptionsHydrated] = useState(false);
  const [urlsHydrated, setUrlsHydrated] = useState(false);

  // 대시보드/URL 데이터 불러오기 (서버 권위)
  const fetchDashboardData = useCallback(async () => {
    try {
      const [facesResponse, urlsResponse] = await Promise.all([
        api.get('/api/v1/faces/'),
        api.get('/api/v1/protections/')
      ]);
      setFaceCount(facesResponse.data.length);
      setUrlCount(urlsResponse.data.length);
      const urls = urlsResponse.data.map(item => item.url_pattern);
      setProtectedUrls(urls);
      setUrlsHydrated(true);
    } catch (error) {
      console.error("대시보드 데이터 로딩 실패:", error);
      if (error.response?.status === 401) setPage('login');
    }
  }, [setPage]);

  // 최초 로드: 서버 데이터 + BG 옵션/상태 하이드레이트
  useEffect(() => {
    fetchDashboardData();

    // 옵션 동기화
    (async () => {
      try {
        const res = await chrome.runtime.sendMessage({ type: 'GET_OPTIONS' });
        if (res?.ok && res.options) {
          const blur = !!res.options.blur;
          const popup = !!res.options.popup;
          setIsBlurOn(blur);
          setIsPopupOn(popup);
          localStorage.setItem('isBlurOn', JSON.stringify(blur));
          localStorage.setItem('isPopupOn', JSON.stringify(popup));
        }
      } catch {}
      setOptionsHydrated(true);
    })();

    // 보호 모드 상태 불러오기
    (async () => {
      try {
        const res = await chrome.runtime.sendMessage({ type: 'GET_PROTECTION_STATUS' });
        if (res) setIsProtectionOn(res.enabled);
      } catch {
        setIsProtectionOn(false);
      }
    })();
  }, [fetchDashboardData]);

  // BG → Home 옵션 변경 이벤트 수신
  useEffect(() => {
    const onMsg = (msg) => {
      if (msg?.type === 'OPTIONS_CHANGED' && msg.options) {
        if (typeof msg.options.blur === 'boolean') {
          setIsBlurOn(msg.options.blur);
          localStorage.setItem('isBlurOn', JSON.stringify(msg.options.blur));
        }
        if (typeof msg.options.popup === 'boolean') {
          setIsPopupOn(msg.options.popup);
          localStorage.setItem('isPopupOn', JSON.stringify(msg.options.popup));
        }
      }
    };
    chrome?.runtime?.onMessage?.addListener?.(onMsg);
    return () => chrome?.runtime?.onMessage?.removeListener?.(onMsg);
  }, []);

  // 옵션/URL 동기화 (모두 하이드레이트된 후만)
  useEffect(() => {
    if (!optionsHydrated || !urlsHydrated) return;
    (async () => {
      try {
        await chrome.runtime.sendMessage({
          type: 'SYNC_OPTIONS',
          options: { blur: isBlurOn, popup: isPopupOn },
          urls: protectedUrls
        });
      } catch (e) {
        console.warn('옵션 동기화 실패:', e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBlurOn, isPopupOn, protectedUrls, optionsHydrated, urlsHydrated]);

  // 보호 모드 토글
  const handleProtectionToggle = () => {
    const next = !isProtectionOn;
    setIsProtectionOn(next);
    (async () => {
      try {
        await chrome.runtime.sendMessage({
          type: 'TOGGLE_PROTECTION',
          enabled: next,
          urls: protectedUrls,
          options: { blur: isBlurOn, popup: isPopupOn }
        });
      } catch (e) {
        console.warn('보호모드 토글 실패:', e);
      }
    })();
  };

  // 옵션 토글
  const toggleBlur = () => {
    const next = !isBlurOn;
    setIsBlurOn(next);
    localStorage.setItem('isBlurOn', JSON.stringify(next));
  };
  const togglePopup = () => {
    const next = !isPopupOn;
    setIsPopupOn(next);
    localStorage.setItem('isPopupOn', JSON.stringify(next));
  };

  return (
    <div className={styles.homeLayout}>
      <Sidebar currentPage="Home" setPage={setPage} />

      <main className={styles.mainContainer}>
        <div className={styles.contentWrapper}>
          {/* 상단 사용자/보호 모드 패널 */}
          <header className={styles.userPanel}>
            <div className={styles.userInfo}>
              <img src={userAvatar} alt="User Avatar" className={styles.avatar} />
              <div>
                <h1 className={styles.mainTitle}>보호 모드</h1>
                <p className={styles.userName}>{userName}</p>
              </div>
            </div>
            <div className={styles.headerActions}>
              <div
                className={`${styles.statusToggle} ${!isProtectionOn ? styles.off : ''}`}
                onClick={handleProtectionToggle}
                role="button"
                aria-label="보호 모드 토글"
              >
                <span className={styles.statusText}>
                  {isProtectionOn ? 'ON' : 'OFF'}
                </span>
              </div>
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

            <div
              className={`${styles.card} ${styles.blurCard}`}
              onClick={toggleBlur}
              role="button"
              title="블러 옵션 토글"
            >
              <img src={blurIcon} alt="Blur Effect" className={styles.smallIcon} />
              <div className={styles.textGroup}>
                <p>블러 효과</p>
                <span className={`${styles.optionStatusText} ${!isBlurOn ? styles.offStatus : ''}`}>
                  {isBlurOn ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>

            <div
              className={`${styles.card} ${styles.alertCard}`}
              onClick={togglePopup}
              role="button"
              title="알림 팝업 옵션 토글"
            >
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

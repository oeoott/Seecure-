// src/pages/Home.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
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

  // 사용자 설정
  const [isBlurOn, setIsBlurOn] = useState(true);
  const [isPopupOn, setIsPopupOn] = useState(true);

  // 대시보드 수치
  const [faceCount, setFaceCount] = useState(0);
  const [urlCount, setUrlCount] = useState(0);

  // 캡처/감지
  const videoRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  // 감지 및 표시 상태(분리!)
  const [intrusionDetected, setIntrusionDetected] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false); // 실제 블러 표시 여부

  const fetchDashboardData = useCallback(async () => {
    try {
      const [facesResponse, urlsResponse] = await Promise.all([
        api.get('/api/v1/faces/'),
        api.get('/api/v1/protections/')
      ]);
      setFaceCount(facesResponse.data.length);
      setUrlCount(urlsResponse.data.length);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      if (error.response && error.response.status === 401) {
        alert('인증 정보가 유효하지 않습니다. 다시 로그인해주세요.');
        setPage('login');
      } else {
        alert("대시보드 정보를 불러오는 데 실패했습니다.");
      }
    }
  }, [setPage]);

  useEffect(() => {
    fetchDashboardData();
    const savedBlur = localStorage.getItem('isBlurOn');
    if (savedBlur !== null) setIsBlurOn(JSON.parse(savedBlur));
    const savedPopup = localStorage.getItem('isPopupOn');
    if (savedPopup !== null) setIsPopupOn(JSON.parse(savedPopup));
  }, [fetchDashboardData]);

  // 침입 감지 → 팝업(사용자 설정을 따름)
  useEffect(() => {
    if (intrusionDetected && isPopupOn) {
      alert('침입자가 감지되었습니다!');
    }
  }, [intrusionDetected, isPopupOn]);

  // 침입 감지 또는 블러 설정 변경 시, 오버레이 표시 여부 갱신
  useEffect(() => {
    setIsOverlayVisible(intrusionDetected && isBlurOn);
  }, [intrusionDetected, isBlurOn]);

  const startDetection = useCallback(() => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    if (detectionIntervalRef.current) return; // 중복 방지

    detectionIntervalRef.current = setInterval(async () => {
      const v = videoRef.current;
      if (!v) return;
      if (v.readyState < 2 || !v.videoWidth) return;

      const canvas = document.createElement('canvas');
      canvas.width = v.videoWidth;
      canvas.height = v.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const formData = new FormData();
        formData.append('file', blob, 'frame.jpg');

        try {
          const response = await api.post('/api/v1/ai/detect-frame', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          console.log('[AI] resp:', response.data);
          const detected = response.data.intruder_alert === true;

          // 1) 침입 감지 상태 저장
          setIntrusionDetected(detected);
          // 2) 블러는 사용자 설정을 따름
          setIsOverlayVisible(detected && isBlurOn);
        } catch (error) {
          console.error("Frame detection error:", error.response ? error.response.data : error.message);
          setIntrusionDetected(false);
          setIsOverlayVisible(false);
        }
      }, 'image/jpeg', 0.9);
    }, 1000);
  }, [isBlurOn]);

  const stopDetection = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setIntrusionDetected(false);
    setIsOverlayVisible(false);
  }, []);

  const handleProtectionToggle = useCallback(async () => {
    if (isProtectionOn) {
      stopDetection();
      setIsProtectionOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          await new Promise((res) => {
            const v = videoRef.current;
            if (!v) return res();
            if (v.readyState >= 2 && v.videoWidth) return res();
            v.onloadedmetadata = () => res();
          });
          await videoRef.current.play();

          setIsProtectionOn(true);
          startDetection();
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
        alert("웹캠을 사용할 수 없습니다. 카메라 권한을 확인해주세요.");
      }
    }
  }, [isProtectionOn, startDetection, stopDetection]);

  // 탭 숨김 시 스트림 반납
  useEffect(() => {
    const onHide = () => { if (document.hidden) stopDetection(); };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [stopDetection]);

  return (
    <div className={styles.homeLayout}>
      {/* 보호 조치용 블러 오버레이: 침입 + 블러 ON 일 때만 */}
      {isOverlayVisible && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center',
          color: 'white', fontSize: '2rem', textAlign: 'center'
        }}>
          보호 조치가 실행 중입니다.
        </div>
      )}

      <Sidebar currentPage="Home" setPage={setPage} />

      <main className={styles.mainContainer}>
        <div className={styles.contentWrapper}>
          <header className={styles.userPanel}>
            <div className={styles.userInfo}>
              <img src={userAvatar} alt="User Avatar" className={styles.avatar} />
              <div>
                <h1 className={styles.mainTitle}>보호 모드</h1>
                <p className={styles.userName}>{userName}</p>
                {/* 비디오 요소는 숨김 */}
                <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />
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

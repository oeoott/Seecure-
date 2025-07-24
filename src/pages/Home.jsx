// src/pages/Home.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './Sidebar.jsx';
import styles from '../Home.module.css';
import api from '../api';

import userAvatar from '../assets/icon_home_shield.png';
import faceIdIcon from '../assets/icon_home_face.png';
// ... (기타 아이콘 import)

const Home = ({ setPage }) => {
  const [isProtectionOn, setIsProtectionOn] = useState(false); // 초기값 false로 변경
  const [protectionStatus, setProtectionStatus] = useState('NORMAL'); // AI 분석 결과 상태
  
  // ... (기존 다른 state들: isBlurOn, isPopupOn, faceCount, urlCount) ...
  const [isBlurOn, setIsBlurOn] = useState(true);
  const [isPopupOn, setIsPopupOn] = useState(true);
  const [faceCount, setFaceCount] = useState(0);
  const [urlCount, setUrlCount] = useState(0);

  const videoRef = useRef(null);
  const intervalRef = useRef(null); // setInterval ID 저장

  // 대시보드 데이터 로드
  useEffect(() => {
    // ... (기존 localStorage 및 api 호출 로직은 동일) ...
    // ...
  }, [setPage]);

  // 보호 모드 시작 함수
  const startProtection = useCallback(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        // 0.5초(500ms)마다 프레임 분석
        intervalRef.current = setInterval(async () => {
          if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
            return;
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob(async (blob) => {
            if (!blob) return;
            
            const formData = new FormData();
            formData.append('file', blob, 'frame.jpg');

            try {
              const response = await api.post('/api/v1/ai/detect-frame', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
              });
              setProtectionStatus(response.data.status); // 상태 업데이트
            } catch (error) {
              console.error("Frame detection error:", error.response?.data?.detail || error.message);
              // 에러 발생 시 보호 모드 중지
              stopProtection(); 
              setIsProtectionOn(false);
              alert(error.response?.data?.detail || "감지 중 오류가 발생하여 보호모드를 중지합니다.");
            }
          }, 'image/jpeg');

        }, 500);
      })
      .catch(err => {
        console.error("웹캠 접근 오류:", err);
        alert("웹캠에 접근할 수 없습니다.");
        setIsProtectionOn(false); // 스위치 원상복구
      });
  }, []);

  // 보호 모드 중지 함수
  const stopProtection = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setProtectionStatus('NORMAL'); // 상태 초기화
  }, []);

  // isProtectionOn 상태가 변경될 때마다 보호 모드를 시작하거나 중지
  useEffect(() => {
    if (isProtectionOn) {
      startProtection();
    } else {
      stopProtection();
    }
    // 컴포넌트 언마운트 시 정리
    return () => stopProtection();
  }, [isProtectionOn, startProtection, stopProtection]);

  const handleProtectionToggle = () => setIsProtectionOn(prev => !prev);
  
  // 보호가 필요한 상태인지 확인
  const needsProtection = isProtectionOn && protectionStatus !== 'NORMAL';

  return (
    <div className={styles.homeLayout}>
      <Sidebar currentPage="Home" setPage={setPage} />
      
      {/* ⭐️ 보호 레이어: 블러 및 경고 메시지 */}
      {needsProtection && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw', height: '100vh',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: isBlurOn ? 'blur(10px)' : 'none',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#d32f2f',
          textAlign: 'center'
        }}>
          {isPopupOn && (
            <div style={{
              padding: '2rem',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{margin: 0}}>⚠️ 보안 경고 ⚠️</h2>
              <p>{protectionStatus === 'INTRUSION' ? '타인이 감지되었습니다!' : '사용자의 시선이 이탈했습니다.'}</p>
            </div>
          )}
        </div>
      )}

      {/* ⭐️ 숨겨진 비디오 요소: 웹캠 스트림을 받기 위함 */}
      <video ref={videoRef} autoPlay style={{ display: 'none' }} />

      <main className={styles.mainContainer}>
        {/* ... (기존 대시보드 JSX 코드는 동일) ... */}
        {/* ... */}
      </main>
    </div>
  );
};

export default Home;

// src/pages/FaceRegistration.jsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar.jsx';
import styles from '../FaceRegistration.module.css';
import api from '../api';

const FaceRegistration = ({ setPage }) => {
  const [name, setName] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false); // 등록 중 상태 추가
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = async () => {
              try {
                await videoRef.current.play();
                setIsCameraOn(true);
                console.log("[성공] 카메라 연결 성공");
              } catch (err) {
                console.error("[실패] video play() 실패", err);
              }
            };
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
        alert("웹캠을 사용할 수 없습니다. 카메라 권한을 확인해주세요.");
      }
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const handleRegister = async () => {
    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    if (!isCameraOn || !videoRef.current) {
      alert("카메라가 준비되지 않았습니다.");
      return;
    }

    setIsCapturing(true); // 등록 시작

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // --- canvas.toBlob 대신 canvas.toDataURL 사용 ---
    // 이미지를 Base64 문자열로 변환
    const base64Image = canvas.toDataURL('image/jpeg');
    if (!base64Image) {
        alert("이미지 캡처에 실패했습니다.");
        setIsCapturing(false);
        return;
    }

    // JSON 객체 생성
    const payload = {
      name: name, // 사용자가 입력한 이름
      image: base64Image
    };

    try {
      // JSON 객체와 함께 API를 호출 (Content-Type 헤더는 제거)
      // (api.js에서 'application/json'으로 기본 설정되어 있음)
      const response = await api.post('/api/v1/ai/register-face', payload);
      
      // TODO: 여기서 등록된 얼굴의 이름(name)을 저장하는 별도의 API를 호출할 수 있습니다.
      // 예: await api.post('/api/v1/faces', { name: name });

      alert(response.data.message || "얼굴 등록 성공");
      setName('');
      setPage('FaceManagement');

    } catch (error) {
      console.error("Signup error:", error);
      if (error.response?.data?.detail) {
        alert(`얼굴 등록 실패: ${error.response.data.detail}`);
      } else {
        alert('얼굴 등록 중 오류가 발생했습니다.');
      }
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar currentPage="FaceRegistration" setPage={setPage} />
      <div className={styles.contentWrapper}>
        <div className={styles.mainContent}>
          <header className={styles.mainHeader}>
            <h1 className={styles.mainTitle}>얼굴 등록</h1>
            <p className={styles.subtitle}>웹캠을 통해 얼굴을 등록해보세요.</p>
          </header>

          {/* --- 🔽 여기가 요청하신 디자인으로 수정된 부분입니다 --- */}
          <div className={styles.videoBox}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '35px' }}
            />
            {/* 캡처를 위한 canvas는 보이지 않게 유지합니다. */}
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
          </div>
          
          <div className={styles.formRow}>
            <label>이름 입력</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              disabled={isCapturing} // 캡처 중에는 입력 비활성화
            />
            <button onClick={handleRegister} disabled={isCapturing}>
              {isCapturing ? '등록 중...' : '등록'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceRegistration;

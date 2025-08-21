/* content.js */
(() => {
  // ... (기존의 블러 생성/제거 함수들은 그대로 유지) ...
  let overlay = null;
  let cursorBlur = null;
  // ... (ensureOverlay, removeOverlay 등 모든 블러 관련 함수) ...

  let controlPanel = null;
  let videoElement = null;
  let detectionInterval = null;

  // 🔹 AI 감지 로직 (Home.jsx에서 가져옴)
  const startDetection = async () => {
    if (detectionInterval) return; // 이미 실행 중이면 중복 방지

    try {
      // 1. 숨겨진 비디오 요소 생성 및 스트림 연결
      videoElement = document.createElement('video');
      videoElement.style.display = 'none';
      document.body.appendChild(videoElement);
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoElement.srcObject = stream;
      await videoElement.play();
      console.log("카메라 스트림 시작, 감지를 시작합니다.");

      // 2. 1초마다 프레임 감지
      detectionInterval = setInterval(async () => {
        if (!videoElement || videoElement.readyState < 2) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const formData = new FormData();
          formData.append('file', blob, 'frame.jpg');

          try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/ai/detect-frame', {
              method: 'POST',
              body: formData,
              // content.js에서는 api.js를 쓸 수 없으므로, 직접 토큰을 가져와 헤더에 추가합니다.
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            
            if (!response.ok) throw new Error('서버 응답 오류');

            const data = await response.json();
            console.log('[AI] 감지 결과:', data);

            if (data.intruder_alert === true) {
              onUnauthorizedUserDetected();
            }

          } catch (error) {
            console.error("프레임 감지 API 호출 실패:", error);
            stopDetection(); // 에러 발생 시 감지 중단
          }
        }, 'image/jpeg');
      }, 1000);
    } catch (err) {
      console.error("카메라 접근 실패:", err);
      // 사용자에게 권한 요청을 안내할 수 있습니다.
    }
  };

  const stopDetection = () => {
    if (detectionInterval) {
      clearInterval(detectionInterval);
      detectionInterval = null;
    }
    if (videoElement && videoElement.srcObject) {
      videoElement.srcObject.getTracks().forEach(track => track.stop());
      videoElement.remove();
      videoElement = null;
    }
    console.log("감지를 중단합니다.");
  };

  // 🔹 침입자 감지 시 동작 (블러 + 컨트롤 창)
  const onUnauthorizedUserDetected = () => {
    // ... (이전 답변에서 제공한 onUnauthorizedUserDetected, injectControlPanel 함수는 그대로 사용) ...
  };

  // 🔹 background.js로부터 메시지를 받습니다.
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'START_DETECTION') {
      startDetection();
    }
  });

})();
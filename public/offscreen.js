// offscreen.js (수정본)

console.log("offscreen.js 스크립트 시작됨.");

const video = document.querySelector('#webcam');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Offscreen 페이지가 메시지를 받음:", message);

  if (message.target === 'offscreen' && message.type === 'capture-frame') {
    captureAndSendFrame().catch(err => {
        console.error("캡처 및 전송 중 에러 발생:", err);
    });
    return true; 
  }
});

async function captureAndSendFrame() {
    console.log("웹캠 스트림 가져오기 시도...");
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 }
        });
        video.srcObject = stream;
        await video.play();

        const canvas = new OffscreenCanvas(video.videoWidth, video.videoHeight);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        
        const blob = await canvas.convertToBlob({ type: 'image/jpeg' });
        
        stream.getTracks().forEach(track => track.stop());

        // Blob을 Data URL로 변환하는 로직 추가
        const reader = new FileReader();
        reader.onloadend = () => {
            // 변환이 끝나면 background.js로 Data URL 전송
            console.log("Data URL 변환 완료, Background로 전송 시도...");
            chrome.runtime.sendMessage({ type: 'frame-captured', dataUrl: reader.result });
        };
        reader.readAsDataURL(blob);

    } catch (error) {
        console.error("getUserMedia 또는 캔버스 작업 중 심각한 오류:", error);
        chrome.runtime.sendMessage({ type: 'capture-error', error: error.message });
    }
}
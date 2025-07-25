# app/detection/utils.py

import os
import numpy as np

# --- ONNX 세션을 한 번만 로드하여 재사용 (지연 로딩) ---
onnx_session = None

def get_onnx_session():
    """ONNX 런타임 세션을 생성하거나 기존 세션을 반환합니다."""
    global onnx_session
    if onnx_session is None:
        import onnxruntime as ort
        print("[INFO] Loading ONNX model for face detection...")
        # 모델 파일 경로는 app 폴더를 기준으로 합니다.
        model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'yolov8n-face.onnx')
        onnx_session = ort.InferenceSession(model_path)
    return onnx_session

def load_user_face(user_face_path):
    """사용자 얼굴 데이터를 불러옵니다."""
    try:
        if not os.path.exists(user_face_path):
            return None
        return np.load(user_face_path)
    except Exception as e:
        print(f"[ERROR] 사용자 얼굴 데이터 로딩 실패: {e}")
        return None

def detect_faces(onnx_session, frame, conf_threshold=0.5):
    """YOLOv8 모델을 사용하여 프레임에서 얼굴을 감지합니다."""
    cv2 = __import__('cv2')
    
    # 이미지 전처리
    input_size = 640
    img_resized = cv2.resize(frame, (input_size, input_size))
    img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
    img_norm = img_rgb.astype(np.float32) / 255.0
    img_transposed = np.transpose(img_norm, (2, 0, 1))
    input_tensor = np.expand_dims(img_transposed, axis=0)

    # ONNX 모델 추론
    ort_inputs = {onnx_session.get_inputs()[0].name: input_tensor}
    outputs = onnx_session.run(None, ort_inputs)[0]
    
    # 결과 후처리
    boxes = []
    output = outputs[0]
    
    h, w = frame.shape[:2]
    scale_w, scale_h = w / input_size, h / input_size

    for i in range(output.shape[1]):
        if output[4, i] > conf_threshold: # 5번째 행이 confidence score
            x_center, y_center, width, height = output[:4, i]
            
            x1 = int((x_center - width / 2) * scale_w)
            y1 = int((y_center - height / 2) * scale_h)
            x2 = int((x_center + width / 2) * scale_w)
            y2 = int((y_center + height / 2) * scale_h)
            
            boxes.append((x1, y1, x2, y2))
            
    return boxes

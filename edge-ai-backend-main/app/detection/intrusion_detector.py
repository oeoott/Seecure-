# detection/intrusion_detector.py
import numpy as np
import os

YOLO_MODEL_PATH = "app/models/yolov8n-face.onnx"
INPUT_SIZE = 640

# 🔽 모델 세션을 전역 변수로 선언만 해둡니다. (Lazy Loading)
onnx_session = None

def get_onnx_session():
    """ONNX 세션을 필요할 때 딱 한 번만 로드하는 함수"""
    import onnxruntime as ort
    global onnx_session
    if onnx_session is None:
        print("[INFO] Loading ONNX model for intrusion detection...")
        onnx_session = ort.InferenceSession(YOLO_MODEL_PATH)
    return onnx_session

def load_user_face(user_face_path: str):
    if not os.path.exists(user_face_path):
        return None
    return np.load(user_face_path)

def preprocess_for_onnx(img):
    import cv2
    img_resized = cv2.resize(img, (INPUT_SIZE, INPUT_SIZE))
    img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
    img_norm = img_rgb.astype(np.float32) / 255.0
    img_transposed = np.transpose(img_norm, (2, 0, 1))
    img_input = np.expand_dims(img_transposed, axis=0)
    return img_input, (img.shape[1] / INPUT_SIZE, img.shape[0] / INPUT_SIZE)

def detect_faces(frame, conf_threshold=0.5):
    session = get_onnx_session() # 🔽 필요할 때 세션을 가져옵니다.
    input_tensor, scale = preprocess_for_onnx(frame)
    ort_inputs = {session.get_inputs()[0].name: input_tensor}
    outputs = session.run(None, ort_inputs)[0]

    if outputs.ndim == 3:
        outputs = outputs[0]

    boxes = []
    for det in outputs:
        if len(det) < 5: continue
        x_c, y_c, w, h, conf = det[:5]
        if conf < conf_threshold: continue

        x1 = int((x_c - w / 2) * scale[0])
        y1 = int((y_c - h / 2) * scale[1])
        x2 = int((x_c + w / 2) * scale[0])
        y2 = int((y_c + h / 2) * scale[1])
        boxes.append([x1, y1, x2, y2])
    return boxes

def detect_intrusion(frame, user_face_path: str):
    import cv2
    user_face = load_user_face(user_face_path)
    if user_face is None:
        # 등록된 얼굴이 없으면, 한 명이라도 감지되면 침입으로 간주
        boxes_for_check = detect_faces(frame)
        return len(boxes_for_check) > 0

    boxes = detect_faces(frame)
    if not boxes:
        return False

    is_user_present = False
    for box in boxes:
        x1, y1, x2, y2 = box
        y1, y2 = max(0, y1), min(frame.shape[0], y2)
        x1, x2 = max(0, x1), min(frame.shape[1], x2)
        
        cropped = frame[y1:y2, x1:x2]
        if cropped.size == 0: continue

        face_resized = cv2.resize(cropped, (100, 100))
        diff = np.mean(np.abs(user_face.astype("float32") - face_resized.astype("float32")))
        
        if diff < 50:
            is_user_present = True
            break
    
    # 사용자가 있는데, 탐지된 사람 수가 1명 초과이면 침입
    if is_user_present and len(boxes) > 1:
        return True
    # 사용자가 없는데, 탐지된 사람이 1명 이상이면 침입
    if not is_user_present and len(boxes) >= 1:
        return True
        
    return False

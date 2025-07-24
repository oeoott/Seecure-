# app/detection/intrusion_detector.py
import cv2
import numpy as np
import os
import onnxruntime as ort
import time

# --- 기존 코드 ---
YOLO_MODEL_PATH = "app/models/yolov8n-face.onnx" # ⭐️ 경로 수정
USER_FACE_PATH = "models/user_face.npy" # 이 경로는 더 이상 직접 사용하지 않음
INPUT_SIZE = 640
onnx_session = ort.InferenceSession(YOLO_MODEL_PATH)

# ⭐️ 함수 수정: 파일 경로를 인자로 받도록 변경
def load_user_face(user_face_path):
    if not os.path.exists(user_face_path):
        # API 환경에서는 exit() 대신 None을 반환하여 에러 처리
        return None
    return np.load(user_face_path)

def preprocess_for_onnx(img):
    # ... (내부 로직은 변경 없음)
    img_resized = cv2.resize(img, (INPUT_SIZE, INPUT_SIZE))
    img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
    img_norm = img_rgb.astype(np.float32) / 255.0
    img_transposed = np.transpose(img_norm, (2, 0, 1))
    img_input = np.expand_dims(img_transposed, axis=0)
    return img_input, img.shape[:2], (img.shape[1] / INPUT_SIZE, img.shape[0] / INPUT_SIZE)

def detect_faces(frame, conf_threshold=0.5):
    # ... (내부 로직은 변경 없음)
    input_tensor, original_shape, scale = preprocess_for_onnx(frame)
    ort_inputs = {onnx_session.get_inputs()[0].name: input_tensor}
    outputs = onnx_session.run(None, ort_inputs)[0]
    if outputs.ndim == 3:
        outputs = outputs[0]
    boxes = []
    for det in outputs:
        if len(det) < 6: continue
        x_c, y_c, w, h, conf = det[:5]
        if conf < conf_threshold: continue
        x1 = int((x_c - w / 2) * scale[0])
        y1 = int((y_c - h / 2) * scale[1])
        x2 = int((x_c + w / 2) * scale[0])
        y2 = int((y_c + h / 2) * scale[1])
        boxes.append([x1, y1, x2, y2])
    return boxes

def is_same_person(face1, face2, threshold=50):
    # ... (내부 로직은 변경 없음)
    face1 = cv2.resize(face1, (100, 100)).astype("float32")
    face2 = cv2.resize(face2, (100, 100)).astype("float32")
    diff = np.mean(np.abs(face1 - face2))
    return diff < threshold

# ⭐️ 함수 수정: 사용자 얼굴 경로를 인자로 받도록 변경
def detect_intrusion(frame, user_face_path):
    user_face = load_user_face(user_face_path)
    if user_face is None:
        # 사용자 얼굴 데이터가 없으면 항상 침입으로 간주하거나, 에러 처리
        return True 
    
    boxes = detect_faces(frame)
    if not boxes: # 프레임에 얼굴이 없으면 침입이 아님
        return False

    is_user_present = False
    for box in boxes:
        x1, y1, x2, y2 = box
        cropped = frame[y1:y2, x1:x2]
        if cropped.size == 0: continue
        
        if is_same_person(user_face, cropped):
            is_user_present = True
            break # 등록된 사용자를 찾으면 루프 중단

    # 한 명이라도 등록된 사용자가 있으면 침입이 아님 (False)
    # 프레임에 얼굴이 있지만 등록된 사용자가 없으면 침입 (True)
    return not is_user_present


# --- main 함수는 테스트용이므로 수정 불필요 ---
# ...


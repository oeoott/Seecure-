# app/detection/face_register.py

import cv2
import numpy as np
import os
from typing import Optional, Tuple

# --- 지연 로딩을 위한 전역 변수 ---
_onnx_session = None
_face_mesh = None

def get_onnx_session():
    """ONNX 세션을 지연 로딩하여 반환합니다."""
    global _onnx_session
    if _onnx_session is None:
        print("[INFO] Loading ONNX model for face registration...")
        import onnxruntime as ort
        YOLO_MODEL_PATH = "app/models/yolov8n-face.onnx"
        _onnx_session = ort.InferenceSession(YOLO_MODEL_PATH)
    return _onnx_session

def get_face_mesh():
    """MediaPipe Face Mesh를 지연 로딩하여 반환합니다."""
    global _face_mesh
    if _face_mesh is None:
        print("[INFO] Loading MediaPipe Face Mesh for face registration...")
        import mediapipe as mp
        mp_face_mesh = mp.solutions.face_mesh
        _face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True)
    return _face_mesh

def preprocess_for_onnx(img, input_size=640):
    img_resized = cv2.resize(img, (input_size, input_size))
    img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
    img_norm = img_rgb.astype(np.float32) / 255.0
    img_transposed = np.transpose(img_norm, (2, 0, 1))
    img_input = np.expand_dims(img_transposed, axis=0)
    return img_input, img.shape[:2]

def detect_face_bbox(onnx_session, frame: np.ndarray) -> Optional[Tuple[int, int, int, int]]:
    """ONNX 모델을 사용하여 프레임에서 가장 신뢰도 높은 얼굴의 바운딩 박스를 찾습니다."""
    input_tensor, original_shape = preprocess_for_onnx(frame)
    ort_inputs = {onnx_session.get_inputs()[0].name: input_tensor}
    outputs = onnx_session.run(None, ort_inputs)[0]

    boxes = outputs[0]
    h, w = original_shape
    best_box = None
    max_conf = 0.5  # 최소 신뢰도 임계값

    for box in boxes:
        conf = box[4]
        if conf > max_conf:
            max_conf = conf
            x_center, y_center, bw, bh = box[0:4]
            x1 = int((x_center - bw / 2) * w / 640)
            y1 = int((y_center - bh / 2) * h / 640)
            x2 = int((x_center + bw / 2) * w / 640)
            y2 = int((y_center + bh / 2) * h / 640)
            best_box = (x1, y1, x2, y2)
            
    return best_box

def register_user_face(image_bytes: bytes, user_id: str):
    """
    이미지 바이트를 받아 얼굴을 등록하고, 얼굴과 눈 좌표를 .npy 파일로 저장합니다.
    """
    try:
        onnx_session = get_onnx_session()
        face_mesh = get_face_mesh()

        frame = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError("Could not decode image.")

        face_bbox = detect_face_bbox(onnx_session, frame)

        if not face_bbox:
            raise ValueError("얼굴을 찾을 수 없습니다. 더 밝은 곳에서 정면을 보고 다시 시도해주세요.")

        x1, y1, x2, y2 = face_bbox
        face_roi = frame[y1:y2, x1:x2]

        # --- 🔽 여기가 수정된 부분입니다 ---
        # 잘라낸 이미지가 비어있는지 확인하여 충돌을 방지합니다.
        if face_roi.size == 0:
            raise ValueError("얼굴 영역을 잘라내는 데 실패했습니다. 다시 시도해주세요.")
        
        resized_face = cv2.resize(face_roi, (100, 100))

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = face_mesh.process(rgb)
        if result.multi_face_landmarks:
            landmarks = result.multi_face_landmarks[0].landmark
            h, w, _ = frame.shape
            left_iris_idx, right_iris_idx = 473, 468 # MediaPipe v0.9+
            
            left = np.array([landmarks[left_iris_idx].x * w, landmarks[left_iris_idx].y * h])
            right = np.array([landmarks[right_iris_idx].x * w, landmarks[right_iris_idx].y * h])
            eye_center = ((left + right) / 2).astype(np.float32)

            # --- 사용자별 데이터 저장을 위해 경로 수정 ---
            user_data_dir = f"app/models/{user_id}"
            os.makedirs(user_data_dir, exist_ok=True)
            
            np.save(os.path.join(user_data_dir, "user_face.npy"), resized_face)
            np.save(os.path.join(user_data_dir, "user_eye_pos.npy"), eye_center)

            print(f"[완료] 사용자 ID '{user_id}'의 얼굴과 시선 좌표 저장됨.")
        else:
            raise ValueError("얼굴의 상세 좌표(눈 위치)를 찾는 데 실패했습니다.")

    except Exception as e:
        print(f"Error during face registration: {e}")
        # API 라우터에서 처리할 수 있도록 에러를 다시 발생시킵니다.
        raise e

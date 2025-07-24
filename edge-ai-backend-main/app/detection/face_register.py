# detection/face_register.py
import os
import numpy as np

# 경로
SAVE_FACE_PATH = "app/models/user_face.npy"
SAVE_EYE_PATH = "app/models/user_eye_pos.npy"
YOLO_MODEL_PATH = "app/models/yolov8n-face.onnx"

# 🔽 모델과 세션을 전역 변수로 선언만 해둡니다. (Lazy Loading)
onnx_session = None
face_mesh = None

def get_ai_models():
    """AI 모델을 필요할 때 딱 한 번만 로드하는 함수"""
    # 🔽 함수 내부에서 라이브러리를 import 합니다.
    import mediapipe as mp
    import onnxruntime as ort
    
    global onnx_session, face_mesh
    if onnx_session is None:
        print("[INFO] Loading ONNX model for face registration...")
        onnx_session = ort.InferenceSession(YOLO_MODEL_PATH)
    if face_mesh is None:
        print("[INFO] Loading MediaPipe Face Mesh for face registration...")
        mp_face_mesh = mp.solutions.face_mesh
        face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True)
    return onnx_session, face_mesh

def preprocess_for_onnx(img, input_size=640):
    import cv2
    img_resized = cv2.resize(img, (input_size, input_size))
    img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
    img_norm = img_rgb.astype(np.float32) / 255.0
    img_transposed = np.transpose(img_norm, (2, 0, 1))
    img_input = np.expand_dims(img_transposed, axis=0)
    return img_input, img.shape[:2]

def detect_face_bbox(frame, session):
    input_tensor, original_shape = preprocess_for_onnx(frame)
    ort_inputs = {session.get_inputs()[0].name: input_tensor}
    outputs = session.run(None, ort_inputs)[0]
    
    boxes = outputs[0]
    h, w = original_shape
    scale_w, scale_h = w / 640, h / 640

    for box in boxes:
        conf = box[4]
        if conf > 0.5:
            x_center, y_center, bw, bh = box[0:4]
            x1 = int((x_center - bw / 2) * scale_w)
            y1 = int((y_center - bh / 2) * scale_h)
            x2 = int((x_center + bw / 2) * scale_w)
            y2 = int((y_center + bh / 2) * scale_h)
            return x1, y1, x2, y2
    return None

def register_face_from_image(image_bytes: bytes):
    """API로부터 받은 이미지 바이트로 얼굴 등록을 수행하는 함수"""
    import cv2
    try:
        session, mesh = get_ai_models() # 🔽 API가 호출될 때 모델 로드
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            return {"status": "error", "message": "Invalid image data"}

        face_bbox = detect_face_bbox(frame, session)
        if not face_bbox:
            return {"status": "error", "message": "Face not detected"}

        x1, y1, x2, y2 = face_bbox
        face_roi = frame[y1:y2, x1:x2]
        resized_face = cv2.resize(face_roi, (100, 100))

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = mesh.process(rgb)
        if result.multi_face_landmarks:
            landmarks = result.multi_face_landmarks[0].landmark
            h, w, _ = frame.shape
            left = np.array([landmarks[468].x * w, landmarks[468].y * h])
            right = np.array([landmarks[473].x * w, landmarks[473].y * h])
            eye_center = ((left + right) / 2).astype(np.float32)

            os.makedirs(os.path.dirname(SAVE_FACE_PATH), exist_ok=True)
            np.save(SAVE_FACE_PATH, resized_face)
            np.save(SAVE_EYE_PATH, eye_center)

            return {"status": "success", "message": f"Face and eye position saved."}
        else:
            return {"status": "error", "message": "Could not find eye landmarks"}

    except Exception as e:
        print(f"Error during face registration: {e}")
        return {"status": "error", "message": str(e)}

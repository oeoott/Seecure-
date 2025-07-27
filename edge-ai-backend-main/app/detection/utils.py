# detection/utils.py

import numpy as np
import cv2
import onnxruntime as ort

YOLO_MODEL_PATH = "models/yolov8n-face.onnx"
INPUT_SIZE = 640

# ONNX 세션 생성
def get_onnx_session():
    return ort.InferenceSession(YOLO_MODEL_PATH)

# 얼굴 탐지 (YOLOv8n-face ONNX)
def detect_faces(onnx_session, frame, conf_threshold=0.7):
    img_resized = cv2.resize(frame, (INPUT_SIZE, INPUT_SIZE))
    img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
    img_norm = img_rgb.astype(np.float32) / 255.0
    img_transposed = np.transpose(img_norm, (2, 0, 1))
    input_tensor = np.expand_dims(img_transposed, axis=0)

    h, w, _ = frame.shape
    scale = (w / INPUT_SIZE, h / INPUT_SIZE)

    outputs = onnx_session.run(None, {onnx_session.get_inputs()[0].name: input_tensor})[0]

    if outputs.ndim == 3:
        outputs = outputs[0]

    boxes = []
    for det in outputs:
        if len(det) < 6:
            continue
        x_c, y_c, bw, bh, conf = det[:5]
        if conf < conf_threshold:
            continue
        x1 = int((x_c - bw / 2) * scale[0])
        y1 = int((y_c - bh / 2) * scale[1])
        x2 = int((x_c + bw / 2) * scale[0])
        y2 = int((y_c + bh / 2) * scale[1])

        # 경계 처리 및 최소 크기 필터링
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w - 1, x2), min(h - 1, y2)
        if (x2 - x1) >= 30 and (y2 - y1) >= 30:
            boxes.append([x1, y1, x2, y2])

    return boxes

# 얼굴 벡터화 (100x100 후 벡터)
def preprocess_face(face_img):
    resized = cv2.resize(face_img, (100, 100)).astype(np.float32)
    return resized.flatten()

# 얼굴 거리 측정
def euclidean_distance(vec1, vec2):
    return np.linalg.norm(vec1 - vec2)

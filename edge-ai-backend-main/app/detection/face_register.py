import cv2
import numpy as np
import os
import onnxruntime as ort

# 경로
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
YOLO_MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "yolov8n-face.onnx")
SAVE_FACE_PATH = os.path.join(BASE_DIR, "..", "models", "user_face.npy")

# 초기화
onnx_session = ort.InferenceSession(YOLO_MODEL_PATH)

def preprocess_for_onnx(img, input_size=640):
    img_resized = cv2.resize(img, (input_size, input_size))
    img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
    img_norm = img_rgb.astype(np.float32) / 255.0
    img_transposed = np.transpose(img_norm, (2, 0, 1))  # CHW
    img_input = np.expand_dims(img_transposed, axis=0)  # NCHW
    return img_input, img.shape[:2]  # (input_tensor, original_shape)

def detect_face_bbox(frame):
    input_tensor, original_shape = preprocess_for_onnx(frame)
    ort_inputs = {onnx_session.get_inputs()[0].name: input_tensor}
    outputs = onnx_session.run(None, ort_inputs)[0]

    boxes = outputs[0]
    h, w = original_shape

    for box in boxes:
        conf = box[4]
        cls_id = int(box[5])
        if conf > 0.5:
            x_center, y_center, bw, bh = box[0:4]
            x1 = int((x_center - bw / 2) * w / 640)
            y1 = int((y_center - bh / 2) * h / 640)
            x2 = int((x_center + bw / 2) * w / 640)
            y2 = int((y_center + bh / 2) * h / 640)
            return x1, y1, x2, y2
    print("[INFO] 얼굴 미탐지 (YOLO 출력 없음)")
    return None

def register_user_face():
    cap = cv2.VideoCapture(0)
    print("[INFO] 얼굴 등록 시작: 얼굴을 정면으로 바라보세요")

    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        face_bbox = detect_face_bbox(frame)
        if not face_bbox:
            cv2.imshow("Face Register", frame)
            if cv2.waitKey(1) & 0xFF == 27:
                break
            continue

        # ROI 추출 및 유효성 검사
        x1, y1, x2, y2 = face_bbox
        h, w, _ = frame.shape
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w, x2), min(h, y2)

        if x2 <= x1 or y2 <= y1:
            print("[WARNING] 잘못된 얼굴 좌표 - 스킵")
            continue

        face_roi = frame[y1:y2, x1:x2]
        if face_roi is None or face_roi.size == 0:
            print("[WARNING] face_roi 비어 있음 - 스킵")
            continue

        resized_face = cv2.resize(face_roi, (100, 100))
        np.save(SAVE_FACE_PATH, resized_face)
        print(f"[완료] 사용자 얼굴 저장됨: {SAVE_FACE_PATH}")
        break

        cv2.imshow("Face Register", frame)
        if cv2.waitKey(1) & 0xFF == 27:
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    register_user_face()

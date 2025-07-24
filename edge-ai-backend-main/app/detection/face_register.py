# detection/face_register.py
import cv2
import numpy as np
import os
import mediapipe as mp
import onnxruntime as ort

# 경로
SAVE_FACE_PATH = "models/user_face.npy"
SAVE_EYE_PATH = "models/user_eye_pos.npy"
YOLO_MODEL_PATH = "models/yolov8n-face.onnx"

# 초기화
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True)
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

    # Postprocessing: outputs shape = (batch, num_boxes, 6)
    boxes = outputs[0]
    h, w = original_shape

    for box in boxes:
        conf = box[4]
        cls_id = int(box[5])
        if conf > 0.5:  # confidence threshold
            x_center, y_center, bw, bh = box[0:4]
            x1 = int((x_center - bw / 2) * w / 640)
            y1 = int((y_center - bh / 2) * h / 640)
            x2 = int((x_center + bw / 2) * w / 640)
            y2 = int((y_center + bh / 2) * h / 640)
            return x1, y1, x2, y2
    return None


def main():
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

        # ROI 추출
        x1, y1, x2, y2 = face_bbox
        face_roi = frame[y1:y2, x1:x2]
        resized_face = cv2.resize(face_roi, (100, 100))

        # 시선 기준점 계산 (MediaPipe)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = face_mesh.process(rgb)
        if result.multi_face_landmarks:
            landmarks = result.multi_face_landmarks[0].landmark
            h, w, _ = frame.shape
            left = np.array([landmarks[468].x * w, landmarks[468].y * h])
            right = np.array([landmarks[473].x * w, landmarks[473].y * h])
            eye_center = ((left + right) / 2).astype(np.float32)

            # 저장
            np.save(SAVE_FACE_PATH, resized_face)
            np.save(SAVE_EYE_PATH, eye_center)

            print(f"[완료] 얼굴과 시선 좌표 저장됨: {eye_center}")
            break

        cv2.imshow("Face Register", frame)
        if cv2.waitKey(1) & 0xFF == 27:
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()

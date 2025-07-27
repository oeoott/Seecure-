import cv2
import numpy as np
import os
import onnxruntime as ort
import time


# 모델 및 경로 설정
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
YOLO_MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "yolov8n-face.onnx")
YOLO_MODEL_PATH = os.path.normpath(YOLO_MODEL_PATH)  # 윈도우 경로 정리

USER_FACE_PATH = os.path.join(BASE_DIR, "..", "models", "user_face.npy")
USER_FACE_PATH = os.path.normpath(USER_FACE_PATH)
INPUT_SIZE = 640

# ONNX 모델 로드
onnx_session = ort.InferenceSession(YOLO_MODEL_PATH)

def load_user_face():
    if not os.path.exists(USER_FACE_PATH):
        print("[ERROR] 사용자 얼굴 데이터가 없습니다. face_register.py를 먼저 실행하세요.")
        exit()
    return np.load(USER_FACE_PATH)

def preprocess_for_onnx(img):
    img_resized = cv2.resize(img, (INPUT_SIZE, INPUT_SIZE))
    img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
    img_norm = img_rgb.astype(np.float32) / 255.0
    img_transposed = np.transpose(img_norm, (2, 0, 1))  # CHW
    img_input = np.expand_dims(img_transposed, axis=0)  # NCHW
    return img_input, img.shape[:2], (img.shape[1] / INPUT_SIZE, img.shape[0] / INPUT_SIZE)

def detect_faces(frame, conf_threshold=0.5):
    input_tensor, original_shape, scale = preprocess_for_onnx(frame)
    ort_inputs = {onnx_session.get_inputs()[0].name: input_tensor}
    outputs = onnx_session.run(None, ort_inputs)[0]

    if outputs.ndim == 3:
        outputs = outputs[0]

    boxes = []
    for det in outputs:
        if len(det) < 6:
            continue

        x_c, y_c, w, h = det[0:4]
        conf = det[4]

        if conf < conf_threshold:
            continue

        x1 = int((x_c - w / 2) * scale[0])
        y1 = int((y_c - h / 2) * scale[1])
        x2 = int((x_c + w / 2) * scale[0])
        y2 = int((y_c + h / 2) * scale[1])

        h_frame, w_frame = original_shape
        x1 = max(0, min(w_frame - 1, x1))
        y1 = max(0, min(h_frame - 1, y1))
        x2 = max(0, min(w_frame - 1, x2))
        y2 = max(0, min(h_frame - 1, y2))

        if (x2 - x1) < 30 or (y2 - y1) < 30:
            continue

        boxes.append([x1, y1, x2, y2])

    return boxes

def detect_intrusion(frame):
    user_face = load_user_face()
    boxes = detect_faces(frame)

    user_found = False
    intruder_found = False

    diffs = []

    for box in boxes:
        x1, y1, x2, y2 = box
        cropped = frame[y1:y2, x1:x2]
        if cropped.size == 0:
            continue

        try:
            face_resized = cv2.resize(cropped, (100, 100)).astype("float32")
        except:
            continue

        diff = np.mean(np.abs(user_face.astype("float32") - face_resized))
        diffs.append((diff, box))

        if not diffs:
            return False

        #사용자로 가장 유사한 얼굴 하나 선택
        diffs.sort(key=lambda x: x[0]) # 오름차순
        best_match_diff, best_Box = diffs[0]

        if diff < 50:
            user_found = True
        else:
            intruder_found = True

        # 시각화
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(frame, f"diff: {diff:.1f}", (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)

    if user_found and intruder_found:
        return True
    elif not user_found and intruder_found:
        return True
    else:
        return False

def main():
    print("[INFO] 침입자 감지 시스템 시작 (ESC로 종료)")
    cap = cv2.VideoCapture(0)
    last_log_time = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        current_time = time.time()
        if current_time - last_log_time >= 2.0:
            face_count = len(detect_faces(frame))
            if face_count == 0:
                print("[DEBUG] 감지된 얼굴 없음")
            else: 
                intrusion = detect_intrusion(frame)
                if intrusion:
                    print("[경고] 타인 감지됨")
                else:
                    print("[정상] 사용자만 탐지됨")
                print(f"[DEBUG] 감지된 얼굴 수: {face_count}")
            last_log_time = current_time

        cv2.imshow("Intrusion Detection", frame)
        if cv2.waitKey(1) & 0xFF == 27:
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()

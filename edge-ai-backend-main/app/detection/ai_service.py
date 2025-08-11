# edge-ai-backend-main/app/detection/ai_service.py

import cv2
import numpy as np
import os
import onnxruntime as ort

class AIService:
    def __init__(self):
        # --- 경로 및 상수 설정 ---
        base_dir = os.path.dirname(os.path.abspath(__file__))
        models_dir = os.path.join(base_dir, "..", "models")
        
        yolo_path = os.path.abspath(os.path.join(models_dir, "yolov8n-face.onnx"))
        arcface_path = os.path.abspath(os.path.join(models_dir, "arcface.onnx"))
        landmark_path = os.path.abspath(os.path.join(models_dir, "lbfmodel.onnx"))
        self.embedding_path = os.path.abspath(os.path.join(models_dir, "user_face_embedding.npy"))

        self.similarity_threshold = 0.45
        self.gaze_threshold = 0.15

        # --- 모델 로딩 ---
        print("[INFO] AI 모델을 로딩합니다...")
        self.yolo_session = ort.InferenceSession(yolo_path)
        self.arcface_session = ort.InferenceSession(arcface_path)
        self.landmark_session = ort.InferenceSession(landmark_path)
        self.user_embedding = self._load_user_embedding()
        print("[INFO] AI 모델 로딩 완료.")

    def _load_user_embedding(self):
        if os.path.exists(self.embedding_path):
            print(f"[INFO] 등록된 사용자 얼굴 임베딩을 로드합니다: {self.embedding_path}")
            return np.load(self.embedding_path)
        print("[WARNING] 등록된 사용자 얼굴이 없습니다.")
        return None

    def _preprocess_yolo(self, img, input_size=640):
        # ... (이전 코드와 동일, 클래스 메소드로 변경)
        img_resized = cv2.resize(img, (input_size, input_size))
        img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
        img_norm = img_rgb.astype(np.float32) / 255.0
        img_transposed = np.transpose(img_norm, (2, 0, 1))
        return np.expand_dims(img_transposed, axis=0)

    def _get_face_embedding(self, face_roi):
        # ... (이전 코드와 동일, 클래스 메소드로 변경)
        face_resized = cv2.resize(face_roi, (112, 112))
        face_rgb = cv2.cvtColor(face_resized, cv2.COLOR_BGR2RGB)
        face_norm = (face_rgb.astype(np.float32) - 127.5) / 128.0
        face_transposed = np.transpose(face_norm, (2, 0, 1))
        input_tensor = np.expand_dims(face_transposed, axis=0)
        embedding = self.arcface_session.run(None, {self.arcface_session.get_inputs()[0].name: input_tensor})[0]
        return embedding / np.linalg.norm(embedding)

    def _cosine_similarity(self, vec1, vec2):
        # ... (이전 코드와 동일)
        return np.dot(vec1, vec2.T) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

    def _detect_faces(self, frame, single_face=False):
        # ... (얼굴 탐지 로직 통합)
        input_tensor = self._preprocess_yolo(frame)
        h_orig, w_orig = frame.shape[:2]
        outputs = self.yolo_session.run(None, {self.yolo_session.get_inputs()[0].name: input_tensor})[0][0]
        
        boxes = []
        max_conf = 0.5
        best_box = None

        for box_data in outputs:
            conf = box_data[4]
            if conf > max_conf:
                x_c, y_c, w, h = box_data[0:4]
                x1 = int((x_c - w / 2) * w_orig / 640)
                y1 = int((y_c - h / 2) * h_orig / 640)
                x2 = int((x_c + w / 2) * w_orig / 640)
                y2 = int((y_c + h / 2) * h_orig / 640)
                
                if single_face:
                    max_conf = conf
                    best_box = [x1, y1, x2, y2]
                else:
                    boxes.append([x1, y1, x2, y2])
        
        return best_box if single_face else boxes

    def _get_landmarks_and_gaze(self, face_roi, frame_gray, box):
        # ... (시선 감지 로직)
        try:
            # 랜드마크 추출
            gray_face = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
            resized_face = cv2.resize(gray_face, (460, 460))
            input_tensor = resized_face.astype(np.float32)[np.newaxis, np.newaxis, :, :]
            landmarks = self.landmark_session.run(None, {self.landmark_session.get_inputs()[0].name: input_tensor})[0][0]
            landmarks = landmarks * np.array([face_roi.shape[1], face_roi.shape[0]])

            # 시선 계산
            left_eye_pts, right_eye_pts = landmarks[36:42], landmarks[42:48]
            
            # ... (calculate_gaze_ratio 로직 통합)
            def _calculate_gaze(eye_points, f_gray, face_bbox):
                x_start, y_start, _, _ = face_bbox
                region = np.array(eye_points, dtype=np.int32)
                min_x, max_x = np.min(region[:, 0]) + x_start, np.max(region[:, 0]) + x_start
                min_y, max_y = np.min(region[:, 1]) + y_start, np.max(region[:, 1]) + y_start
                eye_roi = f_gray[min_y:max_y, min_x:max_x]
                if eye_roi.size == 0: return None
                _, threshold_eye = cv2.threshold(eye_roi, 50, 255, cv2.THRESH_BINARY_INV)
                moments = cv2.moments(threshold_eye)
                if moments['m00'] == 0: return None
                cx = int(moments['m10'] / moments['m00'])
                eye_width = max_x - min_x
                return (cx / eye_width) if eye_width > 0 else 0.5

            gaze_left = _calculate_gaze(left_eye_pts, frame_gray, box)
            gaze_right = _calculate_gaze(right_eye_pts, frame_gray, box)
            
            if gaze_left is not None and gaze_right is not None:
                avg_gaze = (gaze_left + gaze_right) / 2.0
                return self.gaze_threshold < avg_gaze < (1 - self.gaze_threshold)
        except Exception:
            return False
        return False

    # --- API가 호출할 외부 공개 함수 ---

    def register_face(self, frame: np.ndarray) -> bool:
        """한 프레임을 받아 얼굴을 등록하고 성공 여부를 반환"""
        box = self._detect_faces(frame, single_face=True)
        if box:
            x1, y1, x2, y2 = [max(0, val) for val in box]
            if x2 > x1 and y2 > y1:
                face_roi = frame[y1:y2, x1:x2]
                embedding = self._get_face_embedding(face_roi)
                np.save(self.embedding_path, embedding)
                self.user_embedding = embedding # 메모리에도 즉시 업데이트
                print("[SUCCESS] 새 사용자 얼굴이 등록되었습니다.")
                return True
        return False

    
    # 침입자 감지 로직
    def detect_intrusion(self, frame: np.ndarray) -> dict:
        """한 프레임을 받아 침입자 존재 여부를 판단하여 결과를 반환"""
        if self.user_embedding is None:
            return {"error": "User face not registered."}

        boxes = self._detect_faces(frame)
        intruder_alert = False

        # 프레임에 탐지된 얼굴이 한 명이라도 있는지 확인
        if not boxes:
            # 아무도 없으면 사용자가 자리를 비운 것이므로 침입자가 아님
            return {"intruder_alert": False}

        # 탐지된 모든 얼굴에 대해 확인
        for box in boxes:
            x1, y1, x2, y2 = [max(0, val) for val in box]
            if x2 <= x1 or y2 <= y1: continue
            
            face_roi = frame[y1:y2, x1:x2]
            current_embedding = self._get_face_embedding(face_roi)
            sim = self._cosine_similarity(self.user_embedding, current_embedding)[0][0]
            
            # 🔽 유사도가 임계값보다 낮으면 '침입자'로 간주
            if sim < self.similarity_threshold:
                intruder_alert = True
                # 침입자를 한 명이라도 찾으면 더 이상 확인할 필요 없이 반복 종료
                break 
        
        # 🔽 최종적으로 침입자 발견 여부만 반환
        return {"intruder_alert": intruder_alert}

# app/detection/gaze_tracker.py

import cv2
import numpy as np
import os
import time
from typing import Optional, Tuple

# --- 지연 로딩을 위한 전역 변수 ---
_face_mesh = None
_tracker_instances = {} # 사용자별 GazeTracker 인스턴스 저장

def get_face_mesh_instance():
    """MediaPipe Face Mesh를 지연 로딩하여 반환합니다."""
    global _face_mesh
    if _face_mesh is None:
        print("[INFO] Loading MediaPipe Face Mesh for gaze tracking...")
        import mediapipe as mp
        _face_mesh = mp.solutions.face_mesh.FaceMesh(refine_landmarks=True)
    return _face_mesh

# --- 로직을 클래스로 캡슐화 ---
class GazeTracker:
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.ref_point = None
        self.ref_vec = None
        self.face_mesh = get_face_mesh_instance()

        user_data_dir = f"app/models/{self.user_id}"
        ref_path = os.path.join(user_data_dir, "user_eye_pos.npy")

        if os.path.exists(ref_path):
            self.ref_point = np.load(ref_path)
        else:
            print(f"[WARN] User {user_id}: Gaze reference point not found.")

    def get_eye_center_and_vector(self, landmarks, image_shape):
        h, w = image_shape[:2]
        # MediaPipe v0.9+ iris landmark indices
        left_iris_idx, right_iris_idx = 473, 468
        
        left = np.array([landmarks[left_iris_idx].x * w, landmarks[left_iris_idx].y * h])
        right = np.array([landmarks[right_iris_idx].x * w, landmarks[right_iris_idx].y * h])
        
        eye_center = (left + right) / 2
        nose = np.array([landmarks[1].x * w, landmarks[1].y * h])
        gaze_vector = eye_center - nose
        return eye_center, gaze_vector, nose

    def is_gaze_forward(self, landmarks, image_shape, angle_threshold=25):
        if self.ref_point is None:
            return False, "No reference"

        eye_center, current_vec, nose = self.get_eye_center_and_vector(landmarks, image_shape)
        
        if self.ref_vec is None:
            self.ref_vec = self.ref_point - nose

        if np.linalg.norm(current_vec) == 0 or np.linalg.norm(self.ref_vec) == 0:
            return False, "Zero vector"

        cos_theta = np.dot(self.ref_vec, current_vec) / (np.linalg.norm(self.ref_vec) * np.linalg.norm(current_vec))
        angle = np.degrees(np.arccos(np.clip(cos_theta, -1.0, 1.0)))
        
        return angle < angle_threshold, f"Angle: {angle:.1f}"


# --- API가 호출할 최종 함수 ---
def analyze_frame_for_gaze(image_bytes: bytes, user_id: str) -> str:
    """
    이미지 바이트와 사용자 ID를 받아 시선 및 침입 상태를 분석하고 결과를 문자열로 반환합니다.
    """
    global _tracker_instances
    from app.detection.intrusion_detector import detect_intrusion # 지연 임포트

    if user_id not in _tracker_instances:
        _tracker_instances[user_id] = GazeTracker(user_id)
    
    tracker = _tracker_instances[user_id]
    
    frame = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
    if frame is None:
        return "decoding_error"

    # 1. 타인(침입자) 감지
    is_intrusion, num_faces = detect_intrusion(frame, user_id)

    # 2. 시선 추적
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = tracker.face_mesh.process(rgb_frame)
    
    user_present = False
    gaze_forward = False

    if results.multi_face_landmarks:
        # 이 예제에서는 가장 큰 얼굴을 사용자로 가정하거나,
        # 얼굴 비교 로직을 추가하여 실제 사용자를 식별해야 합니다.
        # 지금은 첫 번째 감지된 얼굴을 기준으로 합니다.
        user_present = True
        landmarks = results.multi_face_landmarks[0].landmark
        gaze_forward, reason = tracker.is_gaze_forward(landmarks, frame.shape)

    # 3. 최종 상태 결정
    if is_intrusion:
        return "intrusion_detected" # 타인이 있으면 최우선으로 알림
    if not user_present and num_faces == 0:
        return "no_one_detected" # 아무도 없으면
    if not gaze_forward:
        return "gaze_distracted" # 사용자는 있지만 시선이 이탈한 경우
    
    return "user_focused" # 사용자가 정면을 보고 있는 정상 상태

# app/detection/gaze_tracker.py

import cv2
import mediapipe as mp
import numpy as np
import os

class GazeTracker:
    def __init__(self):
        # MediaPipe FaceMesh 초기화
        self.face_mesh = mp.solutions.face_mesh.FaceMesh(refine_landmarks=True)
        self.ref_point = None # 사용자의 기준 눈 좌표
        self.ref_vec = None   # 사용자의 기준 시선 벡터

    def load_reference_point(self, ref_path):
        """사용자의 기준 눈 좌표 파일을 로드합니다."""
        if os.path.exists(ref_path):
            self.ref_point = np.load(ref_path)
            self.ref_vec = None  # 기준점이 바뀌었으므로 벡터는 다시 계산해야 함
            return True
        print(f"[경고] 기준 시선 좌표 파일 없음: {ref_path}")
        return False

    def get_eye_center_and_vector(self, landmarks, image_shape):
        """랜드마크로부터 눈 중심, 코, 시선 벡터를 계산합니다."""
        h, w = image_shape[:2]
        # 왼쪽, 오른쪽 눈동자 랜드마크 (473, 468)
        left_iris = np.array([landmarks[473].x * w, landmarks[473].y * h])
        right_iris = np.array([landmarks[468].x * w, landmarks[468].y * h])
        eye_center = (left_iris + right_iris) / 2
        
        # 코 랜드마크 (1)
        nose = np.array([landmarks[1].x * w, landmarks[1].y * h])
        gaze_vector = eye_center - nose
        return eye_center, gaze_vector, nose

    def is_gaze_within_angle(self, current_vec, angle_threshold=25):
        """기준 벡터와 현재 벡터 사이의 각도가 임계값 이내인지 확인합니다."""
        if self.ref_vec is None or np.linalg.norm(current_vec) == 0 or np.linalg.norm(self.ref_vec) == 0:
            return False
        
        cos_theta = np.dot(self.ref_vec, current_vec) / (np.linalg.norm(self.ref_vec) * np.linalg.norm(current_vec))
        angle = np.degrees(np.arccos(np.clip(cos_theta, -1.0, 1.0)))
        return angle < angle_threshold

    def get_gaze_ratio(self, landmarks, w, h, eye="left"):
        """눈동자의 가로 위치 비율을 계산합니다."""
        if eye == "left":
            # 왼쪽 눈 양쪽 끝점 (33, 133), 눈동자 (468)
            # ⭐️ 수정: y좌표 계산 시 너비(w)가 아닌 높이(h)를 사용하도록 변경
            left_corner = np.array([landmarks[33].x * w, landmarks[33].y * h])
            right_corner = np.array([landmarks[133].x * w, landmarks[133].y * h])
            iris = np.array([landmarks[468].x * w, landmarks[468].y * h])
        else:
            # 오른쪽 눈 양쪽 끝점 (362, 263), 눈동자 (473)
            # ⭐️ 수정: y좌표 계산 시 너비(w)가 아닌 높이(h)를 사용하도록 변경
            left_corner = np.array([landmarks[362].x * w, landmarks[362].y * h])
            right_corner = np.array([landmarks[263].x * w, landmarks[263].y * h])
            iris = np.array([landmarks[473].x * w, landmarks[473].y * h])

        eye_width = np.linalg.norm(right_corner - left_corner)
        iris_offset = np.linalg.norm(iris - left_corner)
        ratio = iris_offset / (eye_width + 1e-6) # 0으로 나누는 것을 방지
        return ratio

    def is_gaze_forward_ratio(self, left_ratio, right_ratio, low=0.35, high=0.65):
        """양쪽 눈의 위치 비율이 정상 범위(정면)에 있는지 확인합니다."""
        avg_ratio = (left_ratio + right_ratio) / 2
        return low <= avg_ratio <= high

    def is_head_tilted_updown(self, landmarks, image_shape, y_threshold=20):
        """고개가 상하로 과도하게 기울어졌는지 확인합니다."""
        h, w = image_shape[:2]
        forehead = np.array([landmarks[10].x * w, landmarks[10].y * h]) # 이마
        chin = np.array([landmarks[152].x * w, landmarks[152].y * h])   # 턱
        vertical_vec = chin - forehead

        if np.linalg.norm(vertical_vec) == 0: return False
        
        angle = np.degrees(np.arctan2(vertical_vec[1], vertical_vec[0]))
        # 정면일 때 약 90도이므로, 여기서 많이 벗어났는지 확인
        return abs(angle - 90) > y_threshold

    def track_gaze(self, frame, ref_path):
        """API에서 호출할 메인 분석 함수. 정면을 응시하면 True를 반환합니다."""
        if self.ref_point is None:
            if not self.load_reference_point(ref_path):
                return False  # 기준점이 없으면 추적 불가

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = self.face_mesh.process(rgb)

        if result.multi_face_landmarks:
            landmarks = result.multi_face_landmarks[0].landmark
            h, w, _ = frame.shape

            # 1. 시선 벡터 계산
            eye_center, gaze_vec, nose = self.get_eye_center_and_vector(landmarks, frame.shape)
            if self.ref_vec is None: # 기준 벡터가 없으면 현재 코 위치 기준으로 생성
                self.ref_vec = self.ref_point - nose
            is_forward_vec = self.is_gaze_within_angle(gaze_vec)

            # 2. 눈동자 위치 비율 계산
            # ⭐️ 수정: 높이(h) 값을 get_gaze_ratio 함수에 전달
            left_ratio = self.get_gaze_ratio(landmarks, w, h, eye="left")
            right_ratio = self.get_gaze_ratio(landmarks, w, h, eye="right")
            is_forward_ratio = self.is_gaze_forward_ratio(left_ratio, right_ratio)
            
            # 3. 고개 기울기 계산
            is_tilted = self.is_head_tilted_updown(landmarks, frame.shape)

            # 모든 조건을 만족해야 정면 응시로 판단
            is_forward = is_forward_vec and is_forward_ratio and not is_tilted
            return is_forward
        
        return False # 얼굴이 감지되지 않음

# detection/gaze_tracker.py
import numpy as np
import os
# 🔽 intrusion_detector의 함수를 직접 import하지 않습니다.
# from app.detection.intrusion_detector import detect_intrusion

# 🔽 모델을 전역 변수로 선언만 해둡니다. (Lazy Loading)
face_mesh = None

def get_face_mesh():
    """MediaPipe FaceMesh 모델을 필요할 때 딱 한 번만 로드하는 함수"""
    import mediapipe as mp
    global face_mesh
    if face_mesh is None:
        print("[INFO] Loading MediaPipe Face Mesh for gaze tracking...")
        mp_face_mesh = mp.solutions.face_mesh
        face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True)
    return face_mesh

def get_gaze_status(frame, user_face_path: str, gaze_ref_path: str):
    """API로부터 받은 이미지 프레임으로 시선 및 침입 상태를 분석하는 함수"""
    import cv2
    # 🔽 함수 내부에서 import 합니다.
    from app.detection.intrusion_detector import detect_intrusion

    try:
        mesh = get_face_mesh() # 🔽 API가 호출될 때 모델 로드
        ref_point = np.load(gaze_ref_path) if os.path.exists(gaze_ref_path) else None

        intrusion = detect_intrusion(frame, user_face_path)
        
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = mesh.process(rgb_frame)

        # 얼굴이 감지되지 않았을 때의 처리
        if not results.multi_face_landmarks:
            # 침입자가 있다면 침입 상태 반환, 없다면 얼굴 없음 상태 반환
            return "INTRUSION_DETECTED" if intrusion else "NO_FACE_DETECTED", intrusion

        landmarks = results.multi_face_landmarks[0].landmark
        h, w, _ = frame.shape
        
        # 시선 계산
        left_iris_pos = (landmarks[473].x * w, landmarks[473].y * h)
        right_iris_pos = (landmarks[468].x * w, landmarks[468].y * h)
        eye_center = (np.array(left_iris_pos) + np.array(right_iris_pos)) / 2
        
        is_gaze_forward = True # 기본값을 True로 설정
        if ref_point is not None:
            distance = np.linalg.norm(eye_center - ref_point)
            if distance > 30: 
                is_gaze_forward = False

        # 최종 상태 결정
        if intrusion:
            return "INTRUSION_DETECTED", True
        elif not is_gaze_forward:
            return "GAZE_AWAY", False
        else:
            return "USER_FOCUSED", False
            
    except Exception as e:
        print(f"Error during gaze tracking: {e}")
        return "ERROR", False

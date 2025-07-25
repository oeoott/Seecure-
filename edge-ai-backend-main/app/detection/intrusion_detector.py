# app/detection/intrusion_detector.py

import os
import numpy as np

# --- 🔽 라이브러리들을 함수 내부로 옮겨 지연 로딩을 유지합니다 ---

def get_user_face(user_face_path):
    """사용자 얼굴 데이터를 불러옵니다."""
    try:
        if not os.path.exists(user_face_path):
            return None
        return np.load(user_face_path)
    except Exception as e:
        print(f"[ERROR] 사용자 얼굴 데이터 로딩 실패: {e}")
        return None

def is_same_person(face1_gray, face2_gray, threshold=55):
    """두 흑백 얼굴 이미지가 동일인물인지 비교합니다."""
    if face1_gray is None or face2_gray is None:
        return False
    
    # 두 이미지의 크기가 같은지 확인하고, 다르면 face2_gray를 face1_gray 크기에 맞게 조절
    if face1_gray.shape != face2_gray.shape:
        face2_gray = __import__('cv2').resize(face2_gray, (face1_gray.shape[1], face1_gray.shape[0]))

    diff = np.mean(np.abs(face1_gray.astype("float32") - face2_gray.astype("float32")))
    return diff < threshold

def detect_intrusion(image_bytes, user_face_path):
    """
    웹캠 프레임에서 침입자를 감지합니다.
    등록되지 않은 얼굴이 한 명이라도 있으면 침입으로 간주합니다.
    """
    cv2 = __import__('cv2')
    from app.detection.utils import get_onnx_session, detect_faces

    try:
        user_face = get_user_face(user_face_path)
        if user_face is None:
            # 등록된 얼굴이 없으면 침입 판단을 할 수 없으므로 정상 처리
            return {"intrusion_detected": False, "status": "User face not registered"}

        # 이미지를 디코딩하여 OpenCV 형식으로 변환
        np_arr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if frame is None:
            return {"intrusion_detected": False, "status": "Invalid image frame"}

        onnx_session = get_onnx_session()
        boxes = detect_faces(onnx_session, frame)

        # 1. 아무 얼굴도 감지되지 않으면 정상
        if not boxes:
            return {"intrusion_detected": False, "status": "No face detected"}

        # 2. 감지된 모든 얼굴을 검사
        for box in boxes:
            x1, y1, x2, y2 = box
            cropped_face = frame[y1:y2, x1:x2]

            if cropped_face.size == 0:
                continue

            # 비교를 위해 흑백으로 변환
            cropped_face_gray = cv2.cvtColor(cropped_face, cv2.COLOR_BGR2GRAY)
            
            # --- 🔽 핵심 로직: 등록된 얼굴과 다른 사람이 한 명이라도 있는가? ---
            if not is_same_person(user_face, cropped_face_gray):
                # 등록되지 않은 얼굴을 발견했으므로 즉시 "침입"으로 판단하고 종료
                return {"intrusion_detected": True, "status": "Intrusion detected"}

        # 3. 루프가 모두 끝났다면, 감지된 모든 얼굴이 등록된 사용자였음을 의미 -> 정상
        return {"intrusion_detected": False, "status": "User verified"}

    except Exception as e:
        print(f"[ERROR] Exception in detect_intrusion: {e}")
        # 예외 발생 시 안전하게 "정상"으로 처리
        return {"intrusion_detected": False, "status": f"Error: {e}"}

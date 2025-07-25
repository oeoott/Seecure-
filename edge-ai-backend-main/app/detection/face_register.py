# app/detection/face_register.py

import os
import numpy as np

def register_user_face(image_bytes, user_face_path):
    """
    웹캠 이미지에서 얼굴을 감지하고, 가장 큰 얼굴을 흑백으로 저장합니다.
    """
    cv2 = __import__('cv2')
    # --- 🔽 얼굴 감지 함수를 utils.py에서 가져오도록 수정 ---
    from app.detection.utils import get_onnx_session, detect_faces

    try:
        # 이미지를 디코딩하여 OpenCV 형식으로 변환
        np_arr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if frame is None:
            return False, "유효하지 않은 이미지 파일입니다."

        onnx_session = get_onnx_session()
        boxes = detect_faces(onnx_session, frame)

        if not boxes:
            return False, "사진에서 얼굴을 찾지 못했습니다. 더 밝은 곳에서 정면을 바라보고 다시 시도해주세요."

        # 가장 큰 얼굴을 찾습니다.
        best_box = max(boxes, key=lambda box: (box[2] - box[0]) * (box[3] - box[1]))
        x1, y1, x2, y2 = best_box
        
        # 얼굴 영역 자르기
        cropped_face = frame[y1:y2, x1:x2]

        if cropped_face.size == 0:
            return False, "얼굴 영역이 너무 작거나 프레임 가장자리에 있습니다. 중앙에서 다시 시도해주세요."
        
        # 비교를 위해 흑백으로 변환하고 100x100으로 크기 조절
        gray_face = cv2.cvtColor(cropped_face, cv2.COLOR_BGR2GRAY)
        resized_face = cv2.resize(gray_face, (100, 100))

        # 사용자 얼굴 데이터 저장
        np.save(user_face_path, resized_face)
        
        return True, "얼굴이 성공적으로 등록되었습니다."

    except Exception as e:
        # 예외 발생 시 로그를 남기고 실패 메시지를 반환
        print(f"[ERROR] Exception in register_user_face: {e}")
        return False, f"얼굴 등록 중 오류 발생: {e}"

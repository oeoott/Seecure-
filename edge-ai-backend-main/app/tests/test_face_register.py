import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from detection.face_register import register_user_face as face_register_main

def test_face_registration():
    print("[TEST] 얼굴 등록 테스트 시작")

    # 사전 확인: 모델 파일 존재 여부
    yolo_model_path = "models/yolov8n-face.onnx"
    if not os.path.exists(yolo_model_path):
        print(f"[ERROR] YOLO 모델 파일이 존재하지 않습니다: {yolo_model_path}")
        return

    face_register_main()
    
    # 결과 파일 확인
    if os.path.exists("models/user_face.npy"):
        print("[TEST 완료] 얼굴 이미지 및 시선 좌표가 성공적으로 저장되었습니다.")
    else:
        print("[ERROR] 결과 파일이 생성되지 않았습니다.")

if __name__ == "__main__":
    test_face_registration()

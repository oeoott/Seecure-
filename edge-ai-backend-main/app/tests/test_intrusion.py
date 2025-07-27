# test_intrusion.py
import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from detection.intrusion_detector import main as intrusion_main

def test_intrusion_detection():
    print("[TEST] 침입자 감지 테스트 시작")
    intrusion_main()

if __name__ == "__main__":
    test_intrusion_detection()

# scripts/train.py
import torch
from app.scripts.my_model import Net  # 여러분 모델 정의 모듈

def main():
    # 1) 데이터 로드 (예: torch.utils.data.Dataset)
    # 2) 모델·옵티마이저 선언
    model = Net()
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
    # 3) 학습 루프
    for epoch in range(10):
        # train_step(...)
        pass
    # 4) 가중치 저장
    torch.save(model.state_dict(), "models/pth/latest.pth")
    print("Training done.")

if __name__ == "__main__":
    main()

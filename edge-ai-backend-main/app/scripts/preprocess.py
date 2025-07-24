# scripts/preprocess.py
import pandas as pd

def main():
    # TODO: 실제 데이터 경로·칼럼에 맞게 수정
    df = pd.read_csv("data/raw/data.csv")
    # 예: 결측치 제거
    df = df.dropna()
    df.to_csv("data/processed/data.csv", index=False)
    print("Preprocessing done.")

if __name__ == "__main__":
    main()

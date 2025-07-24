import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 🔽 데이터베이스 연결 URL의 비밀번호를 '0425'로 수정했습니다.
# 🔽 사용자 이름도 기본값인 'postgres'로 변경했습니다.
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:0425@localhost:5432/edgeai")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

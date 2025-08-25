# app/database.py

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# DB 연결 URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:0425@localhost:5432/edgeai")

# 엔진/세션/베이스
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    # DB 세션 제공
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

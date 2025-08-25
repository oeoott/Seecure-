# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
import app.models as models

import app.routers.auth as auth
import app.routers.faces as faces
import app.routers.protections as protections
import app.routers.ai as ai

# 테이블 생성
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SeeCure Backend")

# CORS 설정
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(faces.router, prefix="/api/v1/faces", tags=["faces"])
app.include_router(protections.router, prefix="/api/v1/protections", tags=["protections"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])

@app.get("/", tags=["health"])
def health_check():
    # 상태 체크
    return {"status": "OK"}

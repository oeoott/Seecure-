# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 🔽 데이터베이스 테이블 생성을 위한 import 추가
from app.database import engine
import app.models as models

# 라우터들을 import합니다.
import app.routers.auth as auth
import app.routers.faces as faces
import app.routers.protections as protections
import app.routers.ai as ai

# 🔽 서버가 시작될 때 모든 테이블을 생성합니다.
models.Base.metadata.create_all(bind=engine)


app = FastAPI(title="SeeCure Backend")

# CORS 미들웨어 설정을 추가합니다.
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- 라우터 등록 ---
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(faces.router, prefix="/api/v1/faces", tags=["faces"])
app.include_router(protections.router, prefix="/api/v1/protections", tags=["protections"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])


@app.get("/", tags=["health"])
def health_check():
    return {"status": "OK"}

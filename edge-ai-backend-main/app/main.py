# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.routers.auth as auth
import app.routers.faces as faces
import app.routers.protections as protections
import app.routers.events as events
import app.routers.jobs as jobs
import app.routers.models as models_api
import app.routers.inference as inference
import app.routers.ai as ai  # ⭐️ AI 라우터 import

app = FastAPI(title="SeeCure Backend")

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ... 기존 라우터들 ...
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(protections.router, prefix="/api/v1/protections", tags=["protections"])
app.include_router(faces.router, prefix="/api/v1/faces", tags=["faces"])
app.include_router(events.router, prefix="/api/v1/events", tags=["events"])
app.include_router(jobs.router, prefix="/api/v1/jobs", tags=["jobs"])
app.include_router(models_api.router, prefix="/api/v1/models", tags=["models"])
app.include_router(inference.router, prefix="/api/v1/inference", tags=["inference"])
app.include_router(ai.router, tags=["ai"]) # ⭐️ AI 라우터 추가

@app.get("/", tags=["health"])
def health_check():
    return {"status": "OK"}

# app/detection/ai_service_insightface.py
import os, json, cv2, numpy as np
from insightface.app import FaceAnalysis

class AIService:
    def __init__(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        models_dir = os.path.join(base_dir, "..", "models")
        os.makedirs(models_dir, exist_ok=True)
        self.embedding_path = os.path.abspath(os.path.join(models_dir, "user_face_embedding.npy"))

        # --- 임계치(코사인 유사도, 클수록 동일) ---
        self.similarity_threshold = 0.45

        # --- EP 우선순위(QNN → DirectML → CPU) ---
        providers = []
        try:
            import onnxruntime as ort  # noqa
            if "QNNExecutionProvider" in ort.get_available_providers():
                providers.append("QNNExecutionProvider")
            if "DmlExecutionProvider" in ort.get_available_providers():
                providers.append("DmlExecutionProvider")
        except Exception:
            pass
        providers += ["CPUExecutionProvider"]
        self.providers = providers

        # --- InsightFace 로드 (SCRFD + ArcFace) ---
        #  - buffalo_s: 경량/빠름, buffalo_l: 정확도↑
        self.app = FaceAnalysis(name="buffalo_s", providers=self.providers)
        self.app.prepare(ctx_id=0, det_size=(640, 640))

        self.user_embedding = self._load_user_embedding()
        print("[INFO] Providers in use (priority):", self.providers)

    def _load_user_embedding(self):
        if os.path.exists(self.embedding_path):
            emb = np.load(self.embedding_path)
            if emb.ndim > 1: emb = emb.reshape(-1)
            n = np.linalg.norm(emb)
            if n > 0: emb = emb / n
            return emb.astype(np.float32)
        print("[WARNING] 등록된 사용자 얼굴 임베딩이 없습니다.")
        return None

    def register_face(self, frame: np.ndarray) -> bool:
        faces = self.app.get(frame)
        if not faces: return False
        f = max(faces, key=lambda x: (x.bbox[2]-x.bbox[0])*(x.bbox[3]-x.bbox[1]))
        emb = f.normed_embedding.astype(np.float32)  # (512,) L2-normalized
        np.save(self.embedding_path, emb)
        self.user_embedding = emb
        print("[SUCCESS] 새 사용자 얼굴 등록 완료")
        return True

    @staticmethod
    def _cos(a: np.ndarray, b: np.ndarray) -> float:
        return float(np.dot(a, b))  # 둘 다 L2정규화

    def detect_intrusion(self, frame: np.ndarray) -> dict:
        if self.user_embedding is None:
            print("[WARN] No registered user embedding. Call /register-face first.")
            return {"error": "User face not registered."}

        faces = self.app.get(frame)
        if not faces:
            print("[INFO] No face detected in this frame.")
            return {"intruder_alert": False}

        print(f"[DEBUG] Faces detected: {len(faces)} (threshold={self.similarity_threshold:.2f})")
        for idx, f in enumerate(faces):
            sim = self._cos(self.user_embedding, f.normed_embedding.astype(np.float32))
            print(f"[DEBUG] face#{idx} similarity={sim:.4f}")

            if sim < self.similarity_threshold:
                print(f"[ALERT] Intruder detected! (similarity={sim:.4f} < {self.similarity_threshold:.2f})")
                return {"intruder_alert": True}

        print("[INFO] Registered user detected only. (no intruders)")
        return {"intruder_alert": False}



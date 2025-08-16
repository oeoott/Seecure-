import insightface

# buffalo_s 모델 로드 (얼굴 인식 기본 모델)
model = insightface.app.FaceAnalysis(name="buffalo_s")
model.prepare(ctx_id=0)  # CPU 사용. GPU라면 ctx_id=0 그대로, CPU만 쓰려면 ctx_id=-1
print("모델 로드 완료")

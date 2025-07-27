# SeeCure: AI 기반 실시간 화면 정보 보호 솔루션

![SeeCure Logo](https://placehold.co/600x150/054071/FFFFFF?text=SeeCure&font=inter)

**SeeCure**는 공공장소나 사무실 등 개방된 환경에서 사용자의 민감한 정보가 타인에게 노출되는 것을 방지하는 지능형 보안 솔루션입니다. 웹캠과 AI 얼굴 인식 기술을 활용하여, 등록되지 않은 사용자의 얼굴이 인식될 경우 실시간으로 화면 보호 조치(블러, 경고 팝업)를 실행합니다.

---

## 팀원 정보

| 이름 | 역할 | 이메일 주소 | 퀄컴 ID |
| :--- | :--- | :--- | :--- |
| 오지원 | 팀 대표, 데이터 베이스 구조, 백엔드 개발 | ojiwon58@gmail.com | ohjiwon3@naver.com |
| 구나은 | 프론트엔드 개발, UI/UX | 1002naeun@gmail.com | 1002naeun@gmail.com |
| 임수정 | 프론트엔드 개발, UI/UX | asdlatnwjd@gmail.com | Asdlatnwjd@gmail.com |
| 이연우 | AI 모델 개발 | kiterainlee@gmail.com | kiterainlee@gmail.com |

---

## 시스템 아키텍처

SeeCure는 웹 대시보드, 백엔드 서버, 그리고 브라우저 확장 프로그램이 유기적으로 연동되어 동작합니다.

```
┌──────────────────────────┐      ┌──────────────────────────┐
│     사용자 웹 브라우저     │      │   SeeCure 백엔드 서버    │
├──────────────────────────┤      ├──────────────────────────┤
│                          │      │                          │
│ ┌──────────────────────┐ │      │ ┌──────────────────────┐ │
│ │  Web Dashboard (설정)  ├───────>│     FastAPI / API    │ │
│ └──────────────────────┘ │      │ └──────────┬───────────┘ │
│                          │      │            │             │
│ ┌──────────────────────┐ │      │ ┌──────────┴───────────┐ │
│ │ Chrome Extension (보호)├<───────┤ AI / 얼굴 인식 모듈   │ │
│ └──────────────────────┘ │      │ └──────────────────────┘ │
│                          │      │                          │
└──────────────────────────┘      └─────────────┬────────────┘
                                                  │
                                          ┌───────┴───────┐
                                          │ PostgreSQL DB │
                                          └───────────────┘
```

---

## 주요 기능

*  **지능형 타인 감지**: 웹캠을 통해 실시간으로 프레임을 분석하고, 등록된 사용자 외의 다른 얼굴이 화면에 나타나는 것을 즉시 감지합니다.
*  **자동 화면 보호**: 타인 감지 시, 사용자가 설정한 보호 조치(화면 전체 블러, 경고 팝업)가 즉시 실행되어 정보 노출을 원천적으로 차단합니다.
*  **사용자 맞춤형 관리 대시보드**: 직관적인 웹 대시보드를 통해 보호가 필요한 웹사이트 URL과 신뢰할 사용자 얼굴을 직접 등록하고 관리할 수 있습니다.
*  **백그라운드 브라우저 연동**: 브라우저 확장 프로그램이 백그라운드에서 동작하며, 사용자가 어떤 웹사이트에 있든 등록된 URL이라면 자동으로 보호 기능이 활성화됩니다.

---

## 기술 스택

| 구분 | 기술 |
| :--- | :--- |
| **프론트엔드** | `React`, `Vite`, `Axios`, `CSS Modules` |
| **백엔드** | `Python`, `FastAPI`, `SQLAlchemy` |
| **AI / 컴퓨터 비전**| `OpenCV`, `ONNX Runtime`, `YOLOv8` |
| **데이터베이스** | `PostgreSQL` |

---

## 빌드 및 설치 방법

### 사전 준비

아래 프로그램들이 PC에 반드시 설치되어 있어야 합니다.

* [Git](https://git-scm.com/downloads)
* [Python](https://www.python.org/downloads/) (3.9 이상 버전)
* [Node.js](https://nodejs.org/en) (18.x 이상 버전)
* [PostgreSQL](https://www.postgresql.org/download/) (데이터베이스)

### 1. 프로젝트 복제

```bash
git clone [https://github.com/oeoott/Seecure-.git](https://github.com/oeoott/Seecure-.git)
cd Seecure-
```

### 2. 백엔드 설정

```bash
# 1. 백엔드 폴더로 이동합니다.
cd edge-ai-backend-main

# 2. 파이썬 가상환경을 생성합니다.
py -m venv venv
or
python -m venv venv

# 3. 가상환경을 활성화합니다.
venv\Scripts\activate
or
venv\Scripts\activate.bat

# 4. 필요한 모든 라이브러리를 설치합니다.
pip install -r requirements.txt
```

### 3. 데이터베이스 설정

1.  PC에 설치한 PostgreSQL을 실행합니다.
2.  `pgAdmin`과 같은 관리 도구를 사용하여 **`edgeai`** 라는 이름의 새 데이터베이스를 생성합니다.
3.  `edge-ai-backend-main/app/database.py` 파일을 열어, 본인의 PostgreSQL 사용자 이름과 비밀번호에 맞게 `DATABASE_URL`을 수정합니다.

### 4. 프론트엔드 설정

```bash
# (백엔드 폴더에서 나와) 프로젝트 최상위 폴더로 이동합니다.
cd ..

# 필요한 모든 라이브러리를 설치합니다.
npm install
```

---

## 실행 및 사용 지침

프로젝트 실행을 위해서는 **백엔드 서버**와 **프론트엔드 서버**를 각각 별도의 터미널에서 실행해야 합니다.

### 1. 백엔드 서버 시작

```bash
# (새 터미널 열기)
# 1. 백엔드 폴더로 이동합니다.
cd path\to\your\Seecure-\edge-ai-backend-main

# 2. 가상환경을 활성화합니다.
venv\Scripts\activate

# 3. 서버를 시작합니다.
uvicorn app.main:app
```
> 터미널에 `Uvicorn running on http://127.0.0.1:8000` 메시지가 보이면 성공입니다. 이 터미널은 닫지 말고 그대로 두세요.

### 2. 프론트엔드 서버 시작

```bash
# (또 다른 새 터미널 열기)
# 1. 프로젝트 최상위 폴더로 이동합니다.
cd path\to\your\Seecure-

# 2. 프론트엔드 개발 서버를 시작합니다.
npm run dev
```
> 터미널에 `Local:` 옆에 `http://localhost:xxxx` 주소가 나타나면 성공입니다.

### 3. 브라우저 확장 프로그램 설치

1.  Chrome 브라우저를 열고 주소창에 `chrome://extensions`를 입력합니다.
2.  오른쪽 위의 **'개발자 모드'** 스위치를 켭니다.
3.  왼쪽 위에 나타나는 **'압축해제된 확장 프로그램을 로드합니다'** 버튼을 클릭합니다.
4.  파일 선택 창에서 프로젝트 폴더 안의 `extension` 폴더를 선택합니다.

### 4. 사용 방법

1.  웹 브라우저에서 프론트엔드 서버 주소(`http://localhost:xxxx`)로 접속하여 회원가입 및 로그인을 합니다.
2.  대시보드에서 보호하고 싶은 웹사이트의 URL과 본인의 얼굴을 등록합니다.
3.  이제 등록한 URL로 접속하면 브라우저 확장 프로그램이 자동으로 웹캠을 켜고 실시간 보호를 시작합니다.

---

## 오픈소스 라이선스

이 프로젝트는 **MIT 라이선스**를 따릅니다.

```
MIT License

Copyright (c) 2025 Seecurity

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


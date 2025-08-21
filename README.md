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

### 0단계: 사전 준비

아래 프로그램들이 PC에 반드시 설치되어 있어야 합니다.

* **Git**: [공식 사이트](https://git-scm.com/downloads)에서 다운로드하여 설치합니다.
* **Node.js**: [공식 사이트](https://nodejs.org/en)에서 **LTS 버전**을 다운로드하여 설치합니다.
* **Python**: [공식 사이트](https://www.python.org/downloads/)에서 최신 버전을 다운로드하여 설치합니다.
    * **(매우 중요)** 설치 첫 화면에서 **`Add python.exe to PATH`** 체크박스를 반드시 클릭해야 합니다.
* **PostgreSQL**: [공식 사이트](https://www.postgresql.org/download/)에서 다운로드하여 설치합니다.
    * 설치 중 비밀번호를 설정하는 화면이 나옵니다. 이 비밀번호를 꼭 기억해주세요.
* **Visual Studio Code**: [공식 사이트](https://code.visualstudio.com/)에서 다운로드하여 설치하고, **Python 확장 프로그램**을 설치합니다.

---

### 1단계: 프로젝트 복제 및 열기

1.  원하는 위치에 프로젝트를 복제(다운로드)합니다.
    ```bash
    git clone [https://github.com/oeoott/Seecure-.git](https://github.com/oeoott/Seecure-.git)
    ```
2.  VS Code를 실행하고 `파일 > 폴더 열기`를 통해 방금 복제한 `Seecure-` 폴더를 엽니다.

---

### 2단계: 백엔드 설정 (터미널 1)

1.  VS Code에서 새 터미널을 엽니다. (`Ctrl` + `\``)
2.  백엔드 폴더로 이동합니다.
    ```powershell
    cd .\edge-ai-backend-main\
    ```
3.  파이썬 가상환경을 생성합니다.
    ```powershell
    py -m venv venv
    ```
4.  **(PowerShell 사용 시)** 스크립트 실행 권한을 설정합니다. 터미널에 아래 명령어를 입력하고 `Y`를 눌러 허용합니다.
    ```powershell
    Set-ExecutionPolicy RemoteSigned -Scope Process
    ```
5.  가상환경을 활성화합니다.
    * **PowerShell**: `.\venv\Scripts\Activate.ps1`
    * **CMD**: `venv\Scripts\activate`
    > 활성화에 성공하면 터미널 맨 앞에 `(venv)`가 표시됩니다.

6.  **(매우 중요) VS Code 파이썬 인터프리터 설정**
    * 이 작업을 해야 코드에 노란 줄(경고)이 뜨는 것을 막을 수 있습니다.
    * `Ctrl+Shift+P`를 눌러 명령어 팔레트를 엽니다.
    * `Python: Select Interpreter`를 검색하고 선택합니다.
    * `+ Enter interpreter path...`를 클릭하고, 아래 경로의 파일을 직접 선택합니다.
    * **`./venv/Scripts/python.exe`**
    * VS Code 창을 새로고침(`Ctrl+Shift+P` -> `Developer: Reload Window`)하면 모든 경고가 사라집니다.

7.  필요한 모든 라이브러리를 설치합니다.
    ```powershell
    pip install -r requirements.txt
    ```

---

### 3단계: 데이터베이스 설정

1.  `pgAdmin`을 실행하여 PostgreSQL에 접속합니다.
2.  좌측 `Databases` 항목을 우클릭하여 `Create > Database...`를 선택합니다.
3.  `Database` 이름에 **`edgeai`** 라고 입력하고 저장합니다.
4.  VS Code에서 `edge-ai-backend-main/app/database.py` 파일을 엽니다.
5.  `DATABASE_URL` 변수의 `user`와 `pw` 부분을 본인이 PostgreSQL 설치 시 설정한 사용자 이름과 비밀번호로 수정합니다.
    ```python
    # 예시: 사용자 이름이 postgres이고 비밀번호가 1234인 경우
    DATABASE_URL = "postgresql://postgres:1234@localhost:5432/edgeai"
    ```

---

### 4단계: 프론트엔드 설정 (터미널 2)

1.  VS Code에서 **또 다른 새 터미널**을 엽니다. (`+` 아이콘 클릭)
2.  프로젝트의 최상위 폴더(`Seecure-`)에 있는지 확인합니다.
3.  필요한 라이브러리를 모두 설치합니다.
    ```powershell
    npm install
    ```

---

## 실행 및 사용 지침

### 1. 백엔드 서버 시작

* **터미널 1** (백엔드용)에서 아래 명령어를 실행합니다.
    ```powershell
    # 가상환경이 활성화된 상태인지 (venv) 확인
    uvicorn app.main:app
    ```
    > `Uvicorn running on http://127.0.0.1:8000` 메시지가 보이면 성공입니다.

### 2. 프론트엔드 서버 시작

* **터미널 2** (프론트엔드용)에서 아래 명령어를 실행합니다.
    ```powershell
    npm run build
    ```
    > `dist` 폴더가 생성되면 성공입니다.

### 3. 브라우저 확장 프로그램 설치

1.  Chrome 브라우저를 열고 주소창에 `chrome://extensions`를 입력합니다.
2.  오른쪽 위의 **'개발자 모드'** 스위치를 켭니다.
3.  왼쪽 위에 나타나는 **'압축해제된 확장 프로그램을 로드합니다'** 버튼을 클릭합니다.
4.  파일 선택 창에서 프로젝트 폴더 안의 `dist` 폴더를 선택합니다.

### 4. 사용 방법

1.  Chrome 브라우저 툴바에서 SeeCure 아이콘을 클릭하면 새 탭으로 관리 페이지가 열립니다.
2.  관리 페이지에서 회원가입 및 로그인을 합니다.
3.  대시보드에서 보호하고 싶은 웹사이트의 URL과 본인의 얼굴을 등록합니다.
4.  '보호 모드'를 ON으로 설정하면, 등록된 URL에 접속했을 때 자동으로 실시간 보호가 시작됩니다.

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


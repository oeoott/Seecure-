// src/main.jsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import api from "./api";

function Root() {
  // 부팅 단계에서 깜빡임 방지용
  const [booting, setBooting] = useState(true);

  // 토큰 존재만으로 1차 분기 (즉시 렌더 방지용 기본값은 null)
  const [page, setPage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // 토큰 없으면 바로 로그인 고정 후 부팅 완료
    if (!token) {
      setPage("login");
      setBooting(false);
      return;
    }

    // 토큰 있으면 가볍게 유효성 확인
    (async () => {
      try {
        await api.get("/api/v1/faces/"); // 200이면 토큰 유효
        setPage("Home");
      } catch {
        localStorage.removeItem("token");
        setPage("login");
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  if (booting || page === null) {
    // 초기 확인이 끝날 때까지 스켈레톤/스피너
    return (
      <div style={{
        width: "100vw", height: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Inter, sans-serif", color: "#054071"
      }}>
        초기화 중...
      </div>
    );
  }

  return <App currentPage={page} setPage={setPage} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);

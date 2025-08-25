// src/main.jsx
// 부팅 시 토큰 유효성 확인 후 초기 페이지 결정(스피너 표시)

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import api from "./api";

function Root() {
  const [booting, setBooting] = useState(true);
  const [page, setPage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setPage("login");
      setBooting(false);
      return;
    }

    (async () => {
      try {
        await api.get("/api/v1/faces/");
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

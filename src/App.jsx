// src/App.jsx
import React from "react";

// 페이지 컴포넌트들
import Login from "./pages/Login.jsx";
import Signin from "./pages/Signin.jsx";
import Home from "./pages/Home.jsx";
import UrlRegistration from "./pages/UrlRegistration.jsx";
import UrlManagement from "./pages/UrlManagement.jsx";
import FaceRegistration from "./pages/FaceRegistration.jsx";
import FaceManagement from "./pages/FaceManagement.jsx";
import SecureOption from "./pages/SecureOption.jsx";
import Success from "./pages/Success.jsx";

/**
 * 중요: App은 "제어 컴포넌트"
 * - 내부에서 page 상태를 새로 만들지 않는다.
 * - 부모(main.jsx)로부터 받은 currentPage / setPage만 사용한다.
 */
export default function App({ currentPage, setPage }) {
  switch (currentPage) {
    case "Home":
      return <Home setPage={setPage} />;

    case "signin":
    case "Signin":
      return <Signin setPage={setPage} />;

    case "UrlRegistration":
      return <UrlRegistration setPage={setPage} />;

    case "UrlManagement":
      return <UrlManagement setPage={setPage} />;

    case "FaceRegistration":
      return <FaceRegistration setPage={setPage} />;

    case "FaceManagement":
      return <FaceManagement setPage={setPage} />;

    case "SecureOption":
      return <SecureOption setPage={setPage} />;

    case "success":
    case "Success":
      return <Success setPage={setPage} />;

    case "login":
    default:
      return <Login setPage={setPage} />;
  }
}

// src/App.jsx
// App 컴포넌트: currentPage 상태에 따라 각 페이지를 렌더링하는 제어 컴포넌트

import React from "react";

// 페이지 컴포넌트 import
import Login from "./pages/Login.jsx";
import Signin from "./pages/Signin.jsx";
import Home from "./pages/Home.jsx";
import UrlRegistration from "./pages/UrlRegistration.jsx";
import UrlManagement from "./pages/UrlManagement.jsx";
import FaceRegistration from "./pages/FaceRegistration.jsx";
import FaceManagement from "./pages/FaceManagement.jsx";
import SecureOption from "./pages/SecureOption.jsx";
import Success from "./pages/Success.jsx";

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

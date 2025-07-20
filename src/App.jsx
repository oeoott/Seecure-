import React, { useState } from 'react';
import UrlRegistration from './pages/UrlRegistration.jsx'; 
import SecureOption from './pages/SecureOption.jsx';
import UrlManagement from './pages/UrlManagement.jsx';
import Home from './pages/Home.jsx';
import FaceRegistration from './pages/FaceRegistration.jsx';
import FaceManagement from './pages/FaceManagement.jsx';
import './App.css';

function App() {
  const [page, setPage] = useState('Home'); // 시작 페이지를 Home으로 변경해 테스트해보세요.

  return (
    <div className="app-container">
      {page === 'Home' && <Home setPage={setPage} />}
      {page === 'UrlRegistration' && <UrlRegistration setPage={setPage} />}
      {page === 'UrlManagement' && <UrlManagement setPage={setPage} />}
      {page === 'FaceRegistration' && <FaceRegistration setPage={setPage} />}
      {page === 'FaceManagement' && <FaceManagement setPage={setPage} />}
      {page === 'SecureOption' && <SecureOption setPage={setPage} />}
    </div>
  );
}

export default App;
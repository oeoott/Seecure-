import React, { useState } from 'react';
import Login from './pages/Login';
import Signin from './pages/Signin';
import Success from './pages/Success';
import UrlRegistration from './pages/UrlRegistration.jsx'; 
import SecureOption from './pages/SecureOption.jsx';
import UrlManagement from './pages/UrlManagement.jsx';
import Home from './pages/Home.jsx';
import FaceRegistration from './pages/FaceRegistration.jsx';
import FaceManagement from './pages/FaceManagement.jsx';
import './App.css';

function App() {
  const [page, setPage] = useState('login');

  return (
    <>
      {page === 'login' && <Login setPage={setPage} />}
      {page === 'signin' && <Signin setPage={setPage} />}
      {page === 'success' && <Success setPage={setPage} />}
      {page === 'Home' && <Home setPage={setPage} />}
      {page === 'UrlRegistration' && <UrlRegistration setPage={setPage} />}
      {page === 'UrlManagement' && <UrlManagement setPage={setPage} />}
      {page === 'FaceRegistration' && <FaceRegistration setPage={setPage} />}
      {page === 'FaceManagement' && <FaceManagement setPage={setPage} />}
      {page === 'SecureOption' && <SecureOption setPage={setPage} />}
    </>
  );
}

export default App;


import React, { useState } from 'react';
import Login from './pages/Login';
import Signin from './pages/Signin';
import Success from './pages/Success';

function App() {
  const [currentPage, setCurrentPage] = useState('login');

  return (
    <>
      {currentPage === 'login' && <Login setPage={setCurrentPage} />}
      {currentPage === 'signin' && <Signin setCurrentPage={setCurrentPage} />}
      {currentPage === 'success' && <Success setCurrentPage={setCurrentPage} />}
    </>
  );
}

export default App;

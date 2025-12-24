import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Classroom from './pages/Classroom';
import Handson from './pages/Handson';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Classroom />} />
          <Route path="handson" element={<Handson />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

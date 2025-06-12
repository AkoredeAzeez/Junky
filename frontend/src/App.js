import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import PatientDashboard from './pages/PatientDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/get-started" element={<AuthPage />} />
        <Route path="/dashboard" element={<PatientDashboard />} />
      </Routes>
    </Router>
  );
}

export default App; 

import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import { rembaseApp } from './backend';
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const isLoggedIn = rembaseApp.currentUser && rembaseApp.currentUser.id != undefined;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/dashboard/*" element={isLoggedIn ? <DashboardPage /> : <Navigate to="/login" />} />
        <Route path="*" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;

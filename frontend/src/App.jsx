import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Navbar />
          <div className="page-wrapper">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/monitoring" element={<div className="page-container"><h2>Monitoring Dashboard (Coming Soon)</h2></div>} />
              <Route path="/settings" element={<div className="page-container"><h2>Settings (Coming Soon)</h2></div>} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;

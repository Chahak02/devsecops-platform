import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, ShieldCheck, Settings, Activity, ShieldAlert, Terminal } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar glass-panel">
      <div className="sidebar-header">
        <ShieldCheck className="logo-icon" />
        <h2>DevSecOps</h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/projects" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <FolderKanban size={20} />
          <span>Projects</span>
        </NavLink>
        <NavLink to="/security" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <ShieldAlert size={20} />
          <span>Security</span>
        </NavLink>
        <NavLink to="/logs" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <Terminal size={20} />
          <span>Live Logs</span>
        </NavLink>
        <NavLink to="/monitoring" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <Activity size={20} />
          <span>Monitoring</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;

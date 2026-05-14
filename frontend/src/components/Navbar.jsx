import React, { useState } from 'react';
import { Bell, Search, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    setDropdownOpen(false);
    navigate(path);
  };

  return (
    <header className="navbar glass-panel">
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Search projects, deployments, logs..." />
      </div>
      <div className="nav-actions">
        <button className="icon-btn">
          <Bell size={20} />
          <span className="badge-indicator"></span>
        </button>

        {/* Clickable User Profile */}
        <div className="user-profile" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <div className="avatar">
            <User size={20} />
          </div>
          <div className="user-info">
            <span className="user-name">Admin User</span>
            <span className="user-role">DevOps Engineer</span>
          </div>
          <ChevronDown size={16} className={`chevron ${dropdownOpen ? 'open' : ''}`} />

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="profile-dropdown">
              <button onClick={() => handleNavigate('/settings')}>
                <Settings size={15} /> Settings
              </button>
              <div className="dropdown-divider" />
              <button className="logout-btn" onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
              }}>
                <LogOut size={15} /> Log Out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;

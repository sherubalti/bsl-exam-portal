import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../sidebar.css';

const Sidebar = ({ currentUser, isAdmin, onLogout, isOnline }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 1024);
      if (window.innerWidth > 1024) {
        setIsOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleLogout = () => {
    onLogout();
    setIsOpen(false);
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        className={`mobile-menu-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      <div className={`sidebar ${isMobile ? 'mobile' : ''} ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src={logo} alt="Baltistan Silicon Labs" className="sidebar-logo" />
          
          {currentUser && (
            <p className="welcome-msg">
              Welcome, {isAdmin ? 'Admin' : currentUser.name}
            </p>
          )}
          
          <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
            <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
            {isOnline ? 'Cloud Connected' : 'Cloud Offline'}
          </div>
        </div>

        <nav className="sidebar-nav">
          {!currentUser ? (
            <>
              <Link
                to="/student-login"
                className={location.pathname === '/student-login' ? 'active' : ''}
                onClick={handleLinkClick}
              >
                Student Login
              </Link>
              <Link
                to="/admin-login"
                className={location.pathname === '/admin-login' ? 'active' : ''}
                onClick={handleLinkClick}
              >
                Admin Login
              </Link>
            </>
          ) : isAdmin ? (
            <>
              <Link
                to="/admin-dashboard"
                className={location.pathname === '/admin-dashboard' ? 'active' : ''}
                onClick={handleLinkClick}
              >
                Dashboard
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/student-dashboard"
                className={location.pathname === '/student-dashboard' ? 'active' : ''}
                onClick={handleLinkClick}
              >
                Dashboard
              </Link>
              <Link
                to="/exam"
                className={location.pathname === '/exam' ? 'active' : ''}
                onClick={handleLinkClick}
              >
                Take Exam
              </Link>
              <Link
                to="/result"
                className={location.pathname === '/result' ? 'active' : ''}
                onClick={handleLinkClick}
              >
                My Results
              </Link>
              <Link
                to="/project-upload"
                className={location.pathname === '/project-upload' ? 'active' : ''}
                onClick={handleLinkClick}
              >
                Upload Project
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;

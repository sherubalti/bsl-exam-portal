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
        aria-label="Toggle Menu"
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
          <Link to="/" className="sidebar-brand" onClick={handleLinkClick}>
            <img src={logo} alt="BSL Academy" className="sidebar-logo" />
            <span className="brand-name">BSL Portal</span>
          </Link>
          
          {currentUser && (
            <div className="user-profile-section">
              <div className="user-avatar">
                {isAdmin ? 'AD' : currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <div className="user-name">{isAdmin ? 'Administrator' : currentUser.name}</div>
                <div className="user-role">{isAdmin ? 'System Access' : 'Student Portal'}</div>
              </div>
            </div>
          )}

          <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
            <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
            {isOnline ? 'System Secure' : 'Connection Lost'}
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
                <span>🔑</span> Student Portal
              </Link>
              <Link
                to="/admin-login"
                className={location.pathname === '/admin-login' ? 'active' : ''}
                onClick={handleLinkClick}
              >
                <span>🛡️</span> Admin Access
              </Link>
            </>
          ) : isAdmin ? (
            <>
              <Link
                to="/admin-dashboard"
                className={location.pathname === '/admin-dashboard' ? 'active' : ''}
                onClick={handleLinkClick}
              >
                <span>📊</span> Dashboard
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                <span>🚪</span> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/student-dashboard"
                className={location.pathname === '/student-dashboard' ? 'active' : ''}
                onClick={handleLinkClick}
              >
                <span>🏠</span> Dashboard
              </Link>
              <Link
                to="/exam"
                className={location.pathname === '/exam' ? 'active' : ''}
                onClick={handleLinkClick}
              >
                <span>📝</span> Take Exam
              </Link>
              <Link
                to="/result"
                className={location.pathname === '/result' ? 'active' : ''}
                onClick={handleLinkClick}
              >
                <span>🏆</span> My Results
              </Link>
              <Link
                to="/project-upload"
                className={location.pathname === '/project-upload' ? 'active' : ''}
                onClick={handleLinkClick}
              >
                <span>📁</span> Projects
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                <span>🚪</span> Sign Out
              </button>
            </>
          )}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;


import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../sidebar.css';

// Professional SVG icon components
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
);

const Icons = {
  dashboard: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  exam:      <Icon d={<><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="16" x2="12" y2="16"/></>} />,
  results:   <Icon d={<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>} />,
  projects:  <Icon d={<><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></>} />,
  fee:       <Icon d={<><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></>} />,
  profile:   <Icon d={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>} />,
  login:     <Icon d={<><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></>} />,
  admin:     <Icon d={<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>} />,
  logout:    <Icon d={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>} />,
};

const Sidebar = ({ currentUser, isAdmin, onLogout, isOnline }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 1024);
      if (window.innerWidth > 1024) setIsOpen(false);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleLogout = () => { onLogout(); setIsOpen(false); };
  const handleLinkClick = () => { if (isMobile) setIsOpen(false); };

  const navLink = (to, icon, label) => (
    <Link
      to={to}
      className={location.pathname === to ? 'active' : ''}
      onClick={handleLinkClick}
    >
      {icon} {label}
    </Link>
  );

  return (
    <>
      <button
        className={`mobile-menu-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Menu"
      >
        <span></span><span></span><span></span>
      </button>

      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)} />

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
            {isOnline ? 'Connected' : 'Offline'}
          </div>
        </div>

        <nav className="sidebar-nav">
          {!currentUser ? (
            <>
              {navLink('/student-login',  Icons.login,  'Student Login')}
              {navLink('/student-register', Icons.profile, 'Register')}
              {navLink('/admin-login',    Icons.admin,  'Admin Access')}
            </>
          ) : isAdmin ? (
            <>
              {navLink('/admin-dashboard', Icons.dashboard, 'Dashboard')}
              <button onClick={handleLogout} className="logout-btn">
                {Icons.logout} Sign Out
              </button>
            </>
          ) : (
            <>
              {navLink('/student-dashboard', Icons.dashboard, 'My Dashboard')}
              {navLink('/exam',              Icons.exam,      'Take Exam')}
              {navLink('/result',            Icons.results,   'My Results')}
              {navLink('/project-upload',    Icons.projects,  'My Projects')}
              {navLink('/fee-payment',       Icons.fee,       'My Fee Payments')}
              {navLink('/profile',           Icons.profile,   'My Portfolio')}
              <button onClick={handleLogout} className="logout-btn">
                {Icons.logout} Sign Out
              </button>
            </>
          )}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;

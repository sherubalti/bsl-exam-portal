import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="main-navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setIsOpen(false)}>
          <img src={logo} alt="BSL Logo" />
        </Link>

        <button className={`nav-toggle ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-links ${isOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/courses" onClick={() => setIsOpen(false)}>Courses</Link>
          <Link to="/about" onClick={() => setIsOpen(false)}>About</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)}>Contact</Link>
          <div className="nav-actions">
            <Link to="/student-login" className="btn btn-primary btn-sm" onClick={() => setIsOpen(false)}>Portal</Link>
            <Link to="/admin-login" className="btn btn-outline btn-sm" onClick={() => setIsOpen(false)}>Admin</Link>
          </div>
        </div>
      </div>
      {isOpen && <div className="nav-overlay" onClick={() => setIsOpen(false)}></div>}
    </nav>
  );
};

export default Navbar;

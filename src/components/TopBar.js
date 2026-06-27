import React from 'react';
import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/student-dashboard': { title: 'Dashboard', sub: 'Overview of your academic progress' },
  '/admin-dashboard':   { title: 'Admin Panel', sub: 'Manage students, exams and settings' },
  '/exam':              { title: 'Take Exam', sub: 'Online assessment portal' },
  '/result':            { title: 'My Results', sub: 'View your exam performance' },
  '/project-upload':    { title: 'Projects', sub: 'Upload and manage your project submissions' },
  '/fee-payment':       { title: 'Fee Payment', sub: 'Submit and track fee payments' },
  '/profile':           { title: 'My Profile', sub: 'Manage your personal and academic information' },
  '/student-login':     { title: 'Student Login', sub: 'Access your student portal' },
  '/admin-login':       { title: 'Admin Login', sub: 'Restricted administrative access' },
};

const TopBar = ({ currentUser, isAdmin }) => {
  const location = useLocation();
  const page = pageTitles[location.pathname];

  if (!page) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-PK', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h2 className="topbar-title">{page.title}</h2>
        <p className="topbar-sub">{page.sub}</p>
      </div>
      <div className="topbar-right">
        {currentUser && (
          <span className="topbar-user">
            {isAdmin ? 'Administrator' : currentUser.name}
          </span>
        )}
        <span className="topbar-date">{dateStr}</span>
      </div>
    </div>
  );
};

export default TopBar;

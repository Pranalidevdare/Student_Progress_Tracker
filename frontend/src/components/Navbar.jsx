import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdNotifications } from 'react-icons/md';
import './Navbar.css';

const routeTitles = {
  '/dashboard':      'Dashboard',
  '/attendance':     'Attendance',
  '/assignments':    'Assignments',
  '/assessments':    'Assessments',
  '/performance':    'Performance',
  '/materials':      'Study Materials',
  '/notices':        'Notices',
  '/feedback':       'Feedback',
  '/guest-sessions': 'Guest Sessions',
  '/interviews':     'Interviews',
  '/toppers':        'Toppers & Leaderboard',
  '/profile':        'My Profile',
};

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const title = routeTitles[location.pathname] || 'Student Progress Tracker';
  const initials = user?.fullName
    ? user.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'S';

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">{title}</h1>
      </div>
      <div className="navbar-right">
        <div className="navbar-org-tag">InfoBeans Foundation</div>
        <button className="navbar-icon-btn" title="Notifications">
          <MdNotifications />
        </button>
        <div className="navbar-user">
          <div className="navbar-avatar">{initials}</div>
          <div className="navbar-user-text">
            <span className="navbar-user-name">{user?.fullName || 'Student'}</span>
            <span className="navbar-user-email">{user?.email || ''}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

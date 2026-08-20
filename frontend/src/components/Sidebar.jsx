import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  User,
  ClipboardList,
  FileText,
  CalendarCheck,
  Bell,
  BookOpen,
  Video,
  Award,
  TrendingUp,
  MessageSquare,
  Trophy,
  ShieldCheck,
  Home,
  X,
  LogOut,
  AlertCircle,
  Code,
  Brain
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logoutUser } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const role = String(user?.role || 'TRAINER').toUpperCase();
  const isAdmin = role.includes('ADMIN');
  const isStudent = role.includes('STUDENT');
  const isTrainer = !isAdmin && !isStudent;

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    if (onClose) onClose();
    logoutUser();
  };

  return (
    <>
      {/* Dark Overlay for Mobile Drawer */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Responsive Drawer Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col justify-between z-50 shadow-xl md:shadow-sm font-sans transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-red-200 flex-shrink-0">
                IB
              </div>
              <div className="flex flex-col">
                <h2 className="font-extrabold text-sm text-gray-900 leading-tight">Progress Tracker</h2>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-0.5 inline-block w-fit ${
                  isAdmin ? 'bg-slate-200 text-slate-800' :
                  isStudent ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                }`}>
                  {isAdmin ? 'ADMIN PANEL' : isStudent ? 'STUDENT PORTAL' : 'TRAINER PORTAL'}
                </span>
              </div>
            </div>

            {/* Mobile Close X Button */}
            <button
              onClick={onClose}
              className="md:hidden text-gray-400 hover:text-gray-700 p-1 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links Tailored per Role */}
          <div className="p-3 flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              {isAdmin ? 'ADMINISTRATION' : isStudent ? 'STUDENT ACADEMICS' : 'TRAINER MANAGEMENT'}
            </p>

            <NavLink to="/" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Home size={18} className="flex-shrink-0" />
              <span className="truncate">Public Home</span>
            </NavLink>

            <NavLink to="/dashboard" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} className="flex-shrink-0" />
              <span className="truncate">
                {isAdmin ? 'Admin Dashboard' : isStudent ? 'Learning Dashboard' : 'Trainer Dashboard'}
              </span>
            </NavLink>

            {/* ADMIN ONLY LINKS */}
            {isAdmin && (
              <>
                <NavLink to="/batches" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <Layers size={18} className="flex-shrink-0" />
                  <span className="truncate">Batch Management</span>
                </NavLink>
                <NavLink to="/admin/dashboard" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <ShieldCheck size={18} className="flex-shrink-0" />
                  <span className="truncate">Master Roster & Verification</span>
                </NavLink>
              </>
            )}

            {/* TRAINER AND STUDENT COMMON / ROLE CUSTOM LINKS */}
            <NavLink to="/profile" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <User size={18} className="flex-shrink-0" />
              <span className="truncate">{isStudent ? 'My Academic Profile' : isAdmin ? 'Admin Profile' : 'Trainer Profile'}</span>
            </NavLink>

            {/* STUDENT SPECIFIC ACADEMICS SESSION LINKS */}
            {isStudent && (
              <>
                <NavLink to="/technical-session" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <Code size={18} className="flex-shrink-0" />
                  <span className="truncate">Technical Session</span>
                </NavLink>

                <NavLink to="/soft-skill-session" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <Brain size={18} className="flex-shrink-0" />
                  <span className="truncate">Soft Skill Session</span>
                </NavLink>

                <NavLink to="/attendance" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <CalendarCheck size={18} className="flex-shrink-0" />
                  <span className="truncate">My Attendance</span>
                </NavLink>
              </>
            )}

            {/* TRAINER MANAGEMENT LINKS */}
            {isTrainer && (
              <>
                <NavLink to="/batches" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <Layers size={18} className="flex-shrink-0" />
                  <span className="truncate">My Batches</span>
                </NavLink>

                <NavLink to="/assignments" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <ClipboardList size={18} className="flex-shrink-0" />
                  <span className="truncate">Manage Assignments</span>
                </NavLink>

                <NavLink to="/assessments" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <FileText size={18} className="flex-shrink-0" />
                  <span className="truncate">Manage Assessments</span>
                </NavLink>

                <NavLink to="/attendance" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <CalendarCheck size={18} className="flex-shrink-0" />
                  <span className="truncate">Mark Attendance</span>
                </NavLink>

                <NavLink to="/materials" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <BookOpen size={18} className="flex-shrink-0" />
                  <span className="truncate">Upload Materials</span>
                </NavLink>
              </>
            )}

            {/* NOTICES ACCESSIBLE TO ALL ROLES */}
            <NavLink to="/notices" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Bell size={18} className="flex-shrink-0" />
              <span className="truncate">{isAdmin ? 'Post Announcements' : 'Notices & Announcements'}</span>
            </NavLink>

            {/* GUEST SESSIONS & MOCK INTERVIEWS & ANALYTICS */}
            {(!isAdmin) && (
              <>
                <NavLink to="/guest-sessions" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <Video size={18} className="flex-shrink-0" />
                  <span className="truncate">{isStudent ? 'Guest Sessions' : 'Manage Guest Sessions'}</span>
                </NavLink>

                {isTrainer && (
                  <NavLink to="/interviews" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <Award size={18} className="flex-shrink-0" />
                    <span className="truncate">{user?.trainerType === 'SOFT_SKILLS' ? 'HR / Soft-Skill Interviews' : 'Technical Interviews'}</span>
                  </NavLink>
                )}

                <NavLink to="/performance" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <TrendingUp size={18} className="flex-shrink-0" />
                  <span className="truncate">{isStudent ? 'My Performance' : 'Student Analytics'}</span>
                </NavLink>

                <NavLink to="/feedback" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <MessageSquare size={18} className="flex-shrink-0" />
                  <span className="truncate">Feedback & Queries</span>
                </NavLink>
              </>
            )}

            {/* TOPPERS BOARD ACCESSIBLE TO ALL */}
            <NavLink to="/toppers" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Trophy size={18} className="flex-shrink-0" />
              <span className="truncate">Batch Toppers Board</span>
            </NavLink>
          </div>
        </div>

        {/* User Info Footer & Logout Button */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 truncate">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover border border-red-200 shadow-sm flex-shrink-0"
              />
            ) : (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                isAdmin ? 'bg-slate-800 text-white' :
                isStudent ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
              }`}>
                {(user?.fullName || user?.email || 'U')[0].toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800 truncate">{user?.fullName || 'Active User'}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email || 'user@spt.com'}</p>
            </div>
          </div>

          <button
            onClick={() => setShowLogoutModal(true)}
            title="Logout"
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-gray-100 overflow-hidden transform transition-all">
            <div className="p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-3">
                <AlertCircle size={28} />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1">Confirm Logout</h3>
              <p className="text-xs text-gray-500 mb-6">
                Do you want to log out of your Student Progress Tracker account?
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className="btn-outline flex-1 py-2.5 text-xs font-bold rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  No, Stay Here
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLogout}
                  className="btn bg-red-600 text-white hover:bg-red-700 flex-1 py-2.5 text-xs font-bold rounded-xl shadow-md shadow-red-200 flex items-center justify-center gap-1.5"
                >
                  <LogOut size={14} /> Yes, Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

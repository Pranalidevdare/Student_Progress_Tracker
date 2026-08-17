import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, User, LogOut, X, AlertCircle, BookOpen, FileText, CheckCheck, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  getStudentNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../api/notificationApi';

export default function Header({ onMenuClick }) {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const roleStr = String(user?.role || '').toUpperCase();
  const isStudent = roleStr.includes('STUDENT');

  const subtitle = isStudent ? 'Student Candidate' :
                   roleStr.includes('ADMIN') ? 'System Administrator' :
                   user?.trainerType ? `${user.trainerType} Trainer` : 'Faculty Trainer';

  useEffect(() => {
    if (isStudent) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotificationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const [notifRes, unreadRes] = await Promise.allSettled([
        getStudentNotifications(),
        getUnreadNotificationCount()
      ]);
      if (notifRes.status === 'fulfilled' && Array.isArray(notifRes.value?.data)) {
        setNotifications(notifRes.value.data);
      }
      if (unreadRes.status === 'fulfilled') {
        setUnreadCount(Number(unreadRes.value?.data) || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        await markNotificationAsRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error(err);
      }
    }
    setShowNotificationDropdown(false);

    // Route based on reference type / notification type
    const refType = String(notif.referenceType || notif.type || '').toUpperCase();
    if (refType.includes('ASSESSMENT')) {
      navigate('/assessments');
    } else if (refType.includes('MATERIAL')) {
      navigate('/materials');
    } else {
      navigate('/assignments');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getTypeBadge = (type, refType) => {
    const t = String(refType || type || '').toUpperCase();
    if (t.includes('ASSESSMENT')) {
      return { label: 'Assessment', color: 'bg-red-100 text-red-700 border-red-200' };
    } else if (t.includes('MATERIAL')) {
      return { label: 'Study Material', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    } else {
      return { label: 'Assignment', color: 'bg-purple-100 text-purple-700 border-purple-200' };
    }
  };

  return (
    <>
      <header className="header font-sans relative z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              Welcome back, <span className="text-red-600">{user?.fullName || 'User'}</span>
            </h2>
            <p className="text-xs text-gray-400 font-medium">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Bell Badge Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotificationDropdown(prev => !prev)}
              className="relative p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full animate-ping" />
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-black flex items-center justify-center -translate-y-1 translate-x-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </>
              )}
            </button>

            {/* NOTIFICATION POPUP DROPDOWN */}
            {showNotificationDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 font-sans animate-fade-in">
                <div className="p-3.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-red-600" />
                    <h3 className="text-xs font-bold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-extrabold rounded-full">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
                    >
                      <CheckCheck size={13} />
                      <span>Mark all as read</span>
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => {
                      const badge = getTypeBadge(notif.type, notif.referenceType);
                      return (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-3 text-xs flex items-start gap-3 hover:bg-red-50/50 transition cursor-pointer ${
                            !notif.read ? 'bg-red-50/20 font-medium' : ''
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!notif.read ? 'bg-red-600' : 'bg-transparent'}`} />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge.color}`}>
                                {badge.label}
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium">
                                {getTimeAgo(notif.createdAt)}
                              </span>
                            </div>

                            <h4 className="font-bold text-gray-900 line-clamp-1 text-[12px]">{notif.title}</h4>
                            <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5">{notif.message}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                      <div className="p-3 bg-gray-50 text-gray-400 rounded-full">
                        <Bell size={24} />
                      </div>
                      <p className="font-bold text-gray-700">No new notifications</p>
                      <p className="text-[11px]">You'll see updates about assignments, assessments and study materials here.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Info Avatar */}
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover border border-red-200 shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-red-100 border border-red-200 flex items-center justify-center text-red-700 font-bold text-sm">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <User size={18} />}
              </div>
            )}

            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-gray-800">{user?.fullName || 'User'}</p>
              <p className="text-[11px] text-gray-400">{user?.email || 'user@spt.com'}</p>
            </div>

            <button
              onClick={() => setShowLogoutModal(true)}
              title="Logout"
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

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
                  onClick={() => {
                    setShowLogoutModal(false);
                    logoutUser();
                  }}
                  className="btn-primary flex-1 py-2.5 text-xs font-bold rounded-xl shadow-md shadow-red-200"
                >
                  Yes, Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

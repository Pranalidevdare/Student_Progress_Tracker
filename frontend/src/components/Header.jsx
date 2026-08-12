import React, { useState } from 'react';
import { Menu, Bell, User, LogOut, X, LogOut as LogOutIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ onMenuClick }) {
  const { user, logoutUser } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const roleStr = String(user?.role || '').toUpperCase();
  const subtitle = roleStr.includes('STUDENT') ? 'Student Candidate' :
                   roleStr.includes('ADMIN') ? 'System Administrator' :
                   user?.trainerType ? `${user.trainerType} Trainer` : 'Faculty Trainer';

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logoutUser();
  };

  return (
    <>
      <header className="header font-sans">
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
          {/* Notification Bell Badge */}
          <button className="relative p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full animate-ping" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" />
          </button>

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
                  onClick={handleConfirmLogout}
                  className="btn bg-red-600 text-white hover:bg-red-700 flex-1 py-2.5 text-xs font-bold rounded-xl shadow-md shadow-red-200 flex items-center justify-center gap-1.5"
                >
                  <LogOutIcon size={14} /> Yes, Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { KeyRound, ShieldCheck, ShieldAlert, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChangePassword() {
  const { user, loginUser, logout } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentPassword) {
      setError('Please enter your current temporary password.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must contain at least 8 characters.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('New password cannot be the same as your temporary password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/auth/change-password', {
        email: user?.email,
        currentPassword,
        newPassword
      });

      const updatedData = response.data;
      toast.success('Password changed successfully! Welcome to your dashboard.');

      // Update auth context state to clear mustChangePassword flag
      if (user) {
        loginUser({
          ...user,
          ...updatedData,
          mustChangePassword: false
        });
      }

      const role = String(user?.role || 'STUDENT').toUpperCase();
      if (role.includes('ADMIN')) {
        navigate('/admin/dashboard');
      } else if (role.includes('TRAINER')) {
        navigate('/trainer/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      console.error('Password change error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to change password. Please verify your temporary password.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Logo Banner */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-700 to-red-500 mx-auto flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-red-200 mb-3">
            IB
          </div>
          <h1 className="text-2xl font-bold text-gray-900">InfoBeans Foundation</h1>
          <p className="text-xs text-red-600 font-semibold tracking-wide uppercase mt-1">
            Student Progress Tracker • First-Time Account Setup
          </p>
        </div>

        {/* Change Password Card */}
        <div className="card shadow-xl border-red-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-red-700 to-red-600 text-white flex items-center justify-between font-bold text-sm">
            <div className="flex items-center gap-2">
              <KeyRound size={18} />
              <span>Mandatory Password Change</span>
            </div>
            <span className="text-[11px] bg-red-800/80 px-2 py-0.5 rounded font-mono">1st Login</span>
          </div>

          <div className="card-body">
            <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <ShieldCheck size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Security Requirement</p>
                <p className="text-amber-700 mt-0.5">
                  You have logged in using a temporary password. Please choose a strong, personalized password to secure your Student Portal account.
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
                <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {user?.email && (
                <div className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded border border-gray-200 font-medium">
                  Account: <span className="font-bold text-gray-800">{user.email}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label text-xs font-bold text-gray-700">Current / Temporary Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter temporary password (e.g. student123)"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="form-input text-xs pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label text-xs font-bold text-gray-700">New Password (Min. 8 characters)</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Create new secure password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input text-xs"
                />
              </div>

              <div className="form-group">
                <label className="form-label text-xs font-bold text-gray-700">Confirm New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-2.5 mt-2 shadow-md shadow-red-200 font-bold text-xs flex items-center gap-1.5"
              >
                {loading ? (
                  <div className="spinner border-white border-t-transparent w-4 h-4" />
                ) : (
                  <>
                    <Lock size={14} />
                    <span>Set New Password & Continue</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-3 border-t border-gray-100 text-center">
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="text-xs text-gray-500 hover:text-red-600 font-semibold"
              >
                Cancel & Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { LogIn, ShieldAlert, ArrowLeft, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(loginData.email, loginData.password);
      const data = response.data;

      if (data && data.token) {
        loginUser(data);
        const roleName = String(data.role || 'STUDENT').toUpperCase();

        if (data.mustChangePassword) {
          toast.error('Password change required before continuing. Please update your password in the app.');
          setError('Your password must be changed before you can continue.');
          return;
        }

        toast.success(`Welcome back, ${data.fullName || 'User'}!`);

        if (roleName.includes('ADMIN')) {
          navigate('/admin/dashboard');
        } else if (roleName.includes('STUDENT')) {
          navigate('/student/dashboard');
        } else {
          navigate('/trainer/dashboard');
        }
      } else {
        setError('Invalid email or password. Please enter valid registered credentials.');
      }
    } catch (err) {
      console.error('Authentication Error:', err);
      if (!err.response) {
        setError('Cannot connect to backend server at http://localhost:8080. Please ensure Spring Boot is running.');
      } else {
        const msg = err.response?.data?.message || err.response?.data?.error || 'Invalid email or password. Only registered users can sign in.';
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <Link to="/" className="text-xs text-red-600 font-semibold flex items-center gap-1 hover:underline">
            <ArrowLeft size={14} /> Back to Public Landing Page
          </Link>
        </div>

        {/* Logo Banner */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-700 to-red-500 mx-auto flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-red-200 mb-3">
            IB
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Student Progress Tracker</h1>
          <p className="text-xs text-red-600 font-semibold tracking-wide uppercase mt-1">
            InfoBeans Foundation Portal (Student • Trainer • Admin)
          </p>
        </div>

        {/* Login Form Card */}
        <div className="card shadow-xl border-red-100 overflow-hidden">
          <div className="px-6 py-4 bg-red-600 text-white flex items-center gap-2 font-bold text-sm">
            <KeyRound size={18} />
            <span>Sign In (Registered Users)</span>
          </div>

          <div className="card-body">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
                <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} autoComplete="off" className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label">Registered Email Address</label>
                <input
                  type="email"
                  required
                  autoComplete="off"
                  placeholder="Enter registered email address"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="Enter password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 mt-2 shadow-md shadow-red-200 font-bold"
              >
                {loading ? (
                  <div className="spinner border-white border-t-transparent w-5 h-5" />
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500">
                New Candidate?{' '}
                <Link to="/registration" className="text-red-600 font-bold hover:underline">
                  Apply for ITEP Program Registration
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

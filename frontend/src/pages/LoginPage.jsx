import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginApi, getAllStudents } from '../api/api';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdErrorOutline } from 'react-icons/md';
import './LoginPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim() || !form.password.trim()) {
      setError('Please enter your email address and password.');
      return;
    }

    setLoading(true);
    try {
      // 1. Authenticate with POST /api/auth/login
      const { data: authData } = await loginApi(form);

      // Verify role is STUDENT
      if (authData.role && authData.role !== 'STUDENT') {
        setError(`Access restricted: Student portal requires a STUDENT role. Your account role is ${authData.role}.`);
        setLoading(false);
        return;
      }

      // 2. Fetch student list to resolve studentId and batchId by matching email
      let studentRecord = null;
      try {
        const { data: students } = await getAllStudents();
        studentRecord = students.find(
          (s) => s.email?.toLowerCase() === form.email.trim().toLowerCase()
        ) || null;
      } catch (err) {
        // Non-fatal if GET /api/students fails or is not accessible
      }

      login(authData, studentRecord);
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        setError('Unable to connect to the server. Please check backend connection on port 8080.');
      } else {
        const status = err.response.status;
        const msg = err.response.data?.message || err.response.data || '';
        
        if (status === 400 || status === 401) {
          setError('Invalid email or password. Please try again.');
        } else if (status === 403) {
          setError(msg || 'Your account has been disabled or access is forbidden. Please contact support.');
        } else if (status === 404) {
          setError('Account or authentication endpoint not found.');
        } else if (status >= 500) {
          setError('Internal server error. Please try again later.');
        } else {
          setError(msg || 'Authentication failed. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Branding Panel */}
      <div className="login-left">
        <div className="login-left-content">
          <div className="login-brand-mark">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="10" fill="#B91C2B" />
              <text x="24" y="31" fontFamily="Inter, sans-serif" fontSize="16" fontWeight="900" fill="white" textAnchor="middle" letterSpacing="0.5">SPT</text>
            </svg>
          </div>

          <h2 className="login-left-title">Student Progress Tracker</h2>
          <p className="login-left-org">InfoBeans Foundation</p>
          <p className="login-left-desc">
            An integrated learning and progress management portal for student training, assessments, attendance, and placement readiness.
          </p>

          <div className="login-features">
            {[
              'Real-time attendance & schedule compliance',
              'Coursework, assignments & assessment tracking',
              'Performance analytics & batch rankings',
              'Study materials, notices & guest sessions',
            ].map((feature) => (
              <div key={feature} className="login-feature-item">
                <span className="login-feature-dot" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="login-right">
        <div className="login-form-box">
          <div className="login-form-header">
            <h1 className="login-form-title">Student Sign In</h1>
            <p className="login-form-sub">Enter your credentials to access your progress portal</p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              <MdErrorOutline style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-icon-wrap">
                <MdEmail className="input-icon" />
                <input
                  className="form-control input-with-icon"
                  type="email"
                  name="email"
                  placeholder="student@infobeans.org"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-icon-wrap">
                <MdLock className="input-icon" />
                <input
                  className="form-control input-with-icon input-with-trail"
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="input-trail-btn"
                  onClick={() => setShowPw((s) => !s)}
                >
                  {showPw ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading && (
                <span
                  className="spinner"
                  style={{ width: 16, height: 16, borderWidth: 2, marginRight: 6 }}
                />
              )}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer-note">
            <p style={{ fontWeight: 600, color: '#1A1A1A' }}>Student Progress Tracker</p>
            <p>InfoBeans Foundation Training Ecosystem</p>
          </div>
        </div>
      </div>
    </div>
  );
}

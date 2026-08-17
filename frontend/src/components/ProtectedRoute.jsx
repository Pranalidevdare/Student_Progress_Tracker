import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-bg)' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }

  if (user.role && user.role !== 'STUDENT') {
    return (
      <div className="state-container" style={{ minHeight: '100vh', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>Access Restricted</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', maxWidth: 400 }}>
          This portal is reserved for students. Your account role is <strong>{user.role}</strong>.
        </p>
      </div>
    );
  }

  return children;
}

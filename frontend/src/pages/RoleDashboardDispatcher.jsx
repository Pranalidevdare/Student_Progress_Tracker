import React from 'react';
import { useAuth } from '../context/AuthContext';
import Dashboard from './Dashboard';
import StudentDashboard from './StudentDashboard';
import AdminDashboard from './AdminDashboard';

export default function RoleDashboardDispatcher() {
  const { user } = useAuth();
  const role = String(user?.role || 'TRAINER').toUpperCase();

  if (role.includes('ADMIN')) {
    return <AdminDashboard />;
  }

  if (role.includes('STUDENT')) {
    return <StudentDashboard />;
  }

  return <Dashboard />;
}

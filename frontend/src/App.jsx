import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

import LandingPage from './pages/LandingPage';
import RegistrationPage from './pages/public/RegistrationPage';
import AptitudeTestPage from './pages/public/AptitudeTestPage';
import AptitudeResultPage from './pages/public/AptitudeResultPage';
import DocumentationPage from './pages/public/DocumentationPage';
import SelectionStatusPage from './pages/public/SelectionStatusPage';

import Login from './pages/Login';
import RoleDashboardDispatcher from './pages/RoleDashboardDispatcher';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/public/AdminDashboard';
import Profile from './pages/Profile';
import Assignments from './pages/Assignments';
import Assessments from './pages/Assessments';
import TechnicalSession from './pages/TechnicalSession';
import SoftSkillSession from './pages/SoftSkillSession';
import Attendance from './pages/Attendance';
import Notices from './pages/Notices';
import Materials from './pages/Materials';
import GuestSessions from './pages/GuestSessions';
import Interviews from './pages/Interviews';
import Performance from './pages/Performance';
import Feedback from './pages/Feedback';
import Toppers from './pages/Toppers';
import TrainerLayout from './layouts/TrainerLayout';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <BrowserRouter>
          <Routes>
            {/* Public Landing & Candidate Portals */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/registration" element={<RegistrationPage />} />
            <Route path="/aptitude-test" element={<AptitudeTestPage />} />
            <Route path="/result" element={<AptitudeResultPage />} />
            <Route path="/aptitude-result" element={<AptitudeResultPage />} />
            <Route path="/documentation" element={<DocumentationPage />} />
            <Route path="/selection-status" element={<SelectionStatusPage />} />

            {/* Unified Login Portal */}
            <Route path="/login" element={<Login />} />

            {/* Protected Role-Based Application Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <TrainerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<RoleDashboardDispatcher />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/trainer/dashboard" element={<Dashboard />} />
              <Route path="/student/dashboard" element={<StudentDashboard />} />

              <Route path="/profile" element={<Profile />} />
              <Route path="/technical-session/*" element={<TechnicalSession />} />
              <Route path="/soft-skill-session/*" element={<SoftSkillSession />} />
              <Route path="/assignments" element={<Assignments />} />
              <Route path="/assessments" element={<Assessments />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/notices" element={<Notices />} />
              <Route path="/materials" element={<Materials />} />
              <Route path="/guest-sessions" element={<GuestSessions />} />
              <Route path="/interviews" element={<Interviews />} />
              <Route path="/performance" element={<Performance />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/toppers" element={<Toppers />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

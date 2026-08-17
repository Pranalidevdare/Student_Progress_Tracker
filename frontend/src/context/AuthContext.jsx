import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentStudent } from '../api/api';

const AuthContext = createContext(null);
const STORAGE_KEY = 'spt_auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try { return JSON.parse(savedUser); } catch(e) {}
    }
    const sptAuth = localStorage.getItem(STORAGE_KEY);
    if (sptAuth) {
      try { return JSON.parse(sptAuth); } catch(e) {}
    }
    return null;
  });

  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) return savedToken;
    const sptAuth = localStorage.getItem(STORAGE_KEY);
    if (sptAuth) {
      try { return JSON.parse(sptAuth).token; } catch(e) {}
    }
    return null;
  });

  // Automatically sync student profile from GET /api/students/me only for student accounts
  useEffect(() => {
    const roleStr = String(user?.role || '').toUpperCase();
    if (token && roleStr.includes('STUDENT')) {
      getCurrentStudent()
        .then((res) => {
          if (res?.data) {
            const s = res.data;
            const syncedUser = {
              ...user,
              id: s.id || user.id,
              studentId: s.studentId || user.studentId || s.id,
              email: s.email || user.email,
              fullName: [s.firstName, s.lastName].filter(Boolean).join(' ') || user.fullName,
              batchId: s.batchId || user.batchId || null,
              batchName: s.batchName || user.batchName || '',
              profileImage: s.profileImage || user.profileImage
            };
            setUser(syncedUser);
            localStorage.setItem('user', JSON.stringify(syncedUser));
            if (syncedUser.batchId) {
              localStorage.setItem('batchId', syncedUser.batchId);
            }
          }
        })
        .catch((err) => {
          console.warn("AuthContext student sync warning:", err?.message);
        });
    }
  }, [token]);

  const loginUser = (data, meta = null) => {
    const rawRole = String(data.role || '').toUpperCase();
    const isStudent = rawRole.includes('STUDENT');
    const isTrainer = rawRole.includes('TRAINER');
    const isAdmin = rawRole.includes('ADMIN');

    const userData = {
      id: data.id || data.userId || data.email,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      token: data.token,
      mustChangePassword: Boolean(data.mustChangePassword)
    };

    if (isStudent) {
      userData.studentId = data.studentId || data.id;
      userData.batchId = data.batchId || meta?.batchId || null;
      userData.batchName = data.batchName || '';
      localStorage.removeItem('trainerId');
      if (userData.batchId) localStorage.setItem('batchId', userData.batchId);
    } else if (isTrainer) {
      userData.trainerId = data.id;
      userData.trainerType = data.trainerType || 'TECHNICAL';
      userData.batchId = data.batchId || meta?.batchId || null;
      localStorage.setItem('trainerId', data.id);
      localStorage.removeItem('studentId');
      if (userData.batchId) localStorage.setItem('batchId', userData.batchId);
    } else if (isAdmin) {
      userData.adminId = data.id;
      localStorage.removeItem('trainerId');
      localStorage.removeItem('studentId');
      localStorage.removeItem('batchId');
    }

    setUser(userData);
    setToken(data.token);

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
  };

  const updateUserData = (updatedData) => {
    const newUserData = { ...user, ...updatedData };
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUserData));
    if (newUserData.trainerId) localStorage.setItem('trainerId', newUserData.trainerId);
    if (newUserData.batchId) localStorage.setItem('batchId', newUserData.batchId);
  };

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logoutUser, updateUserData, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

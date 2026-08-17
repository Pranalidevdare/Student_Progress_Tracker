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

  // Automatically sync student profile from GET /api/students/me whenever token is present
  useEffect(() => {
    if (token && user?.role && String(user.role).toUpperCase().includes('STUDENT')) {
      getCurrentStudent()
        .then((res) => {
          if (res?.data) {
            const s = res.data;
            const syncedUser = {
              ...user,
              id: s.id || user.id,
              studentId: s.studentId || user.studentId,
              email: s.email || user.email,
              fullName: [s.firstName, s.lastName].filter(Boolean).join(' ') || user.fullName,
              batchId: s.batchId || user.batchId || 'BATCH001',
              batchName: s.batchName || user.batchName || '',
              profileImage: s.profileImage || user.profileImage
            };
            setUser(syncedUser);
            localStorage.setItem('user', JSON.stringify(syncedUser));
            localStorage.setItem('batchId', syncedUser.batchId);
          }
        })
        .catch((err) => {
          console.warn("AuthContext student sync warning:", err?.message);
        });
    }
  }, [token]);

  const loginUser = (data, meta = null) => {
    const userData = {
      id: data.id || data.studentId || meta?.id || localStorage.getItem('trainerId') || data.email,
      studentId: data.studentId || data.id,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      trainerType: data.trainerType,
      batchId: data.batchId || meta?.batchId || 'BATCH001',
      token: data.token,
      mustChangePassword: Boolean(data.mustChangePassword)
    };

    setUser(userData);
    setToken(data.token);

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      token: data.token,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      studentId: userData.id,
      trainerId: userData.id,
      batchId: userData.batchId,
      mustChangePassword: userData.mustChangePassword
    }));

    if (userData.id) {
      localStorage.setItem('trainerId', userData.id);
    }
    if (userData.batchId) {
      localStorage.setItem('batchId', userData.batchId);
    }
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
    if (updatedData.id) localStorage.setItem('trainerId', updatedData.id);
    if (updatedData.batchId) localStorage.setItem('batchId', updatedData.batchId);
  };

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logoutUser, updateUserData, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

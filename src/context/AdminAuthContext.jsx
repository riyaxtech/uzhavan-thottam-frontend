import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminLogin, verifyAdminSession } from '../services/adminService';

const AdminAuthContext = createContext(null);

const STORAGE_KEY = 'uzhavan_admin_token';
const USER_STORAGE_KEY = 'uzhavan_admin_user';

export const AdminAuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || null);
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Verify stored token on initial load
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const storedToken = localStorage.getItem(STORAGE_KEY);
      if (!storedToken) {
        if (isMounted) {
          setToken(null);
          setAdminUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const res = await verifyAdminSession(storedToken);
        if (isMounted && res.success) {
          setToken(storedToken);
          setAdminUser(res.user || { username: 'admin' });
        } else {
          // Invalidate
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(USER_STORAGE_KEY);
          if (isMounted) {
            setToken(null);
            setAdminUser(null);
          }
        }
      } catch {
        // Invalidate on error/expiry
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        if (isMounted) {
          setToken(null);
          setAdminUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await adminLogin(username, password);
    if (res.success && res.token) {
      localStorage.setItem(STORAGE_KEY, res.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user || { username }));
      setToken(res.token);
      setAdminUser(res.user || { username });
      return res;
    }
    throw new Error(res.message || 'Login failed');
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setAdminUser(null);
  }, []);

  const value = {
    token,
    adminUser,
    isAuthenticated: Boolean(token),
    isLoading,
    login,
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export default AdminAuthContext;

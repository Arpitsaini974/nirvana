import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('club_admin_token') || null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper for authenticated requests
  const authFetch = async (url, options = {}) => {
    const headers = {
      ...(options.headers || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
  };

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setAdmin(null);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAdmin(data.admin);
        } else {
          // Token invalid or expired
          logout();
        }
      } catch (err) {
        console.error('Auth verification failed', err);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const login = (newToken, adminData) => {
    localStorage.setItem('club_admin_token', newToken);
    setToken(newToken);
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('club_admin_token');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ token, admin, isAuthenticated: !!token && !!admin, loading, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

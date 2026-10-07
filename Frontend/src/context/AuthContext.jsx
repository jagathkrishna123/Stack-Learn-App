import React, { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on initial load
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedRole = localStorage.getItem('role');

    if (savedToken && savedUser && savedRole) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setRole(savedRole);
      } catch (err) {
        console.error('Failed to parse saved user:', err);
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const adminLogin = async (email, password) => {
    const res = await authApi.adminLogin({ email, password });
    if (res.data && res.data.success) {
      const { token, admin } = res.data;
      const userData = { ...admin, role: 'admin' };
      
      setToken(token);
      setUser(userData);
      setRole('admin');

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('role', 'admin');
      return res.data;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const internLogin = async (email, password) => {
    const res = await authApi.internLogin({ email, password });
    if (res.data && res.data.success) {
      const { token, intern } = res.data;
      const userData = { ...intern, role: 'intern' };

      setToken(token);
      setUser(userData);
      setRole('intern');

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('role', 'intern');
      return res.data;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const internRegister = async (name, email, password, assignedStack) => {
    const res = await authApi.internRegister({ name, email, password, assignedStack });
    if (res.data && res.data.success) {
      const { token, intern } = res.data;
      const userData = { ...intern, role: 'intern' };

      setToken(token);
      setUser(userData);
      setRole('intern');

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('role', 'intern');
      return res.data;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };


  const logout = () => {
    setToken(null);
    setUser(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  };

  const updateUser = (updatedData) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin: role === 'admin',
        isIntern: role === 'intern',
        adminLogin,
        internLogin,
        internRegister,
        logout,
        updateUser,

      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

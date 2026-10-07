import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ allowedRole }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <Loader text="Verifying session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated users to home / login
    return <Navigate to={allowedRole === 'admin' ? '/admin/login' : '/intern/login'} replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // Redirect if user has wrong role
    const defaultRedirect = role === 'admin' ? '/admin/dashboard' : '/intern/dashboard';
    return <Navigate to={defaultRedirect} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

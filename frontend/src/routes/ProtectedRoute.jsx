import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import Loader from '../components/Loader';

const ProtectedRoute = ({ allowedRoles }) => {
  const { role, token, isLoading } = useAuth();

  if (isLoading) {
    return <Loader />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to their respective dashboard if they try to access wrong role route
    if (role === 'customer') return <Navigate to="/dashboard" replace />;
    if (role === 'organiser') return <Navigate to="/organiser" replace />;
    if (role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

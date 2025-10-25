// src/components/auth/ProtectedRoute.tsx
import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles: ('admin' | 'staff' | 'viewer')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { token, user } = useAuthStore();

  if (!token || !user) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Logged in, but wrong role
    // You could redirect to an "Unauthorized" page or back to login
    return <Navigate to="/login" replace />;
  }

  // Logged in and has the correct role, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
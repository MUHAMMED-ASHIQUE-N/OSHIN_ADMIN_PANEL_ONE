import React from 'react';
import { useAuthStore, IUser } from '../../stores/authStore'; // Import the IUser interface
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  // ✅ Update the allowedRoles array to include all possible roles
  allowedRoles: IUser['role'][];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { token, user } = useAuthStore();

  if (!token || !user) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Logged in, but wrong role. Redirect to login.
    return <Navigate to="/login" replace />;
  }

  // Logged in and has the correct role, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
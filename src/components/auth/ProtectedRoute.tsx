import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute: React.FC = () => {
  const { token } = useAuthStore();

  // If there's a token, render the child routes (via <Outlet />).
  // Otherwise, redirect to the /login page.
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
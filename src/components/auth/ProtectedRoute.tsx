import React from 'react';
import { useAuthStore, IUser } from '../../stores/authStore'; // Import the IUser interface
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  // ✅ Type is now based on IUser['role'], which includes staff_cfc
  allowedRoles: IUser['role'][];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { token, user } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // This logic now automatically checks for 'staff_cfc' if it's in the array
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
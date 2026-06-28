import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles, requiredModule, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Checking authentication...</div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.roleType)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  if (requiredModule && user.roleType !== 'superadmin' && user.permissions?.[requiredModule] === false) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;

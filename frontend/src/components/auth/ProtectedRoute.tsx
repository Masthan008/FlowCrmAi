import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRoles
}) => {
  const { isAuthenticated, permissions, role } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login, saving the original location for post-login return
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Enforce role guards if specified
  if (requiredRoles && role && !requiredRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Enforce permission guards if specified
  if (requiredPermission) {
    const hasPermission = permissions.includes(requiredPermission) || permissions.includes('*');
    
    // Check wildcard scope (e.g., 'leads:*' matching 'leads:create')
    const splitReq = requiredPermission.split(':');
    const hasWildcard = splitReq.length > 1 && permissions.includes(`${splitReq[0]}:*`);

    if (!hasPermission && !hasWildcard) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

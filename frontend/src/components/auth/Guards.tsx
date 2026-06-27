import React from 'react';
import { useAuthStore } from '../../store/authStore';

interface GuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface PermissionGuardProps extends GuardProps {
  permission: string;
}

interface RoleGuardProps extends GuardProps {
  allowedRoles: string[];
}

/**
 * Render children only if current user has the required permission claims
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  fallback = null
}) => {
  const { permissions } = useAuthStore();

  const hasPermission = permissions.includes(permission) || permissions.includes('*');
  const splitReq = permission.split(':');
  const hasWildcard = splitReq.length > 1 && permissions.includes(`${splitReq[0]}:*`);

  if (hasPermission || hasWildcard) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

/**
 * Render children only if current user possesses one of the allowed role mappings
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback = null
}) => {
  const { role } = useAuthStore();

  if (role && allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

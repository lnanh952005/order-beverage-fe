import * as React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { ForbiddenView } from './ForbiddenView';
import { Spinner } from '@/shared/components/feedback';
import type { UserRole } from '../types/auth.types';

interface RequireRoleProps {
  role: UserRole | UserRole[];
  children?: React.ReactNode;
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    const redirectUrl = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?redirect=${redirectUrl}`} replace />;
  }

  const allowedRoles = Array.isArray(role) ? role : [role];
  const hasAccess = allowedRoles.includes(user.role);

  if (!hasAccess) {
    return <ForbiddenView />;
  }

  return children ? <>{children}</> : <Outlet />;
}

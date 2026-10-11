import * as React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from '@/shared/components/feedback';

interface RequireAuthProps {
  children?: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirectUrl = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?redirect=${redirectUrl}`} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

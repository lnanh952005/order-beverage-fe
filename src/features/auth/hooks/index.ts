import * as React from 'react';

/**
 * @deprecated AuthProvider is no longer needed with Zustand state management.
 * Kept as a no-op wrapper for backward compatibility.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}

export { useAuth, type AuthContextValue, type UseAuthReturn } from './useAuth';
export { useAdminUsers } from './useAdminUsers';
export { useUpdateUserStatus } from './useUpdateUserStatus';
export { useUpdateUserRole } from './useUpdateUserRole';
export { useRoles } from './useRoles';

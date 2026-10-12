import { useAuthStore } from '../stores/auth.store';
import type { User, LoginInput, RegisterInput } from '../types/auth.types';

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<{ isNewUser: boolean }>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

export type UseAuthReturn = AuthContextValue;

export function useAuth(): AuthContextValue {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const logout = useAuthStore((s) => s.logout);
  const refetchUser = useAuthStore((s) => s.refetchUser);

  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff' || user?.role === 'admin';

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    isStaff,
    login,
    register,
    loginWithGoogle,
    logout,
    refetchUser,
  };
}

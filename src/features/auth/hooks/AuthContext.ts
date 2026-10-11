import { createContext } from 'react';
import type { User, RegisterInput } from '../types/auth.types';

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<{ isNewUser: boolean }>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

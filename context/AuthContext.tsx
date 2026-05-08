'use client';

import { createContext, useContext } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Id } from '@/convex/_generated/dataModel';

export interface UserType {
  uid: string; // Changed from Id<'users'> to string for localStorage compatibility
  googleUid: string;
  name: string;
  email: string;
  picture: string;
  credits?: number;
}

export interface AuthContextType {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  isLoading: boolean;
}

// Create context with undefined to force proper provider usage
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  console.log('useAuth - Retrieved context:', {
    hasContext: !!context,
    hasUser: !!context?.user,
    isLoading: context?.isLoading,
  });
  
  return context;
};
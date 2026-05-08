/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useLogout.ts
'use client';

import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const useLogout = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useLogout must be used within an AuthProvider');
  
  const { setUser } = context;
  const router = useRouter();

  const logout = (showToast = true, redirectTo = '/sign-in') => {
    try {
      // Clear user from context
      setUser(null);
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('user_token');
        
        // Clear any other auth-related items
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('auth_') || key.startsWith('user_'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
      
      // Show success message
      if (showToast) {
        toast.success('Logged out successfully');
      }
      
      // Redirect to sign in page
      router.replace(redirectTo);
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      if (showToast) {
        toast.error('Error during logout');
      }
    }
  };

  return logout;
};

// utils/authUtils.ts
export const clearAllAuthData = () => {
  if (typeof window === 'undefined') return;
  
  try {
    // Remove specific auth keys
    const authKeys = [
      'user',
      'user_token',
      'auth_token',
      'google_token',
      'refresh_token'
    ];
    
    authKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Clear any cookies if you're using them
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    console.log('All auth data cleared');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

// Check if user data is valid
export const isValidUserData = (user: any): boolean => {
  return !!(
    user &&
    user.uid &&
    user.email &&
    user.name &&
    typeof user.uid === 'string' &&
    typeof user.email === 'string' &&
    typeof user.name === 'string'
  );
};
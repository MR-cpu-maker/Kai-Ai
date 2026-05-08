'use client';

import React, { useEffect, useState } from 'react';
import { AuthContext, UserType } from '@/context/AuthContext';
import { GetAuthUserData } from '@/services/GlobalApi';
import Header from './_components/Header';
import { usePathname } from 'next/navigation';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const CheckUserAuth = async () => {
      try {
        // First, try to load user from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser) as UserType;
          setUser(parsedUser);
          setIsLoading(false);
          return;
        }

        // If no stored user, check for token and fetch from Google
        const token = localStorage.getItem('user_token');
        if (token) {
          try {
            const userData = await GetAuthUserData(token);
            
            // Create user object that matches your UserType interface
            const userObj: UserType = {
              uid: userData.sub || userData.id || '', // Handle missing uid
              googleUid: userData.sub || userData.id || '',
              name: userData.name,
              email: userData.email,
              picture: userData.picture,
            };
            
            setUser(userObj);
            
            // Store the complete user object for future loads
            localStorage.setItem('user', JSON.stringify(userObj));
            
          } catch (error) {
            console.error('Failed to fetch Google user data', error);
            localStorage.removeItem('user_token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Error in CheckUserAuth:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('user_token');
      } finally {
        setIsLoading(false);
      }
    };

    CheckUserAuth();
  }, []);

  // Save user to localStorage when user changes (after initial load)
  useEffect(() => {
    if (!isLoading && user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else if (!isLoading && !user) {
      localStorage.removeItem('user');
    }
  }, [user, isLoading]);

  // Create context value with all required properties
  const contextValue = React.useMemo(() => ({
    user,
    setUser,
    isLoading,
  }), [user, isLoading]);

  // Debug logging
  console.log('AuthProvider - Context value:', {
    hasUser: !!user,
    isLoading,
    pathname,
  });

  return (
    <AuthContext.Provider value={contextValue}>
      {/* Show Header only on the /ai-assistants page */}
      {pathname === '/ai-assistants' && <Header />}
      {children}
    </AuthContext.Provider>
  );
}
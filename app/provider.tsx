'use client';

import React, { useState, useEffect } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { useQuery } from 'convex/react';
import { AuthContext, UserType } from '@/context/AuthContext';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

// User validation component that checks if user exists in database
function UserValidator({ 
  children, 
  user, 
  setUser, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isLoading, 
  setIsLoading 
}: { 
  children: React.ReactNode;
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}) {
  // Query to check if user exists in database
  const dbUser = useQuery(
    api.users.getUserById, 
    user?.uid ? { userId: user.uid as Id<'users'> } : 'skip'
  );
  
  const [validationComplete, setValidationComplete] = useState(false);

  useEffect(() => {
    if (!user) {
      setValidationComplete(true);
      setIsLoading(false);
      return;
    }

    // If we have a user but the query is still loading, wait
    if (dbUser === undefined) {
      return;
    }

    // If user doesn't exist in database, log them out
    if (dbUser === null) {
      console.log('User not found in database, logging out...');
      setUser(null);
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('user_token');
      }
    } else {
      // User exists, update with latest data from database
      const updatedUser = {
        ...user,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.picture,
        credits: dbUser.credits,
      };
      
      // Only update if data has changed
      if (JSON.stringify(user) !== JSON.stringify(updatedUser)) {
        console.log('Updating user with latest database data');
        setUser(updatedUser);
      }
    }

    setValidationComplete(true);
    setIsLoading(false);
  }, [user, dbUser, setUser, setIsLoading]);

  // Show loading while validating user
  if (!validationComplete && user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}

// Inner component that has access to Convex
function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Load user from localStorage
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser) as UserType;
          console.log('Loaded user from localStorage:', parsedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    };

    loadUserFromStorage();
  }, []);

  // Save user to localStorage when user changes
  useEffect(() => {
    if (!mounted) return;
    
    if (user) {
      try {
        localStorage.setItem('user', JSON.stringify(user));
        console.log('Saved user to localStorage:', user);
      } catch (error) {
        console.error('Error saving user to localStorage:', error);
      }
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('user_token');
      console.log('Removed user from localStorage');
    }
  }, [user, mounted]);

  // Create context value
  const contextValue = React.useMemo(() => ({
    user,
    setUser,
    isLoading,
  }), [user, isLoading]);

  return (
    <AuthContext.Provider value={contextValue}>
      <UserValidator 
        user={user} 
        setUser={setUser} 
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      >
        {children}
      </UserValidator>
    </AuthContext.Provider>
  );
}

function Provider({ children }: { children: React.ReactNode }) {
  // Create convex client only once
  const convex = React.useMemo(() => 
    new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!),
    []
  );

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <ConvexProvider client={convex}>
        <AuthProviderInner>
          <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </NextThemesProvider>
        </AuthProviderInner>
      </ConvexProvider>
    </GoogleOAuthProvider>
  );
}

export default Provider;
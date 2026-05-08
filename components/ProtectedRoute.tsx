// components/ProtectedRoute.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useLogout } from '@/hooks/useLogout';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/sign-in',
  requireAuth = true 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const logout = useLogout();
  const [isValidating, setIsValidating] = useState(true);

  // Query to validate user exists in database
  const dbUser = useQuery(
    api.users.getUserById,
    user?.uid && requireAuth ? { userId: user.uid as Id<'users'> } : 'skip'
  );

  useEffect(() => {
    // If we don't require auth, just show the content
    if (!requireAuth) {
      setIsValidating(false);
      return;
    }

    // If still loading initial auth state, wait
    if (isLoading) {
      return;
    }

    // If no user and auth is required, redirect to sign in
    if (!user) {
      console.log('No user found, redirecting to sign in');
      router.replace(redirectTo);
      setIsValidating(false);
      return;
    }

    // If we have a user but database query is still loading, wait
    if (dbUser === undefined) {
      return;
    }

    // If user exists in localStorage but not in database, log them out
    if (dbUser === null) {
      console.log('User not found in database, logging out');
      logout(true, redirectTo);
      setIsValidating(false);
      return;
    }

    // User is valid, show content
    setIsValidating(false);
  }, [user, dbUser, isLoading, requireAuth, router, redirectTo, logout]);

  // Show loading spinner while validating
  if (isValidating || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating user...</p>
        </div>
      </div>
    );
  }

  // If we reach here and requireAuth is true, user is validated
  // If requireAuth is false, just show the content
  return <>{children}</>;
}

// Higher-order component version
export function withProtectedRoute<T extends object>(
  Component: React.ComponentType<T>,
  options: { redirectTo?: string; requireAuth?: boolean } = {}
) {
  return function ProtectedComponent(props: T) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
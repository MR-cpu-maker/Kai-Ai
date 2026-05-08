'use client';

import React, { useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import { FcGoogle } from 'react-icons/fc';
import { useGoogleLogin } from '@react-oauth/google';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { GetAuthUserData } from '@/services/GlobalApi';

function SignIn() {
  const CreateUser = useMutation(api.users.createUser);
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthContext must be used within an AuthProvider');
  const { setUser } = context;
  const router = useRouter();
  
  // Add client-side mounting check
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Safe localStorage helper
  const safeSetItem = (key: string, value: string) => {
    if (typeof window !== 'undefined' && isClient) {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('Error setting localStorage:', error);
      }
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        console.log('Starting Google login process...');
        const googleUser = await GetAuthUserData(tokenResponse.access_token);
        console.log('Google user data received:', googleUser);
        
        if (!googleUser.sub && !googleUser.id) {
          throw new Error('Missing user ID from Google');
        }

        const googleUid = googleUser.sub || googleUser.id;

        // Create or get user in Convex - PASS THE GOOGLE UID, NOT CONVEX ID
        console.log('Creating/getting user in Convex with Google UID:', googleUid);
        const userResult = await CreateUser({
          uid: googleUid, // This should be the Google UID
          name: googleUser.name,
          email: googleUser.email,
          picture: googleUser.picture,
        });

        console.log('Convex user result:', userResult);

        // Check if user creation was successful
        if (!userResult || !userResult.id) {
          throw new Error('Failed to create/get user in database');
        }

        // Set user in context with BOTH the Convex document ID and Google UID
        const userData = {
          uid: userResult.id.toString(), // This is the Convex document ID for UI purposes
          googleUid: googleUid, // This is the Google UID for database operations
          name: googleUser.name,
          email: googleUser.email,
          picture: googleUser.picture,
          credits: 1000, // Default credits for new users
        };

        console.log('Setting user data:', userData);
        setUser(userData);

        // Store token for API calls
        safeSetItem('user_token', tokenResponse.access_token);
        
        // Also store user data directly to localStorage as backup
        safeSetItem('user', JSON.stringify(userData));
        
        console.log('Login successful, redirecting...');
        toast.success('Login successful!');
        router.replace('/ai-assistants');
      } catch (error) {
        console.error('Login error:', error);
        toast.error(`Error logging in: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      toast.error('Google login failed. Please try again.');
    },
  });

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
          <div className="animate-pulse">
            <div className="mb-8 flex flex-col items-center">
              <div className="h-[120px] w-[120px] rounded-lg bg-gray-200"></div>
              <div className="mt-4 h-8 w-48 rounded bg-gray-200"></div>
              <div className="mt-2 h-4 w-64 rounded bg-gray-200"></div>
            </div>
            <div className="h-12 w-full rounded-lg bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-8 flex flex-col items-center">
          <Image
            src="/logos/company.png"
            alt="Company Logo"
            width={120}
            height={120}
            priority
            className="rounded-lg"
          />
          <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
          <p className="mt-2 text-center text-gray-600">Sign in to access your account</p>
        </div>

        <button
          onClick={() => googleLogin()}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-3 px-4 text-gray-700 shadow-sm transition-all hover:bg-gray-50"
        >
          <FcGoogle className="text-xl" />
          <span className="font-medium">Sign in with Google</span>
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          By continuing, you agree to our{' '}
          <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
            Privacy Policy
          </a>.
        </p>
      </div>
    </div>
  );
}

export default SignIn;
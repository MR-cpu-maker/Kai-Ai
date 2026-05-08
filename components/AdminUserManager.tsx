// components/AdminUserManager.tsx (for development use)
'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/context/AuthContext';
import { useLogout } from '@/hooks/useLogout';
import { toast } from 'sonner';

export default function AdminUserManager() {
  const { user } = useAuth();
  const logout = useLogout();
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Get current user from database
  const dbUser = useQuery(
    api.users.getUserById,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user?.uid ? { userId: user.uid as any } : 'skip'
  );
  
  const deleteUser = useMutation(api.users.deleteUser);

  const handleDeleteAccount = async () => {
    if (!user?.uid || !dbUser) {
      toast.error('No user found to delete');
      return;
    }

    try {
      console.log('Deleting user account...');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await deleteUser({ userId: user.uid as any });
      
      // Log out the user immediately after deletion
      logout(false, '/sign-in');
      
      toast.success('Account deleted successfully');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  const handleForceLogout = () => {
    logout(true, '/sign-in');
  };

  const handleClearStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      toast.success('Storage cleared. Please refresh the page.');
    }
  };

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-yellow-800">No user logged in</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm max-w-2xl">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        User Management (Dev Tool)
      </h2>
      
      <div className="space-y-4">
        {/* User Info */}
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-medium text-gray-700 mb-2">Current User</h3>
          <div className="text-sm space-y-1">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>UID:</strong> {user.uid}</p>
            <p><strong>Google UID:</strong> {user.googleUid}</p>
            <p><strong>Credits:</strong> {user.credits || 0}</p>
          </div>
        </div>

        {/* Database Status */}
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-medium text-gray-700 mb-2">Database Status</h3>
          <p className="text-sm">
            Database User: {dbUser ? '✅ Found' : dbUser === null ? '❌ Not Found' : '⏳ Loading...'}
          </p>
          {dbUser === null && (
            <p className="text-sm text-red-600 mt-1">
              User exists in localStorage but not in database. You should be logged out automatically.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleForceLogout}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Force Logout
          </button>
          
          <button
            onClick={handleClearStorage}
            className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
          >
            Clear All Storage
          </button>
          
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            disabled={!dbUser}
          >
            Delete Account
          </button>
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md">
              <h3 className="text-lg font-semibold mb-4">Confirm Account Deletion</h3>
              <p className="text-gray-600 mb-4">
                This will permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    handleDeleteAccount();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
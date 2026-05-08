'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

function Header() {
  const [hasMounted, setHasMounted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Get auth context
  const { user } = useAuth();

  useEffect(() => {
    setHasMounted(true);

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Don't render until mounted to avoid hydration issues
  if (!hasMounted) {
    return (
      <div className="p-4 shadow-sm flex items-center justify-between bg-white rounded-md">
        <div className="flex items-center gap-3">
          <div className="w-[60px] h-[60px] bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 shadow-sm flex items-center justify-between bg-white rounded-md">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <Image
          src="/logos/company.png"
          alt="Company Logo"
          width={60}
          height={60}
          priority
          className="rounded-lg"
        />
        <h1 className="text-xl font-bold text-gray-800">AI Assistant</h1>
      </div>

      {/* Right: User Info (Display Only) */}
      {user && (
        <div className="flex items-center gap-3">
          <Image
            src={user.picture || "/logos/company.png"}
            alt="User Profile"
            width={48}
            height={48}
            className="rounded-full border-2 border-gray-300"
          />
          <div className="text-right hidden sm:block">
            <p className="font-medium text-gray-800">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Header;
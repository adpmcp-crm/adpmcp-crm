'use client';

import React from 'react';
import { Search, User as UserIcon, LogIn } from 'lucide-react';
import { useFirebase } from '@/components/providers/FirebaseProvider';
import { loginWithGoogle } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { NotificationDropdown } from './NotificationDropdown';

export function TopBar() {
  const { user, profile } = useFirebase();

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Pesquisar membros, eventos..." 
            className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <NotificationDropdown />

        <div className="h-8 w-px bg-gray-100"></div>

        <Link href="/perfil" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900">{user?.displayName}</p>
            <p className="text-xs text-gray-500 capitalize">{profile?.role || 'Membro'}</p>
          </div>
          <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-blue-50">
            {user?.photoURL ? (
              <Image 
                src={user.photoURL} 
                alt={user.displayName || 'User'} 
                fill 
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                <UserIcon className="text-blue-600 w-5 h-5" />
              </div>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}

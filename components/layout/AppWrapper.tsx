'use client';

import React from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { Loader2 } from 'lucide-react';

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    console.log("AppWrapper: Still loading...");
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { useFirebase } from '@/components/providers/FirebaseProvider';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { Loader2 } from 'lucide-react';

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useFirebase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium">Carregando ADP CRM...</p>
        </div>
      </div>
    );
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

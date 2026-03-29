'use client';

import React from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  if (loading) {
    console.log("AppWrapper: Still loading...");
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div className="flex-1 flex flex-col">
        <TopBar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

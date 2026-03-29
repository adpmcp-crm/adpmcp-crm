'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Church, 
  Calendar, 
  Briefcase, 
  LogOut,
  ChevronRight,
  CircleUser
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/lib/firebase';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Users, label: 'Membros', href: '/membros' },
  { icon: Briefcase, label: 'Liderança', href: '/equipa' },
  { icon: Church, label: 'Igrejas', href: '/igrejas' },
  { icon: Briefcase, label: 'Departamentos', href: '/departamentos' },
  { icon: Calendar, label: 'Agenda Anual', href: '/agenda-anual' },
  { icon: CircleUser, label: 'Meu Perfil', href: '/perfil' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-8 flex-1">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shadow-sm overflow-hidden p-1 relative">
            <Church className="text-blue-600 w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-tight">
              ADP MCP
            </h1>
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Sacred Ledger</span>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group",
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600")} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-8 border-t border-gray-50">
        <button 
          onClick={() => {
            logout();
            onClose();
          }}
          className="flex items-center gap-3 px-4 py-3.5 w-full text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}

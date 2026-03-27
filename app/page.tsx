'use client';

import React from 'react';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { BaptismChart } from '@/components/dashboard/BaptismChart';
import { UpcomingServices } from '@/components/dashboard/UpcomingServices';
import { RecentRegistrations } from '@/components/dashboard/RecentRegistrations';
import { SeedButton } from '@/components/dashboard/SeedButton';
import { motion } from 'motion/react';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header>
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-gray-900 tracking-tight"
        >
          ADP Ministério Comunhão e Plenitude
        </motion.h2>
        <p className="text-gray-500 mt-1">Visão geral do ministério e crescimento espiritual.</p>
      </header>

      <StatsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <BaptismChart />
        </div>
        <div>
          <UpcomingServices />
        </div>
      </div>

      <RecentRegistrations />
      <SeedButton />
    </div>
  );
}

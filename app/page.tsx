'use client';

import React, { useEffect, useState } from 'react';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { BaptismChart } from '@/components/dashboard/BaptismChart';
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';
import { RecentRegistrations } from '@/components/dashboard/RecentRegistrations';
import { SeedButton } from '@/components/dashboard/SeedButton';
import { motion } from 'motion/react';
import { Edit2, Save, X, Loader2 } from 'lucide-react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function DashboardPage() {
  const [vision, setVision] = useState('2026, ANO DA PURIFICAÇÃO | LEVÍTICOS 18:1-6');
  const [isEditingVision, setIsEditingVision] = useState(false);
  const [tempVision, setTempVision] = useState('');
  const [loadingVision, setLoadingVision] = useState(true);
  const [savingVision, setSavingVision] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'year-vision'), (doc) => {
      if (doc.exists()) {
        setVision(doc.data().yearVision);
      }
      setLoadingVision(false);
    });
    return () => unsub();
  }, []);

  const handleSaveVision = async () => {
    setSavingVision(true);
    try {
      await setDoc(doc(db, 'settings', 'year-vision'), {
        yearVision: tempVision,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setIsEditingVision(false);
    } catch (error) {
      console.error('Error saving vision:', error);
    } finally {
      setSavingVision(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-gray-900 tracking-tight"
          >
            ADP Ministério Comunhão e Plenitude
          </motion.h2>
          <p className="text-gray-500 mt-1">Visão geral do ministério e crescimento espiritual.</p>
        </div>
        
        <div className="bg-blue-50 px-6 py-4 rounded-3xl border border-blue-100 relative group min-w-[300px]">
          {isEditingVision ? (
            <div className="flex items-center gap-2">
              <input 
                type="text"
                value={tempVision}
                onChange={(e) => setTempVision(e.target.value)}
                className="bg-white border-none rounded-xl px-3 py-1.5 text-sm font-bold text-blue-900 w-full focus:ring-2 focus:ring-blue-200"
                autoFocus
              />
              <button 
                onClick={handleSaveVision}
                disabled={savingVision}
                className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                {savingVision ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setIsEditingVision(false)}
                className="p-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Meta e Visão do Ano</p>
                <h4 className="text-sm font-black text-blue-900 tracking-tight uppercase">
                  {loadingVision ? 'Carregando...' : vision}
                </h4>
              </div>
              <button 
                onClick={() => {
                  setTempVision(vision);
                  setIsEditingVision(true);
                }}
                className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-100/50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      <StatsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <BaptismChart />
        </div>
        <div>
          <UpcomingEvents />
        </div>
      </div>

      <RecentRegistrations />
      <SeedButton />
    </div>
  );
}

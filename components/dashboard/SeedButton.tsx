'use client';

import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp, getDocs, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Database, Loader2, CheckCircle } from 'lucide-react';

export function SeedButton() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  const seedData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // Check if already seeded
      const q = query(collection(db, 'members'), limit(1));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setMessage({ type: 'info', text: 'Dados já existem no banco!' });
        setLoading(false);
        return;
      }

      // Seed Campuses
      const campuses = [
        { name: 'Sede Central', address: 'Av. Principal, 1000', pastorName: 'Pr. Ricardo Silva', memberCount: 850 },
        { name: 'Campus Norte', address: 'Rua das Flores, 450', pastorName: 'Pr. André Santos', memberCount: 320 },
      ];

      for (const campus of campuses) {
        await addDoc(collection(db, 'campuses'), campus);
      }

      // Seed Members
      const members = [
        { name: 'João Silva', email: 'joao@email.com', status: 'ativo', campusId: 'Sede Central', createdAt: serverTimestamp() },
        { name: 'Maria Santos', email: 'maria@email.com', status: 'ativo', campusId: 'Sede Central', createdAt: serverTimestamp() },
        { name: 'Pedro Oliveira', email: 'pedro@email.com', status: 'visitante', campusId: 'Campus Norte', createdAt: serverTimestamp() },
        { name: 'Ana Costa', email: 'ana@email.com', status: 'ativo', campusId: 'Campus Norte', createdAt: serverTimestamp() },
        { name: 'Lucas Ferreira', email: 'lucas@email.com', status: 'inativo', campusId: 'Sede Central', createdAt: serverTimestamp() },
      ];

      for (const member of members) {
        await addDoc(collection(db, 'members'), member);
      }

      setDone(true);
      setMessage({ type: 'success', text: 'Dados semeados com sucesso!' });
    } catch (error) {
      console.error('Error seeding data:', error);
      setMessage({ type: 'error', text: 'Erro ao semear dados. Verifique o console.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
      {message && (
        <div className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg animate-in fade-in slide-in-from-bottom-2 ${
          message.type === 'success' ? 'bg-emerald-500 text-white' : 
          message.type === 'error' ? 'bg-red-500 text-white' : 
          'bg-blue-500 text-white'
        }`}>
          {message.text}
        </div>
      )}
      <button
        onClick={seedData}
        disabled={loading || done}
        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold shadow-xl transition-all ${
          done 
            ? 'bg-emerald-500 text-white' 
            : 'bg-amber-500 text-white hover:bg-amber-600 active:scale-95'
        }`}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : done ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <Database className="w-5 h-5" />
        )}
        <span>{done ? 'Dados Semeados' : 'Semear Dados Iniciais'}</span>
      </button>
    </div>
  );
}

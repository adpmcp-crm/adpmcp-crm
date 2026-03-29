'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/providers/AuthProvider';
import { Download, Filter, MoreHorizontal, User } from 'lucide-react';
import { motion } from 'motion/react';

export function RecentRegistrations() {
  const { user, profile } = useAuth();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile?.campusId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'members'),
      where('campusId', '==', profile.campusId),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRegistrations(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching registrations:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, profile?.campusId]);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Registros Recentes</h3>
          <p className="text-sm text-gray-500">Últimos membros cadastrados</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors">
            <Filter className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Membro</th>
              <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Campus</th>
              <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Data</th>
              <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center text-gray-400">
                  Carregando registros...
                </td>
              </tr>
            ) : registrations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center text-gray-400">
                  Nenhum registro encontrado.
                </td>
              </tr>
            ) : (
              registrations.map((reg, index) => (
                <motion.tr 
                  key={reg.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                >
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{reg.name}</p>
                        <p className="text-xs text-gray-500">{reg.email || 'Sem e-mail'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-sm text-gray-600">{reg.campusId}</span>
                  </td>
                  <td className="px-8 py-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg ${
                      reg.status === 'ativo' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {reg.status}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-sm text-gray-500">
                      {reg.createdAt?.toDate ? reg.createdAt.toDate().toLocaleDateString('pt-BR') : 'Recente'}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { Users, Church, Briefcase, UserPlus, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebase } from '@/components/providers/FirebaseProvider';

export function StatsGrid() {
  const { user } = useFirebase();
  const [counts, setCounts] = useState({
    members: 0,
    team: 0,
    campuses: 0,
    departments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubMembers = onSnapshot(collection(db, 'members'), (snap) => {
      setCounts(prev => ({ ...prev, members: snap.size }));
    }, (err) => console.error("Stats members error:", err));

    const unsubTeam = onSnapshot(collection(db, 'team'), (snap) => {
      setCounts(prev => ({ ...prev, team: snap.size }));
    }, (err) => console.error("Stats team error:", err));

    const unsubCampuses = onSnapshot(collection(db, 'campuses'), (snap) => {
      setCounts(prev => ({ ...prev, campuses: snap.size }));
    }, (err) => console.error("Stats campuses error:", err));

    const unsubDepts = onSnapshot(collection(db, 'departments'), (snap) => {
      setCounts(prev => ({ ...prev, departments: snap.size }));
      setLoading(false);
    }, (err) => console.error("Stats depts error:", err));

    return () => {
      unsubMembers();
      unsubTeam();
      unsubCampuses();
      unsubDepts();
    };
  }, [user]);

  const stats = [
    { label: 'Total de Membros', value: counts.members.toString(), icon: Users, color: 'bg-blue-500' },
    { label: 'Igrejas', value: counts.campuses.toString(), icon: Church, color: 'bg-emerald-500' },
    { label: 'Departamentos', value: counts.departments.toString(), icon: Briefcase, color: 'bg-rose-500' },
    { label: 'Equipa Ministerial', value: counts.team.toString(), icon: UserPlus, color: 'bg-amber-500' },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm animate-pulse">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl mb-4" />
            <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
            <div className="h-8 bg-gray-100 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg shadow-gray-100 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
          <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
        </motion.div>
      ))}
    </div>
  );
}

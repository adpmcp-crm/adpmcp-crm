'use client';

import React, { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function BaptismChart() {
  const [mounted, setMounted] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);

    const q = query(
      collection(db, 'members'),
      where('baptismStatus', '==', 'Baptizado')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const members = snapshot.docs.map(doc => doc.data());
      
      // Group by month for the last 6 months
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const now = new Date();
      const last6Months: any[] = [];
      
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        last6Months.push({
          name: months[d.getMonth()],
          monthIndex: d.getMonth(),
          year: d.getFullYear(),
          batismos: 0
        });
      }

      members.forEach(member => {
        if (member.updatedAt) {
          const date = member.updatedAt.toDate ? member.updatedAt.toDate() : new Date(member.updatedAt);
          const m = date.getMonth();
          const y = date.getFullYear();
          
          const monthData = last6Months.find(lm => lm.monthIndex === m && lm.year === y);
          if (monthData) {
            monthData.batismos += 1;
          }
        }
      });

      setChartData(last6Months);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (!mounted || loading) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-[400px]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Crescimento de Batismos</h3>
            <p className="text-sm text-gray-500">Acompanhamento semestral</p>
          </div>
          <select className="bg-gray-50 border-none rounded-xl text-sm font-medium px-4 py-2 focus:ring-2 focus:ring-blue-100">
            <option>Últimos 6 meses</option>
            <option>Último ano</option>
          </select>
        </div>
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-[400px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Crescimento de Batismos</h3>
          <p className="text-sm text-gray-500">Acompanhamento semestral</p>
        </div>
        <select className="bg-gray-50 border-none rounded-xl text-sm font-medium px-4 py-2 focus:ring-2 focus:ring-blue-100">
          <option>Últimos 6 meses</option>
          <option>Último ano</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorBatismos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              borderRadius: '16px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
            }} 
          />
          <Area 
            type="monotone" 
            dataKey="batismos" 
            stroke="#3b82f6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorBatismos)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

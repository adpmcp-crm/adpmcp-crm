'use client';

import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Jan', batismos: 4 },
  { name: 'Fev', batismos: 7 },
  { name: 'Mar', batismos: 5 },
  { name: 'Abr', batismos: 12 },
  { name: 'Mai', batismos: 8 },
  { name: 'Jun', batismos: 15 },
];

export function BaptismChart() {
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

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

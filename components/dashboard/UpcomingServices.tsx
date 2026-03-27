'use client';

import React from 'react';
import { Calendar, Clock, User } from 'lucide-react';

const services = [
  { 
    title: 'Culto de Adoração', 
    date: 'Domingo, 18:00', 
    pastor: 'Pr. Ricardo Silva',
    type: 'Presencial',
    color: 'from-blue-500 to-blue-600'
  },
  { 
    title: 'Estudo Bíblico', 
    date: 'Quarta, 19:30', 
    pastor: 'Pr. André Santos',
    type: 'Online',
    color: 'from-purple-500 to-purple-600'
  },
  { 
    title: 'Culto de Jovens', 
    date: 'Sábado, 19:00', 
    pastor: 'Líder Marcos',
    type: 'Presencial',
    color: 'from-rose-500 to-rose-600'
  },
];

export function UpcomingServices() {
  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Próximos Cultos</h3>
      <div className="space-y-4">
        {services.map((service) => (
          <div 
            key={service.title}
            className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-100 transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-lg text-white bg-gradient-to-r ${service.color}`}>
                {service.type}
              </span>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {service.title}
            </h4>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{service.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{service.pastor}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

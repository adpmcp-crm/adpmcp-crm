'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Clock, User, Loader2 } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function UpcomingEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'activities'),
      where('status', '!=', 'Completed'),
      orderBy('status'),
      orderBy('month', 'asc'),
      orderBy('day', 'asc'),
      limit(3)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error('Error fetching upcoming events:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'from-blue-500 to-blue-600';
      case 'Next Week': return 'from-amber-500 to-amber-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-full">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Próximos Eventos</h3>
      
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      ) : events.length > 0 ? (
        <div className="space-y-4">
          {events.map((event) => (
            <div 
              key={event.id}
              className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-100 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-lg text-white bg-gradient-to-r ${getStatusColor(event.status)}`}>
                  {event.status === 'Confirmed' ? 'Confirmado' : event.status === 'Next Week' ? 'Próxima Semana' : 'Pendente'}
                </span>
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {event.title}
              </h4>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{event.day} de {event.month}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{event.department || 'Geral'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-sm text-gray-500">Nenhum evento próximo.</p>
        </div>
      )}
    </div>
  );
}

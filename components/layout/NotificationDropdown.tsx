'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Info, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, orderBy, limit, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebase } from '@/components/providers/FirebaseProvider';

export function NotificationDropdown() {
  const { user } = useFirebase();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    }, (error) => {
      console.error("Error fetching notifications:", error);
    });

    return () => {
      unsubscribe();
      setNotifications([]);
      setUnreadCount(0);
    };
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), {
        read: true
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            ></div>
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-80 bg-white rounded-[32px] shadow-2xl border border-gray-100 z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900">Notificações</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] font-bold text-blue-600 hover:underline"
                    >
                      Ler todas
                    </button>
                  )}
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                    {unreadCount} Novas
                  </span>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif, idx) => (
                    <div 
                      key={notif.id} 
                      onClick={() => !notif.read && markAsRead(notif.id)}
                      className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-4 cursor-pointer ${!notif.read ? 'bg-blue-50/30' : ''}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        notif.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                        notif.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {notif.type === 'success' ? <Check className="w-5 h-5" /> :
                         notif.type === 'warning' ? <AlertCircle className="w-5 h-5" /> :
                         <Info className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{notif.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          <Clock className="w-3 h-3" />
                          <span>{notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Agora'}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Bell className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Sem notificações no momento.</p>
                  </div>
                )}
              </div>

              <button className="w-full p-4 text-xs font-bold text-blue-600 hover:bg-gray-50 transition-colors border-t border-gray-50">
                Ver Todas as Notificações
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

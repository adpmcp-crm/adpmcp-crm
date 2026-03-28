'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Briefcase, 
  Loader2,
  Type,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity?: any;
}

export function ActivityModal({ isOpen, onClose, activity }: ActivityModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    month: 'Janeiro',
    day: '',
    year: new Date().getFullYear().toString(),
    department: '',
    location: '',
    status: 'Confirmed',
    successFeedback: '',
    failureFeedback: ''
  });

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  useEffect(() => {
    if (activity) {
      setFormData({
        title: activity.title || '',
        month: activity.month || 'Janeiro',
        day: activity.day || '',
        year: activity.year || new Date().getFullYear().toString(),
        department: activity.department || '',
        location: activity.location || '',
        status: activity.status || 'Confirmed',
        successFeedback: activity.successFeedback || '',
        failureFeedback: activity.failureFeedback || ''
      });
    } else {
      setFormData({
        title: '',
        month: 'Janeiro',
        day: '',
        year: new Date().getFullYear().toString(),
        department: '',
        location: '',
        status: 'Confirmed',
        successFeedback: '',
        failureFeedback: ''
      });
    }
  }, [activity, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        updatedAt: serverTimestamp(),
        createdAt: activity ? activity.createdAt : serverTimestamp()
      };

      if (activity?.id) {
        await updateDoc(doc(db, 'activities', activity.id), data);
      } else {
        await addDoc(collection(db, 'activities'), data);
      }
      onClose();
    } catch (error) {
      console.error('Error saving activity:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {activity ? 'Editar' : 'Nova'} Atividade
              </h3>
              <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                {/* Título */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Título da Atividade *</label>
                  <div className="relative group">
                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      required
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                      placeholder="Ex: Congresso de Jovens"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Mês */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Mês *</label>
                    <select 
                      value={formData.month}
                      onChange={e => setFormData({...formData, month: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm appearance-none"
                    >
                      {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  {/* Dia */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Dia *</label>
                    <input 
                      required
                      value={formData.day}
                      onChange={e => setFormData({...formData, day: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                      placeholder="Ex: 15"
                    />
                  </div>
                  {/* Ano */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Ano *</label>
                    <input 
                      required
                      value={formData.year}
                      onChange={e => setFormData({...formData, year: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                      placeholder="2024"
                    />
                  </div>
                </div>

                {/* Departamento */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Departamento</label>
                  <div className="relative group">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      value={formData.department}
                      onChange={e => setFormData({...formData, department: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                      placeholder="Ex: Jovens, Mulheres"
                    />
                  </div>
                </div>

                {/* Local */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Local</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                      placeholder="Ex: Templo Sede"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Status</label>
                  <div className="relative group">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <select 
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm appearance-none"
                    >
                      <option value="Confirmed">Confirmado</option>
                      <option value="Completed">Concluído</option>
                      <option value="Next Week">Próxima Semana</option>
                      <option value="Pending">Pendente</option>
                    </select>
                  </div>
                </div>

                {/* Feedback Fields (Only if Completed) */}
                {formData.status === 'Completed' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 pt-2"
                  >
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-emerald-600 uppercase tracking-wider ml-1">O que deu certo?</label>
                      <textarea 
                        value={formData.successFeedback}
                        onChange={e => setFormData({...formData, successFeedback: e.target.value})}
                        className="w-full bg-emerald-50/50 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-emerald-100 transition-all text-sm resize-none"
                        rows={2}
                        placeholder="Destaque os sucessos..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-red-600 uppercase tracking-wider ml-1">O que deu errado?</label>
                      <textarea 
                        value={formData.failureFeedback}
                        onChange={e => setFormData({...formData, failureFeedback: e.target.value})}
                        className="w-full bg-red-50/50 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-red-100 transition-all text-sm resize-none"
                        rows={2}
                        placeholder="Destaque as falhas..."
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-4 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Atividade'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

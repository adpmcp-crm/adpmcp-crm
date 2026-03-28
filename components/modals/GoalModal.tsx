'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: any;
}

export function GoalModal({ isOpen, onClose, goal }: GoalModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    target: 0,
    current: 0,
    category: 'Geral',
    year: new Date().getFullYear()
  });

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        target: goal.target || 0,
        current: goal.current || 0,
        category: goal.category || 'Geral',
        year: goal.year || new Date().getFullYear()
      });
    } else {
      setFormData({
        title: '',
        target: 0,
        current: 0,
        category: 'Geral',
        year: new Date().getFullYear()
      });
    }
  }, [goal, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (goal?.id) {
        await updateDoc(doc(db, 'goals', goal.id), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, 'goals'), {
          ...formData,
          createdAt: new Date().toISOString()
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving goal:', error);
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
            className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{goal ? 'Editar Meta' : 'Nova Meta Anual'}</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Título da Meta</label>
                <input 
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  placeholder="Ex: Baptizar 100 novos membros"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Alvo (Target)</label>
                  <input 
                    type="number"
                    required
                    value={formData.target}
                    onChange={e => setFormData({...formData, target: Number(e.target.value)})}
                    className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Progresso Atual</label>
                  <input 
                    type="number"
                    value={formData.current}
                    onChange={e => setFormData({...formData, current: Number(e.target.value)})}
                    className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Categoria</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  >
                    <option value="Geral">Geral</option>
                    <option value="Espiritual">Espiritual</option>
                    <option value="Social">Social</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Patrimonial">Patrimonial</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Ano</label>
                  <input 
                    type="number"
                    required
                    value={formData.year}
                    onChange={e => setFormData({...formData, year: Number(e.target.value)})}
                    className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  <span>{goal ? 'Atualizar Meta' : 'Salvar Meta'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Briefcase, 
  User, 
  Loader2,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  department?: any;
}

export function DepartmentModal({ isOpen, onClose, department }: DepartmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    leaderName: '',
    description: '',
    memberCount: 0,
    color: 'blue'
  });

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || '',
        leaderName: department.leaderName || '',
        description: department.description || '',
        memberCount: department.memberCount || 0,
        color: department.color || 'blue'
      });
    } else {
      setFormData({
        name: '',
        leaderName: '',
        description: '',
        memberCount: 0,
        color: 'blue'
      });
    }
  }, [department, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        updatedAt: serverTimestamp(),
        createdAt: department ? department.createdAt : serverTimestamp()
      };

      if (department?.id) {
        await updateDoc(doc(db, 'departments', department.id), data);
      } else {
        await addDoc(collection(db, 'departments'), data);
      }
      setMessage({ type: 'success', text: 'Salvo com sucesso!' });
      setTimeout(() => {
        onClose();
        setMessage(null);
      }, 1500);
    } catch (error) {
      console.error('Error saving department:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar. Verifique as permissões.' });
    } finally {
      setLoading(false);
    }
  };

  const colors = [
    { name: 'Azul', value: 'blue' },
    { name: 'Verde', value: 'emerald' },
    { name: 'Amarelo', value: 'amber' },
    { name: 'Vermelho', value: 'red' },
    { name: 'Roxo', value: 'purple' },
    { name: 'Rosa', value: 'pink' }
  ];

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
                {department ? 'Editar' : 'Novo'} Departamento
              </h3>
              <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {message && (
              <div className={`p-4 text-sm font-bold text-center ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                {/* Nome */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Nome do Departamento *</label>
                  <div className="relative group">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                      placeholder="Ex: Departamento de Jovens"
                    />
                  </div>
                </div>

                {/* Líder */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Líder Responsável *</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      required
                      value={formData.leaderName}
                      onChange={e => setFormData({...formData, leaderName: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                      placeholder="Nome do líder"
                    />
                  </div>
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Descrição</label>
                  <div className="relative group">
                    <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <textarea 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm min-h-[100px] resize-none"
                      placeholder="Breve descrição do departamento..."
                    />
                  </div>
                </div>

                {/* Cor */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Cor de Identificação</label>
                  <div className="grid grid-cols-6 gap-2">
                    {colors.map(color => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData({...formData, color: color.value})}
                        className={`w-full aspect-square rounded-xl border-2 transition-all ${
                          formData.color === color.value ? 'border-blue-600 scale-110 shadow-md' : 'border-transparent'
                        } bg-${color.value}-500`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
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
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Departamento'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
